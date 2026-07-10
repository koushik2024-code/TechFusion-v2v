/* ==========================================================================
   SHAKTHI SAFESPHERE - ADVANCED UI EFFECTS v3.0
   Custom circle cursor, mouse tracking, 3D card tilt, floating particles
   ========================================================================== */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════════
     1. CUSTOM CIRCLE CURSOR
     - Small dot follows mouse exactly
     - Large ring follows with elastic lag
     - Morphs color + size on hover over interactive elements
  ══════════════════════════════════════════════════════════════════════════ */

  // Hide default cursor everywhere
  const cursorStyle = document.createElement('style');
  cursorStyle.textContent = `
    *, *::before, *::after { cursor: none !important; }
  `;
  document.head.appendChild(cursorStyle);

  // Create cursor dot (exact position)
  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  Object.assign(dot.style, {
    position:        'fixed',
    top:             '0',
    left:            '0',
    width:           '8px',
    height:          '8px',
    borderRadius:    '50%',
    background:      'hsl(190, 90%, 65%)',
    boxShadow:       '0 0 10px hsl(190, 90%, 65%), 0 0 20px hsla(190,90%,65%,0.5)',
    pointerEvents:   'none',
    zIndex:          '99999',
    transform:       'translate(-50%, -50%)',
    transition:      'width 0.2s, height 0.2s, background 0.2s, box-shadow 0.2s',
    willChange:      'transform',
  });

  // Create cursor ring (lags behind with elastic motion)
  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  Object.assign(ring.style, {
    position:        'fixed',
    top:             '0',
    left:            '0',
    width:           '40px',
    height:          '40px',
    borderRadius:    '50%',
    border:          '1.5px solid hsla(190, 90%, 65%, 0.7)',
    boxShadow:       '0 0 12px hsla(190,90%,65%,0.25), inset 0 0 8px hsla(190,90%,65%,0.08)',
    background:      'hsla(190, 90%, 65%, 0.04)',
    pointerEvents:   'none',
    zIndex:          '99998',
    transform:       'translate(-50%, -50%)',
    transition:      'width 0.35s cubic-bezier(0.25,0.8,0.25,1), height 0.35s cubic-bezier(0.25,0.8,0.25,1), border-color 0.3s, box-shadow 0.3s, background 0.3s',
    willChange:      'transform',
    backdropFilter:  'blur(1px)',
  });

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  // Track exact cursor position
  let dotX = 0, dotY = 0;
  let ringX = window.innerWidth / 2, ringY = window.innerHeight / 2;
  let isHovering = false;
  let isClicking = false;

  document.addEventListener('mousemove', (e) => {
    dotX = e.clientX;
    dotY = e.clientY;

    // Dot snaps immediately
    dot.style.left = dotX + 'px';
    dot.style.top  = dotY + 'px';

    // Update mouse-x/y CSS vars for background
    document.documentElement.style.setProperty('--mouse-x', (e.clientX / window.innerWidth * 100).toFixed(2) + '%');
    document.documentElement.style.setProperty('--mouse-y', (e.clientY / window.innerHeight * 100).toFixed(2) + '%');

    // Move spotlight
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top  = e.clientY + 'px';
  });

  // Elastic ring animation loop
  function animateRing() {
    // Lerp ring toward dot position
    const ease = isHovering ? 0.10 : 0.14;
    ringX += (dotX - ringX) * ease;
    ringY += (dotY - ringY) * ease;

    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    requestAnimationFrame(animateRing);
  }
  animateRing();

  // ── Hover state detection ─────────────────────────────────────────────────
  const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"], .glass-card, .action-icon, .action-trigger-btn, .action-toggle-btn, .hazard-opt, .contact-card';

  function setCursorState(type) {
    if (type === 'hover-btn') {
      // Crimson ring for buttons
      ring.style.width          = '52px';
      ring.style.height         = '52px';
      ring.style.borderColor    = 'hsla(348, 100%, 65%, 0.85)';
      ring.style.boxShadow      = '0 0 18px hsla(348,100%,65%,0.35), inset 0 0 10px hsla(348,100%,65%,0.08)';
      ring.style.background     = 'hsla(348, 100%, 65%, 0.06)';
      dot.style.width           = '5px';
      dot.style.height          = '5px';
      dot.style.background      = 'hsl(348, 100%, 70%)';
      dot.style.boxShadow       = '0 0 10px hsl(348,100%,70%), 0 0 24px hsla(348,100%,70%,0.5)';
    } else if (type === 'hover-card') {
      // Cyan ring for cards
      ring.style.width          = '64px';
      ring.style.height         = '64px';
      ring.style.borderColor    = 'hsla(190, 90%, 60%, 0.7)';
      ring.style.boxShadow      = '0 0 22px hsla(190,90%,60%,0.3), inset 0 0 12px hsla(190,90%,60%,0.06)';
      ring.style.background     = 'hsla(190, 90%, 60%, 0.04)';
      dot.style.width           = '5px';
      dot.style.height          = '5px';
      dot.style.background      = 'hsl(190, 90%, 70%)';
      dot.style.boxShadow       = '0 0 10px hsl(190,90%,70%), 0 0 20px hsla(190,90%,70%,0.4)';
    } else {
      // Default cyan
      ring.style.width          = '40px';
      ring.style.height         = '40px';
      ring.style.borderColor    = 'hsla(190, 90%, 65%, 0.7)';
      ring.style.boxShadow      = '0 0 12px hsla(190,90%,65%,0.25), inset 0 0 8px hsla(190,90%,65%,0.08)';
      ring.style.background     = 'hsla(190, 90%, 65%, 0.04)';
      dot.style.width           = '8px';
      dot.style.height          = '8px';
      dot.style.background      = 'hsl(190, 90%, 65%)';
      dot.style.boxShadow       = '0 0 10px hsl(190, 90%, 65%), 0 0 20px hsla(190,90%,65%,0.5)';
    }
  }

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(INTERACTIVE);
    if (!target) { setCursorState('default'); isHovering = false; return; }
    isHovering = true;
    if (target.matches('button, a, .action-trigger-btn, .action-toggle-btn, .hazard-opt')) {
      setCursorState('hover-btn');
    } else {
      setCursorState('hover-card');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest(INTERACTIVE)) {
      setCursorState('default');
      isHovering = false;
    }
  });

  // Click pulse effect
  document.addEventListener('mousedown', () => {
    ring.style.transform = 'translate(-50%, -50%) scale(0.78)';
    dot.style.transform  = 'translate(-50%, -50%) scale(0.6)';
  });
  document.addEventListener('mouseup', () => {
    ring.style.transform = 'translate(-50%, -50%) scale(1)';
    dot.style.transform  = 'translate(-50%, -50%) scale(1)';
  });

  // Hide cursors when mouse leaves window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  /* ══════════════════════════════════════════════════════════════════════════
     2. CURSOR SPOTLIGHT (soft ambient glow behind ring)
  ══════════════════════════════════════════════════════════════════════════ */
  const spotlight = document.createElement('div');
  spotlight.id = 'cursor-spotlight';
  Object.assign(spotlight.style, {
    position:      'fixed',
    pointerEvents: 'none',
    zIndex:        '9990',
    width:         '420px',
    height:        '420px',
    borderRadius:  '50%',
    transform:     'translate(-50%, -50%)',
    background:    'radial-gradient(circle, hsla(190,90%,50%,0.07) 0%, hsla(348,100%,61%,0.04) 45%, transparent 72%)',
    transition:    'left 0.1s ease-out, top 0.1s ease-out',
    mixBlendMode:  'screen',
  });
  document.body.appendChild(spotlight);

  /* 3D CARD TILT DISABLED */


  /* ══════════════════════════════════════════════════════════════════════════
     4. FLOATING PARTICLE CANVAS
  ══════════════════════════════════════════════════════════════════════════ */
  const canvas = document.createElement('canvas');
  canvas.id    = 'bg-particles';
  Object.assign(canvas.style, {
    position:      'fixed',
    inset:         '0',
    width:         '100%',
    height:        '100%',
    pointerEvents: 'none',
    zIndex:        '0',
    opacity:       '0.55',
  });
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  const COLORS = [
    'hsla(190, 90%, 65%, ', 'hsla(348, 100%, 65%, ',
    'hsla(140, 71%, 55%, ', 'hsla(48,  100%, 65%, ',
  ];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x    = Math.random() * canvas.width;
      this.y    = init ? Math.random() * canvas.height : canvas.height + 10;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = -(Math.random() * 0.45 + 0.1);
      this.r    = Math.random() * 2 + 0.5;
      this.a    = Math.random() * 0.45 + 0.08;
      this.col  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.ph   = Math.random() * Math.PI * 2;
      this.life = 0;
      this.max  = Math.random() * 280 + 180;
    }
    update() {
      const dx = mx - this.x, dy = my - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 180) { this.vx += (dx / d) * 0.009; this.vy += (dy / d) * 0.009; }
      this.vx *= 0.979; this.vy *= 0.979;
      this.x  += this.vx; this.y  += this.vy;
      this.ph += 0.03; this.life++;
      if (this.life > this.max || this.y < -20) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col + (this.a * (0.65 + 0.35 * Math.sin(this.ph))) + ')';
      ctx.fill();
    }
  }

  const particles = Array.from({ length: 60 }, () => new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ══════════════════════════════════════════════════════════════════════════
     5. ORB PARALLAX ON MOUSE MOVE
  ══════════════════════════════════════════════════════════════════════════ */
  document.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth  - 0.5);
    const ny = (e.clientY / window.innerHeight - 0.5);
    document.querySelectorAll('.bg-orb').forEach((orb, i) => {
      const d = (i + 1) * 22;
      orb.style.transform = `translate(${nx * d}px, ${ny * d}px)`;
    });
  });

  /* INIT */
  // Tilt removed per user request.

})();
