// ============================================
// Fireworks Animation System
// ============================================

const canvas = document.createElement("canvas");
canvas.className = "fireworks";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
let w, h;

class Firework {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.distance = Math.sqrt(
      Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2)
    );
    this.traveled = 0;
    this.coordinates = [];
    this.coordinateCount = 3;
    this.angle = Math.atan2(targetY - y, targetX - x);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = Math.random() * 50 + 50;
    
    // Blue color palette for New Year
    const colors = [
      { r: 74, g: 144, b: 226 },   // Blue
      { r: 93, g: 173, b: 226 },   // Light Blue
      { r: 52, g: 152, b: 219 },   // Bright Blue
      { r: 41, g: 128, b: 185 },   // Dark Blue
      { r: 135, g: 206, b: 250 }   // Sky Blue
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.coordinates.push([this.x, this.y]);
    
    if (this.coordinates.length > this.coordinateCount) {
      this.coordinates.shift();
    }

    this.speed *= this.acceleration;
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;
    this.traveled = Math.sqrt(
      Math.pow(this.x - this.startX, 2) + Math.pow(this.y - this.startY, 2)
    );

    if (this.traveled >= this.distance - 5) {
      return true; // Reached target
    } else {
      this.x += vx;
      this.y += vy;
    }
    return false;
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1]
    );
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.coordinates = [];
    this.coordinateCount = 5;
    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }
    this.angle = (Math.PI * 2 * Math.random());
    this.speed = Math.random() * 10 + 5;
    this.friction = 0.95;
    this.gravity = 1;
    this.hue = color;
    this.brightness = Math.random() * 50 + 50;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.005;
  }

  update() {
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;
    
    return this.alpha > 0;
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1]
    );
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

let fireworks = [];
let particles = [];
let animationId = null;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function launch() {
  const x = Math.random() * w;
  const y = h;
  const targetX = Math.random() * w;
  const targetY = Math.random() * (h * 0.5);
  
  fireworks.push(new Firework(x, y, targetX, targetY));
}

function explode(firework) {
  const particleCount = 30;
  // Blue hues for particles
  const hues = [200, 210, 220, 230, 240]; // Blue color range
  const hue = hues[Math.floor(Math.random() * hues.length)];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(firework.x, firework.y, hue));
  }
}

function animate() {
  ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
  ctx.fillRect(0, 0, w, h);

  // Update and draw fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const firework = fireworks[i];
    firework.draw();
    
    if (firework.update()) {
      explode(firework);
      fireworks.splice(i, 1);
    }
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.draw();
    
    if (!particle.update()) {
      particles.splice(i, 1);
    }
  }

  animationId = requestAnimationFrame(animate);
}

// Start fireworks
function startFireworks() {
  // Launch initial fireworks
  for (let i = 0; i < 3; i++) {
    setTimeout(() => launch(), i * 500);
  }
  
  // Continue launching fireworks periodically
  setInterval(() => {
    if (Math.random() > 0.5) {
      launch();
    }
  }, 2000);
  
  animate();
}

startFireworks();

// Background music controls
const bgm = new Audio();
bgm.src = 'assets/bgm.mp3';
bgm.loop = true;
bgm.volume = 0.28;
bgm.preload = 'auto';
let musicPlaying = false;

function updateMusicButton() {
  const btn = document.getElementById('music-toggle');
  if (!btn) return;
  btn.textContent = musicPlaying ? '🔊 Music ON' : '🔈 Music OFF';
  btn.setAttribute('aria-pressed', musicPlaying ? 'true' : 'false');
}

function playMusic() {
  bgm.play().then(() => {
    musicPlaying = true;
    updateMusicButton();
    localStorage.setItem('bgmPlaying', '1');
  }).catch(() => {
    // Autoplay blocked; wait for user interaction
    musicPlaying = false;
    updateMusicButton();
  });
}

function pauseMusic() {
  bgm.pause();
  musicPlaying = false;
  updateMusicButton();
  localStorage.setItem('bgmPlaying', '0');
}

function toggleMusic() {
  if (musicPlaying) pauseMusic(); else playMusic();
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('music-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    toggleMusic();
  });

  // Restore preference if user previously enabled music
  const saved = localStorage.getItem('bgmPlaying');
  if (saved === '1') {
    // Many browsers block autoplay; try to play on first user gesture
    const tryPlay = () => {
      playMusic();
      window.removeEventListener('click', tryPlay);
    };
    window.addEventListener('click', tryPlay);
  } else {
    updateMusicButton();
  }
});