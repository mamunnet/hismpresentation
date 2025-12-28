/* ============================================
   CONFIGURATION
   ============================================ */
const TOTAL_SLIDES = 9;
let currentSlide = 0;
let presentationStarted = false;
let isScanning = false;

const slides = document.querySelectorAll('.slide');
const loader = document.getElementById('loader');
const fingerprintArea = document.getElementById('fingerprint-area');
const scanStatus = document.getElementById('scan-status');
const scanStatusEn = document.getElementById('scan-status-en');
const accessBadge = document.getElementById('access-badge');
const progressFill = document.getElementById('progress');
const bgm = document.getElementById('bgm');
const curtain = document.getElementById('curtain');

/* ============================================
   FINGERPRINT SCANNER
   ============================================ */
fingerprintArea.addEventListener('click', startScan);
fingerprintArea.addEventListener('touchstart', startScan);

function startScan(e) {
    e.preventDefault();
    if (isScanning || presentationStarted) return;

    isScanning = true;

    // Start scanning animation
    fingerprintArea.classList.add('scanning');
    scanStatus.textContent = 'স্ক্যান হচ্ছে...';
    scanStatusEn.textContent = 'SCANNING...';

    // Simulate scanning - 3 seconds
    setTimeout(() => {
        // Scan complete
        fingerprintArea.classList.remove('scanning');
        fingerprintArea.classList.add('verified');

        scanStatus.textContent = 'যাচাইকৃত ✓';
        scanStatus.style.color = '#00ff88';
        scanStatusEn.textContent = 'IDENTITY VERIFIED';
        scanStatusEn.style.color = '#00ff88';

        // Show ACCESS GRANTED badge
        accessBadge.classList.add('show');

        // Start background music
        if (bgm) {
            bgm.volume = 0.3;
            bgm.play().catch(() => { });
        }

        // Wait 2 seconds, then open curtain and start
        setTimeout(() => {
            startPresentation();
        }, 2000);

    }, 3000);
}

function startPresentation() {
    // Hide loader
    loader.classList.add('hidden');

    // OPEN the curtain (remove closed class) - dramatic reveal!
    if (curtain) {
        setTimeout(() => {
            curtain.classList.remove('closed');
        }, 300);
    }

    // Mark as started
    presentationStarted = true;

    // Activate first slide
    activateSlide(0);
}

/* ============================================
   NAVIGATION
   ============================================ */
function nextSlide() {
    if (!presentationStarted) return;

    if (currentSlide < slides.length - 1) {
        slides[currentSlide].classList.remove('active');
        currentSlide++;
        slides[currentSlide].classList.add('active');
        updateProgress();
    } else if (currentSlide === slides.length - 1) {
        // Last slide - close curtain for finale
        closeCurtain();
    }
}

function prevSlide() {
    if (!presentationStarted) return;

    if (currentSlide > 0) {
        slides[currentSlide].classList.remove('active');
        currentSlide--;
        slides[currentSlide].classList.add('active');
        updateProgress();
    }
}

function closeCurtain() {
    if (curtain) {
        curtain.classList.add('closed');
        document.querySelector('.navigation-overlay').style.opacity = '0';
        startCurtainSparkle();
    }
}

function activateSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    currentSlide = index;
    updateProgress();
}

function updateProgress() {
    const percent = ((currentSlide + 1) / TOTAL_SLIDES) * 100;
    if (progressFill) {
        progressFill.style.width = `${percent}%`;
    }
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (!presentationStarted) return;

    if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'ArrowDown' || e.code === 'Enter') {
        e.preventDefault();
        nextSlide();
    } else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
    }
});

// Click Navigation
document.addEventListener('click', (e) => {
    if (!presentationStarted) return;
    if (e.target.closest('#loader')) return;
    if (e.target.closest('.fingerprint-area')) return;

    nextSlide();
});

/* ============================================
   PARTICLE BACKGROUND
   ============================================ */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: null, y: null };

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
resize();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 2.5 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
        const colors = ['255, 215, 0', '218, 165, 32', '255, 193, 37', '184, 134, 11'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.vx -= (dx / dist) * force * 0.2;
                this.vy -= (dy / dist) * force * 0.2;
            }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.99;
        this.vy *= 0.99;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        this.alpha += (Math.random() - 0.5) * 0.02;
        if (this.alpha < 0.1) this.alpha = 0.1;
        if (this.alpha > 0.7) this.alpha = 0.7;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${this.color}, 0.4)`;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(150, Math.floor((width * height) / 10000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const opacity = (1 - distance / 100) * 0.12;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

/* ============================================
   CURTAIN SPARKLE EFFECT
   ============================================ */
let curtainSparkles = [];
let curtainCanvas = null;
let curtainCtx = null;

function startCurtainSparkle() {
    curtainCanvas = document.getElementById('curtain-sparkle');
    if (!curtainCanvas) return;

    curtainCtx = curtainCanvas.getContext('2d');
    curtainCanvas.width = window.innerWidth;
    curtainCanvas.height = window.innerHeight;

    curtainSparkles = [];
    for (let i = 0; i < 80; i++) {
        curtainSparkles.push({
            x: Math.random() * curtainCanvas.width,
            y: Math.random() * curtainCanvas.height,
            size: Math.random() * 3 + 1,
            alpha: Math.random(),
            speed: Math.random() * 1.5 + 0.5,
            direction: Math.random() * Math.PI * 2
        });
    }

    animateCurtainSparkle();
}

function animateCurtainSparkle() {
    if (!curtainCtx || !curtainCanvas) return;

    curtainCtx.clearRect(0, 0, curtainCanvas.width, curtainCanvas.height);

    curtainSparkles.forEach(s => {
        s.alpha += (Math.random() - 0.5) * 0.08;
        if (s.alpha < 0) s.alpha = 0;
        if (s.alpha > 1) s.alpha = 1;

        s.y -= 0.5;
        s.x += Math.sin(s.direction) * 0.3;

        if (s.y < 0) {
            s.y = curtainCanvas.height;
            s.x = Math.random() * curtainCanvas.width;
        }

        curtainCtx.beginPath();
        curtainCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        curtainCtx.fillStyle = `rgba(255, 215, 0, ${s.alpha * 0.6})`;
        curtainCtx.shadowBlur = 12;
        curtainCtx.shadowColor = 'rgba(255, 215, 0, 0.7)';
        curtainCtx.fill();
        curtainCtx.shadowBlur = 0;
    });

    requestAnimationFrame(animateCurtainSparkle);
}

window.addEventListener('resize', () => {
    if (curtainCanvas) {
        curtainCanvas.width = window.innerWidth;
        curtainCanvas.height = window.innerHeight;
    }
});
