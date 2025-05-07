// Enhanced Neural Network Animation
// Use a unique variable name to avoid conflicts with other scripts
const neuralCanvas = document.getElementById('neural-network');
const neuralCtx = neuralCanvas.getContext('2d');

// Network setup
const networkNodes = [];
let nodeCount = 60; // Default, will be updated in updateNetworkSettings()
let connectionDistance = 150; // Default, will be updated in updateNetworkSettings()
const dataTransfers = [];

// Set canvas size with higher resolution for retina displays
function setCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    neuralCanvas.width = displayWidth * dpr;
    neuralCanvas.height = displayHeight * dpr;

    neuralCanvas.style.width = `${displayWidth}px`;
    neuralCanvas.style.height = `${displayHeight}px`;

    neuralCtx.scale(dpr, dpr);

    // Update node count and connection distance based on screen size
    updateNetworkSettings();
}

// Responsive settings based on screen size
function updateNetworkSettings() {
    // Clear existing nodes
    networkNodes.length = 0;

    // Set appropriate values based on screen size
    if (window.innerWidth < 768) {
        // Mobile
        nodeCount = 40;
        connectionDistance = 120;
    } else if (window.innerWidth < 1200) {
        // Tablet
        nodeCount = 60;
        connectionDistance = 150;
    } else {
        // Desktop
        nodeCount = 80;
        connectionDistance = 180;
    }

    // Create new nodes with updated settings
    for (let i = 0; i < nodeCount; i++) {
        networkNodes.push(new Node());
    }
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Enhanced Node class with cyberpunk features
class Node {
    constructor() {
        // Position with slight clustering tendency
        const centerBias = Math.random() > 0.7 ? 0.5 : 0;
        this.x = Math.random() * neuralCanvas.width / (window.devicePixelRatio || 1);
        this.y = Math.random() * neuralCanvas.height / (window.devicePixelRatio || 1);

        if (centerBias) {
            const centerX = neuralCanvas.width / (2 * (window.devicePixelRatio || 1));
            const centerY = neuralCanvas.height / (2 * (window.devicePixelRatio || 1));
            this.x = this.x * 0.5 + centerX * 0.5;
            this.y = this.y * 0.5 + centerY * 0.5;
        }

        // More controlled velocity
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;

        // Variable sizing
        this.radius = Math.random() * 1.5 + 1.2;

        // Pulse effect properties
        this.pulseRadius = this.radius;
        this.maxPulseRadius = this.radius + Math.random() * 2.5;
        this.pulseSpeed = 0.03 + Math.random() * 0.03;
        this.pulseDirection = Math.random() > 0.5 ? 1 : -1;

        // Random color assignment for more visual interest
        this.colorType = Math.random() > 0.3 ? 'cyan' : 'purple';
        this.color = this.colorType === 'cyan'
            ? 'rgba(34, 211, 238, 0.8)'  // Cyan
            : 'rgba(79, 70, 229, 0.8)'; // Purple

        this.glowColor = this.colorType === 'cyan'
            ? 'rgba(34, 211, 238, 0.4)'  // Cyan glow
            : 'rgba(79, 70, 229, 0.4)'; // Purple glow

        // Glow intensity that changes over time
        this.glowIntensity = 0.5 + Math.random() * 0.5;
        this.glowSpeed = 0.005 + Math.random() * 0.01;
        this.glowDirection = Math.random() > 0.5 ? 1 : -1;

        // Activity level (some nodes are more "active" than others)
        this.activityLevel = Math.random();

        // For data transfer effects
        this.isActive = false;
        this.activationDuration = 0;
        this.maxActivationDuration = Math.random() * 30 + 20;
    }

    update() {
        // Update position with velocity
        this.x += this.vx;
        this.y += this.vy;

        // Add slight random movement for more organic feel
        this.vx += (Math.random() - 0.5) * 0.02 * this.activityLevel;
        this.vy += (Math.random() - 0.5) * 0.02 * this.activityLevel;

        // Dampen velocity to prevent extreme movement
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Bounce off canvas edges with slight inward push
        const buffer = 10;
        if (this.x < buffer) {
            this.x = buffer;
            this.vx = Math.abs(this.vx) * 0.8;
        } else if (this.x > neuralCanvas.width / (window.devicePixelRatio || 1) - buffer) {
            this.x = neuralCanvas.width / (window.devicePixelRatio || 1) - buffer;
            this.vx = -Math.abs(this.vx) * 0.8;
        }

        if (this.y < buffer) {
            this.y = buffer;
            this.vy = Math.abs(this.vy) * 0.8;
        } else if (this.y > neuralCanvas.height / (window.devicePixelRatio || 1) - buffer) {
            this.y = neuralCanvas.height / (window.devicePixelRatio || 1) - buffer;
            this.vy = -Math.abs(this.vy) * 0.8;
        }

        // Pulse effect animation
        this.pulseRadius += this.pulseSpeed * this.pulseDirection;
        if (this.pulseRadius > this.maxPulseRadius) {
            this.pulseRadius = this.maxPulseRadius;
            this.pulseDirection = -1;
        } else if (this.pulseRadius < this.radius) {
            this.pulseRadius = this.radius;
            this.pulseDirection = 1;
        }

        // Glow intensity animation
        this.glowIntensity += this.glowSpeed * this.glowDirection;
        if (this.glowIntensity > 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity < 0.5) {
            this.glowIntensity = 0.5;
            this.glowDirection = 1;
        }

        // Handle activation state
        if (this.isActive) {
            this.activationDuration++;
            if (this.activationDuration > this.maxActivationDuration) {
                this.isActive = false;
                this.activationDuration = 0;
            }
        }
    }

    // Method to activate the node (called when a data transfer passes through it)
    activate() {
        this.isActive = true;
        this.activationDuration = 0;
    }

    draw() {
        // Main node
        neuralCtx.beginPath();
        neuralCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        // If node is active, make it brighter
        if (this.isActive) {
            neuralCtx.fillStyle = this.colorType === 'cyan'
                ? 'rgba(34, 211, 238, 0.9)'  // Bright cyan
                : 'rgba(79, 70, 229, 0.9)'; // Bright purple
        } else {
            neuralCtx.fillStyle = this.color;
        }
        neuralCtx.fill();

        // Inner bright core
        neuralCtx.beginPath();
        neuralCtx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        neuralCtx.fillStyle = this.colorType === 'cyan'
            ? 'rgba(34, 211, 238, 0.9)'  // Bright cyan
            : 'rgba(79, 70, 229, 0.9)'; // Bright purple
        neuralCtx.fill();

        // Outer pulse glow
        neuralCtx.beginPath();
        neuralCtx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2);
        const pulseGradient = neuralCtx.createRadialGradient(
            this.x, this.y, this.radius,
            this.x, this.y, this.pulseRadius + 3
        );

        const glowMultiplier = this.isActive ? 0.8 : 0.4;
        const adjustedGlowColor = this.colorType === 'cyan'
            ? `rgba(34, 211, 238, ${this.glowIntensity * glowMultiplier})`
            : `rgba(79, 70, 229, ${this.glowIntensity * glowMultiplier})`;

        pulseGradient.addColorStop(0, adjustedGlowColor);
        pulseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        neuralCtx.fillStyle = pulseGradient;
        neuralCtx.fill();

        // Additional highlight for more active nodes
        if (this.isActive || this.activityLevel > 0.7) {
            neuralCtx.beginPath();
            neuralCtx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
            const highlightGradient = neuralCtx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius * 1.5
            );

            const highlightIntensity = this.isActive ? 0.5 : 0.3;
            highlightGradient.addColorStop(0, this.colorType === 'cyan'
                ? `rgba(34, 211, 238, ${this.glowIntensity * highlightIntensity})`
                : `rgba(79, 70, 229, ${this.glowIntensity * highlightIntensity})`
            );
            highlightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            neuralCtx.fillStyle = highlightGradient;
            neuralCtx.fill();
        }
    }
}

