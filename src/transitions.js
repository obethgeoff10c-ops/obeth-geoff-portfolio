export function performTransition(fromSection, toSection, scrollCallback) {
  const overlay = document.getElementById('transition-overlay');
  const mainWrapper = document.getElementById('scroll-wrapper');
  
  if (!overlay) {
    scrollCallback();
    return;
  }

  // Choose cinematic transition type based on sections
  let transitionType = 'glass'; // Default fallback

  if (fromSection === 'hero' && toSection === 'about') {
    transitionType = 'disintegrate'; // Particle disintegration
  } else if (fromSection === 'about' && toSection === 'skills') {
    transitionType = 'hologram'; // Glitch holographic reveal
  } else if (fromSection === 'skills' && toSection === 'projects') {
    transitionType = 'flythrough'; // Camera fly-through space jump
  } else if (fromSection === 'projects' && toSection === 'coding-profiles') {
    transitionType = 'flip'; // Dimensional flip
  } else if (fromSection === 'coding-profiles' && toSection === 'articles') {
    transitionType = 'collapse'; // Black hole collapse
  } else if (fromSection === 'articles' && toSection === 'contact') {
    transitionType = 'tunnel'; // Warp tunnel speedjump
  }

  // Lock scroll
  document.body.style.overflow = 'hidden';

  // Run the selected cinematic transition
  runTransition(overlay, mainWrapper, transitionType, scrollCallback);
}

