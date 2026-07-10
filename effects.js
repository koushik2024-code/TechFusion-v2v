/* ==========================================================================
   SHAKTHI SAFESPHERE - ADVANCED UI EFFECTS
   Mouse tracking, cursor spotlight, 3D card tilt, particle trails
   ========================================================================== */

(function () {
  'use strict';

  /* ── 1. CSS VARIABLE MOUSE TRACKER ─────────────────────────────────────── */
  // Updates --mouse-x / --mouse-y so CSS can react to cursor position
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth)  * 100;
    mouseY = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mouse-x', mouseX.toFixed(2) + '%');
    document.documentElement.style.setProperty('--mouse-y', mouseY.toFixed(2) + '%');

    // Move cursor spotlight
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top  = e.clientY + 'px';
  });

  /* ── 2. CURSOR SPOTLIGHT ────────────────────────────────────────────────── */
  const spotlight = document.createElement('div');
  spotlight.id = 'cursor-spotlight';
  spotlight.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle,
      hsla(190, 90%, 50%, 0.07) 0%,
      hsla(348, 100%, 61%, 0.04) 40%,
      transparent 70%
    );
    transition: left 0.08s ease-out, top 0.08s ease-out;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(spotlight);

  /* ── 3. 3D CARD TILT ON HOVER ───────────────────────────────────────────── */
  const TILT_INTENSITY = 8; // degrees max

  function applyTilt(card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      const rotateY =  dx * TILT_INTENSITY;
      const rotateX = -dy * TILT_INTENSITY;

      card.style.transform    = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
      card.style.transition   = 'box-shadow 0.2s';
      card.style.boxShadow    = `
        ${-rotateY * 1.5}px ${rotateX * 1.5}px 30px hsla(190,90%,50%,0.12),
        0 20px 60px rgba(0,0,0,0.4)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.25,0.8,0.25,1), box-shadow 0.5s';
      card.style.boxShadow  = '';
    });

    card.style.willChange        = 'transform';
    card.style.transformStyle    = 'preserve-3d';
    card.style.transitionTimingFunction = 'cubic-bezier(0.25,0.8,0.25,1)';
  }

  // Apply tilt to all glass cards
  function initTilt() {
    document.querySelectorAll('.glass-card').forEach(applyTilt);
  }

  /* ── 4. FLOATING PARTICLE CANVAS BACKGROUND ─────────────────────────────── */
  const canvas  = document.createElement('canvas');
  canvas.id     = 'bg-particles';
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.5;
  `;
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx    = canvas.getContext('2d');
  const COLORS = [
    'hsla(190, 90%, 60%, ',   // cyan
    'hsla(348, 100%, 65%, ',  // crimson
    'hsla(140, 71%, 55%, ',   // emerald
    'hsla(48, 100%, 65%, ',   // amber
  ];

  let particles = [];
  const PARTICLE_COUNT = 55;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x     = Math.random() * canvas.width;
      this.y     = init ? Math.random() * canvas.height : canvas.height + 10;
      this.vx    = (Math.random() - 0.5) * 0.3;
      this.vy    = -(Math.random() * 0.4 + 0.15);
      this.r     = Math.random() * 2.2 + 0.6;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.pulse = Math.random() * Math.PI * 2;
      this.life  = 0;
      this.maxLife = Math.random() * 300 + 200;
    }

    update(mx, my) {
      // Gentle drift toward cursor
      const dx = mx - this.x;
      const dy = my - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        this.vx += (dx / dist) * 0.008;
        this.vy += (dy / dist) * 0.008;
      }

      this.vx *= 0.98;
      this.vy *= 0.98;
      this.x  += this.vx;
      this.y  += this.vy;
      this.pulse += 0.03;
      this.life++;

      if (this.life > this.maxLife || this.y < -20) this.reset();
    }

    draw() {
      const pulsedAlpha = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + pulsedAlpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  let animMx = window.innerWidth  / 2;
  let animMy = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    animMx = e.clientX;
    animMy = e.clientY;
  });

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(animMx, animMy); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ── 5. BACKGROUND ORB PARALLAX ─────────────────────────────────────────── */
  const orbs = document.querySelectorAll('.bg-orb');
  document.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth  - 0.5);
    const ny = (e.clientY / window.innerHeight - 0.5);
    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 18;
      orb.style.transform = `translate(${nx * depth}px, ${ny * depth}px)`;
    });
  });

  /* ── INIT ───────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initTilt();
  });

  // Re-apply tilt when new cards appear (dynamic content)
  const observer = new MutationObserver(() => initTilt());
  observer.observe(document.body, { childList: true, subtree: true });

})();