// Class for data transfers between nodes
class DataTransfer {
    constructor(startNode, endNode) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.progress = 0;
        this.speed = Math.random() * 0.01 + 0.005; // Speed of data packet
        this.size = Math.random() * 2 + 2; // Size of data packet
        this.complete = false;

        // Use the color of the start node
        this.color = startNode.colorType === 'cyan' ? 'rgba(34, 211, 238, 0.9)' : 'rgba(79, 70, 229, 0.9)';
        this.trailColor = startNode.colorType === 'cyan' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(79, 70, 229, 0.2)';
    }

    update() {
        if (this.complete) return;

        this.progress += this.speed;

        // When reaching the end node, mark as complete and activate the end node
        if (this.progress >= 1) {
            this.progress = 1;
            this.complete = true;
            this.endNode.activate();
        }
    }

    draw() {
        if (this.complete) return;

        // Calculate current position
        const x = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress;
        const y = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress;

        // Draw data packet
        neuralCtx.beginPath();
        neuralCtx.arc(x, y, this.size, 0, Math.PI * 2);
        neuralCtx.fillStyle = this.color;
        neuralCtx.fill();

        // Draw glow around packet
        neuralCtx.beginPath();
        neuralCtx.arc(x, y, this.size * 2, 0, Math.PI * 2);
        const gradient = neuralCtx.createRadialGradient(
            x, y, this.size,
            x, y, this.size * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        neuralCtx.fillStyle = gradient;
        neuralCtx.fill();

        // Draw trail
        const trailLength = 0.1; // Length of trail as percentage of total distance
        if (this.progress > trailLength) {
            const trailStartProgress = this.progress - trailLength;
            const trailStartX = this.startNode.x + (this.endNode.x - this.startNode.x) * trailStartProgress;
            const trailStartY = this.startNode.y + (this.endNode.y - this.startNode.y) * trailStartProgress;

            neuralCtx.beginPath();
            neuralCtx.moveTo(trailStartX, trailStartY);
            neuralCtx.lineTo(x, y);
            neuralCtx.strokeStyle = this.trailColor;
            neuralCtx.lineWidth = this.size;
            neuralCtx.stroke();
        }
    }
}

