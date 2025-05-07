// Particle Background
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: 0, y: 0 };

// Set canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle class
class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
  }

  update() {
    // React to mouse
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 100) {
      const force = (100 - distance) / 100;
      this.speedX -= dx * force * 0.02;
      this.speedY -= dy * force * 0.02;
    }

    // Update position
    this.x += this.speedX;
    this.y += this.speedY;

    // Bounce off edges
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }

  draw() {
    ctx.fillStyle = 'rgba(88, 199, 250, 0.5)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Initialize particles
function init() {
  particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
}

// Animation loop
function animate() {
  ctx.fillStyle = 'rgba(10, 10, 25, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animate);
}

// Track mouse movement
window.addEventListener('mousemove', (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});

// Modal functionality
const modal = document.getElementById('modal');

function openModal() {
  modal.classList.add('active');
  showSignup(); // Show signup form by default
}

function closeModal() {
  modal.classList.remove('active');
}

// Auth related functions
window.showLogin = function () {
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

window.showSignup = function () {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

window.handleSignup = function (event) {
  event.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  // Store user data (in a real app, this would be handled by a backend)
  localStorage.setItem('user', JSON.stringify({ username, email, password }));

  // Redirect to chatbot
  window.location.href = 'chatbot.html';
}

window.handleLogin = function (event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Simple validation (in a real app, this would be handled by a backend)
  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (storedUser && storedUser.email === email && storedUser.password === password) {
    window.location.href = 'chatbot.html';
  } else {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Invalid email or password';
    event.target.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
}

// Function to toggle password visibility
function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);
  const isPasswordVisible = passwordInput.getAttribute('type') === 'text'; // Check if password is currently visible
  passwordInput.setAttribute('type', isPasswordVisible ? 'password' : 'text'); // Toggle between password and text

  // Toggle the eye icon
  const eyeIcon = passwordInput.nextElementSibling;
  if (isPasswordVisible) {
    eyeIcon.classList.remove('fa-eye'); // Change to eye-slash icon
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    eyeIcon.classList.remove('fa-eye-slash'); // Change to eye icon
    eyeIcon.classList.add('fa-eye');
  }
}

function forgotPassword() {
  const email = prompt("Please enter your email address:");
  if (email) {
    // Here you would typically call Firebase's password reset function
    console.log("Password reset link sent to:", email);
    alert("A password reset link has been sent to your email address.");
  }
}

function logout() {
  localStorage.removeItem('userEmail');
  // Call signOut(auth) to log out from Firebase
}

// Initialize and start animation
init();
animate();

// Check if user is already logged in
window.onload = function () {
  const storedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
  if (storedEmail) {
    document.getElementById('loginEmail').value = storedEmail;
    // Uncomment the next line to auto-login
    // handleLogin(); 
  }
}