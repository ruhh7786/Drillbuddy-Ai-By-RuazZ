// Neural Network Animation
const canvas = document.getElementById('neural-network');
const ctx = canvas.getContext('2d');

// Set canvas size
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Node class
class Node {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        // Main node
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 242, 0.8)';
        ctx.fill();
        
        // Outer glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.x, this.y, this.radius,
            this.x, this.y, this.radius + 4
        );
        gradient.addColorStop(0, 'rgba(0, 255, 242, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 242, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
    }
}

// Network setup
const nodes = [];
const nodeCount = 50;
const connectionDistance = 150;

for (let i = 0; i < nodeCount; i++) {
    nodes.push(new Node());
}

// Animation function
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw nodes
    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    // Draw connections
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                const opacity = 1 - (distance / connectionDistance);
                const gradient = ctx.createLinearGradient(
                    nodes[i].x, nodes[i].y, 
                    nodes[j].x, nodes[j].y
                );
                gradient.addColorStop(0, `rgba(180, 0, 255, ${opacity * 0.5})`);
                gradient.addColorStop(0.5, `rgba(0, 255, 242, ${opacity * 0.6})`);
                gradient.addColorStop(1, `rgba(180, 0, 255, ${opacity * 0.5})`);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1.5;
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
            }
        }
    }
    ctx.stroke();

    requestAnimationFrame(animate);
}

// Mouse interaction
let mouse = { x: null, y: null };
const mouseRadius = 150;

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Affect nearby nodes
    nodes.forEach(node => {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRadius) {
            const force = (mouseRadius - distance) / mouseRadius;
            node.vx -= dx * force * 0.02;
            node.vy -= dy * force * 0.02;
        }
    });
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Generate particles
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random animation duration
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
        
        // Random animation delay
        particle.style.animationDelay = (Math.random() * 10) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// Start animations
window.addEventListener('load', () => {
    createParticles();
    animate();
}); 