// Function to create data transfers between random nodes
function createDataTransfer() {
    if (networkNodes.length < 2) return;

    // Select two random nodes that are within the connection distance
    let attempts = 0;
    let startNodeIndex, endNodeIndex;
    let validPair = false;

    while (!validPair && attempts < 20) {
        startNodeIndex = Math.floor(Math.random() * networkNodes.length);
        endNodeIndex = Math.floor(Math.random() * networkNodes.length);

        if (startNodeIndex !== endNodeIndex) {
            const startNode = networkNodes[startNodeIndex];
            const endNode = networkNodes[endNodeIndex];
            const dx = startNode.x - endNode.x;
            const dy = startNode.y - endNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                validPair = true;
                startNode.activate(); // Activate the start node
                dataTransfers.push(new DataTransfer(startNode, endNode));
            }
        }

        attempts++;
    }
}

// Animation function
function animate() {
    // Semi-transparent clearing for motion trail effect
    neuralCtx.fillStyle = 'rgba(7, 7, 21, 0.12)';
    neuralCtx.fillRect(0, 0, neuralCanvas.width / (window.devicePixelRatio || 1), neuralCanvas.height / (window.devicePixelRatio || 1));

    // Draw connections first (behind nodes)
    neuralCtx.beginPath();
    for (let i = 0; i < networkNodes.length; i++) {
        for (let j = i + 1; j < networkNodes.length; j++) {
            const dx = networkNodes[i].x - networkNodes[j].x;
            const dy = networkNodes[i].y - networkNodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                // Calculate opacity based on distance
                const opacity = Math.pow(1 - (distance / connectionDistance), 2) * 0.8;

                // Create gradient color based on node types
                let gradient;

                if (networkNodes[i].isActive || networkNodes[j].isActive) {
                    // Create brighter connection if either node is active
                    gradient = neuralCtx.createLinearGradient(
                        networkNodes[i].x, networkNodes[i].y,
                        networkNodes[j].x, networkNodes[j].y
                    );

                    const color1 = networkNodes[i].colorType === 'cyan' ? 'rgba(34, 211, 238, ' : 'rgba(79, 70, 229, ';
                    const color2 = networkNodes[j].colorType === 'cyan' ? 'rgba(34, 211, 238, ' : 'rgba(79, 70, 229, ';

                    gradient.addColorStop(0, `${color1}${opacity * 1.5})`);
                    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.5})`);
                    gradient.addColorStop(1, `${color2}${opacity * 1.5})`);
                } else {
                    // Standard connection
                    gradient = neuralCtx.createLinearGradient(
                        networkNodes[i].x, networkNodes[i].y,
                        networkNodes[j].x, networkNodes[j].y
                    );

                    // Get colors from node types
                    const color1 = networkNodes[i].colorType === 'cyan' ? 'rgba(34, 211, 238, ' : 'rgba(79, 70, 229, ';
                    const color2 = networkNodes[j].colorType === 'cyan' ? 'rgba(34, 211, 238, ' : 'rgba(79, 70, 229, ';

                    gradient.addColorStop(0, `${color1}${opacity * 0.7})`);
                    gradient.addColorStop(1, `${color2}${opacity * 0.7})`);
                }

                neuralCtx.strokeStyle = gradient;
                neuralCtx.lineWidth = Math.min(opacity * 2, 1.5); // Dynamic line width
                neuralCtx.moveTo(networkNodes[i].x, networkNodes[i].y);
                neuralCtx.lineTo(networkNodes[j].x, networkNodes[j].y);
            }
        }
    }
    neuralCtx.stroke();

    // Update and draw nodes
    networkNodes.forEach(node => {
        node.update();
        node.draw();
    });

    // Update and draw data transfers
    for (let i = dataTransfers.length - 1; i >= 0; i--) {
        dataTransfers[i].update();
        dataTransfers[i].draw();
        // Remove completed transfers
        if (dataTransfers[i].complete) {
            dataTransfers.splice(i, 1);
        }
    }

    // Randomly create new data transfers
    if (Math.random() < 0.05) {
        createDataTransfer();
    }

    // Continue animation
    requestAnimationFrame(animate);
}

// Start the animation
animate();

// Create initial particles
function createParticles() {
    updateNetworkSettings();
}

createParticles();