function runTransition(overlay, wrapper, type, scrollCallback) {
  overlay.className = '';
  overlay.style.background = 'transparent';
  overlay.style.pointerEvents = 'auto'; // Block clicks
  
  if (type === 'disintegrate') {
    // 1. Particle Disintegration + Reconstruction
    overlay.style.background = 'rgba(3, 3, 7, 0.9)';
    overlay.style.transition = 'background 0.5s ease';
    
    const dotsContainer = overlay.querySelector('.dissolve-particles');
    dotsContainer.innerHTML = '';
    
    // Spawn disintegrating particle mesh
    const numParticles = 120;
    for (let i = 0; i < numParticles; i++) {
      const dot = document.createElement('div');
      dot.className = 'disintegrate-particle';
      dot.style.position = 'absolute';
      dot.style.width = `${Math.random() * 3 + 2}px`;
      dot.style.height = `${Math.random() * 3 + 2}px`;
      dot.style.backgroundColor = i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)';
      dot.style.borderRadius = '50%';
      dot.style.left = `${Math.random() * 100}vw`;
      dot.style.top = `${Math.random() * 100}vh`;
      dot.style.opacity = Math.random().toString();
      dot.style.transform = 'translateY(0) scale(1)';
      dot.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      dotsContainer.appendChild(dot);
    }

    setTimeout(() => {
      // Disintegrate drift
      const dots = dotsContainer.querySelectorAll('.disintegrate-particle');
      dots.forEach(d => {
        d.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * -300 - 50}px) scale(0)`;
        d.style.opacity = '0';
      });

      scrollCallback();

      setTimeout(() => {
        overlay.style.background = 'transparent';
        setTimeout(() => {
          overlay.style.pointerEvents = 'none';
          document.body.style.overflow = '';
        }, 400);
      }, 300);
    }, 400);

  } else if (type === 'hologram') {
    // 2. Holographic Glitch Reveal
    overlay.classList.add('hologram-reveal');
    document.body.style.filter = 'hue-rotate(120deg) contrast(1.8) saturate(1.5)';
    document.body.style.transition = 'filter 0.4s ease';

    setTimeout(() => {
      scrollCallback();
      document.body.style.filter = '';
      
      setTimeout(() => {
        overlay.className = '';
        overlay.style.pointerEvents = 'none';
        document.body.style.overflow = '';
      }, 400);
    }, 600);

  } else if (type === 'flythrough') {
    // 3. Camera Fly-Through space jump
    overlay.style.background = 'radial-gradient(circle, transparent 10%, #030307 80%)';
    overlay.style.opacity = '1';
    overlay.style.transition = 'opacity 0.6s ease';

    if (wrapper) {
      wrapper.style.transform = 'scale(1.2) translateZ(80px)';
      wrapper.style.filter = 'blur(15px) brightness(0.2)';
      wrapper.style.transition = 'transform 0.6s ease-in, filter 0.6s ease-in';
    }

    // Zoom background particle camera
    window.dispatchEvent(new CustomEvent('threejs-zoom', { detail: { zoomIn: true } }));

    setTimeout(() => {
      scrollCallback();
      
      if (wrapper) {
        wrapper.style.transform = '';
        wrapper.style.filter = '';
        wrapper.style.transition = 'transform 0.6s ease-out, filter 0.6s ease-out';
      }
      
      window.dispatchEvent(new CustomEvent('threejs-zoom', { detail: { zoomIn: false } }));

      setTimeout(() => {
        overlay.style.background = 'transparent';
        overlay.style.pointerEvents = 'none';
        document.body.style.overflow = '';
      }, 400);
    }, 650);

  } else if (type === 'flip') {
    // 4. Dimensional 3D Flip
    overlay.style.background = '#030307';
    overlay.style.opacity = '0.9';
    overlay.style.transition = 'opacity 0.5s ease';

    if (wrapper) {
      wrapper.style.transform = 'rotateY(90deg) scale(0.85)';
      wrapper.style.transition = 'transform 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
    }

    setTimeout(() => {
      scrollCallback();
      
      if (wrapper) {
        wrapper.style.transform = 'rotateY(-90deg) scale(0.85)';
        // Force reflow
        wrapper.offsetHeight; 
        wrapper.style.transform = 'rotateY(0deg) scale(1.0)';
        wrapper.style.transition = 'transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1)';
      }

      setTimeout(() => {
        overlay.style.background = 'transparent';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        document.body.style.overflow = '';
      }, 300);
    }, 500);

  } else if (type === 'collapse') {
    // 5. Black Hole Collapse (swirl and shrink)
    overlay.style.background = '#030307';
    overlay.style.opacity = '0.95';
    overlay.style.transition = 'opacity 0.6s ease';

    if (wrapper) {
      wrapper.style.transform = 'scale(0.0) rotate(540deg)';
      wrapper.style.filter = 'blur(10px)';
      wrapper.style.transition = 'transform 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045), filter 0.6s ease';
    }

    setTimeout(() => {
      scrollCallback();
      
      if (wrapper) {
        wrapper.style.transform = 'scale(0.0) rotate(-540deg)';
        wrapper.offsetHeight;
        wrapper.style.transform = 'scale(1.0) rotate(0deg)';
        wrapper.style.filter = '';
        wrapper.style.transition = 'transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      }

      setTimeout(() => {
        overlay.style.background = 'transparent';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        document.body.style.overflow = '';
      }, 300);
    }, 600);

  } else if (type === 'tunnel') {
    // 6. Warp Speed Tunnel Transition (draws horizontal/radial neon speed lines)
    overlay.style.background = '#030307';
    overlay.style.transition = 'background 0.5s ease';
    
    const dotsContainer = overlay.querySelector('.dissolve-particles');
    dotsContainer.innerHTML = '';

    // Generate speed streaks emanating from center
    for (let i = 0; i < 40; i++) {
      const line = document.createElement('div');
      line.className = 'warp-line';
      line.style.position = 'absolute';
      line.style.width = '2px';
      line.style.height = `${Math.random() * 80 + 30}px`;
      line.style.background = 'linear-gradient(to top, transparent, var(--color-primary), transparent)';
      line.style.left = '50vw';
      line.style.top = '50vh';
      line.style.transformOrigin = '50% 0%';
      
      const angle = (i / 40) * Math.PI * 2;
      line.style.transform = `rotate(${angle}rad) translateY(0px) scaleY(1)`;
      line.style.transition = 'all 0.6s cubic-bezier(0.895, 0.03, 0.685, 0.22)';
      dotsContainer.appendChild(line);
    }

    setTimeout(() => {
      const lines = dotsContainer.querySelectorAll('.warp-line');
      lines.forEach(l => {
        l.style.transform = l.style.transform.replace('translateY(0px) scaleY(1)', 'translateY(400px) scaleY(4)');
        l.style.opacity = '0';
      });

      scrollCallback();

      setTimeout(() => {
        overlay.style.background = 'transparent';
        setTimeout(() => {
          overlay.style.pointerEvents = 'none';
          document.body.style.overflow = '';
        }, 300);
      }, 300);
    }, 200);
  }
}
