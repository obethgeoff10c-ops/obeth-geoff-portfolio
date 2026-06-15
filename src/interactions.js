// Interpolation helper for smooth movement
const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

export function initInteractions() {
  initCursor();
  initMagneticButtons();
  initProjectCards();
  initContactInputs();
}

/* ==========================================================================
   CUSTOM CURSOR FOLLOWER
   ========================================================================== */
function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const glow = document.getElementById('cursor-glow');
  
  if (!dot || !glow) return;

  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let dotPos = { x: mouse.x, y: mouse.y };
  let glowPos = { x: mouse.x, y: mouse.y };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Smooth cursor follow loop
  const updateCursor = () => {
    // Dot follows fast
    dotPos.x = lerp(dotPos.x, mouse.x, 0.35);
    dotPos.y = lerp(dotPos.y, mouse.y, 0.35);

    // Glow halo has smooth lag (inertia)
    glowPos.x = lerp(glowPos.x, mouse.x, 0.08);
    glowPos.y = lerp(glowPos.y, mouse.y, 0.08);

    dot.style.left = `${dotPos.x}px`;
    dot.style.top = `${dotPos.y}px`;

    glow.style.left = `${glowPos.x}px`;
    glow.style.top = `${glowPos.y}px`;

    requestAnimationFrame(updateCursor);
  };
  updateCursor();

  // Add hover effect classes on interactive elements
  const hoverTargets = 'a, button, input, textarea, .social-card, .article-row, .project-card';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      // Check if we are still hovering an interactive element (e.g. nested tags)
      if (!e.relatedTarget || !e.relatedTarget.closest(hoverTargets)) {
        document.body.classList.remove('cursor-hover');
      }
    }
  });
}

/* ==========================================================================
   MAGNETIC BUTTONS (GRAVITATIONAL PULL)
   ========================================================================== */
function initMagneticButtons() {
  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const bound = btn.getBoundingClientRect();
      const x = e.clientX - (bound.left + bound.width / 2);
      const y = e.clientY - (bound.top + bound.height / 2);
      
      // Pull strength factor (closer to 1 = follows mouse more closely)
      const strength = 0.35;
      
      // Translate elements inside the button or the button itself
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

/* ==========================================================================
   PROJECT CARDS: 3D TILT & MOUSE SPOTLIGHT
   ========================================================================== */
function initProjectCards() {
  const cards = document.querySelectorAll('.project-tilt-container');

  cards.forEach((container) => {
    const card = container.querySelector('.project-card');
    
    if (!card) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set mouse position CSS variables on the card for spotlight gradient
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D Tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Max rotation angles (degrees)
      const maxRotateX = 12;
      const maxRotateY = 12;

      const rotateY = ((x - centerX) / centerX) * maxRotateY;
      const rotateX = -((y - centerY) / centerY) * maxRotateX;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    container.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.setProperty('--mouse-x', '-999px');
      card.style.setProperty('--mouse-y', '-999px');
    });
  });
}

/* ==========================================================================
   CONTACT FORM INPUT FIELDS
   ========================================================================== */
function initContactInputs() {
  const inputs = document.querySelectorAll('.form-input');

  inputs.forEach((input) => {
    // Add spotlight/glow tracking on individual input wrapper on focus/active
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
    });
  });
}
