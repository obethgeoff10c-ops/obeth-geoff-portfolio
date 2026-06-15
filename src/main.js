import { initInteractions } from './interactions.js';
import { performTransition } from './transitions.js';

let activeSectionId = 'hero';
window.currentActiveSection = 'hero'; // Global indicator for Canvas synchronizations

document.addEventListener('DOMContentLoaded', () => {
  // Initialize lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Initialize microinteractions (cursor, magnetic buttons, 3D tilts)
  initInteractions();

  // Initialize navigation & page transition triggers
  initNavigation();

  // IntersectionObserver for tracking the active section
  initSectionObserver();

  // Initialize UI triggers (language toggle, scroll styling)
  initUiToggles();

  // Typewriter role cycle
  initTypewriter();

  // Initialize Projects Category Filters
  initProjectFilters();

  // Initialize Scroll Reveal Animations
  initScrollReveal();

  // Lazy-load React Three Fiber components to improve initial page load performance
  lazyLoadThreeJs();
});

/* ==========================================================================
   NAVIGATION & CINEMATIC TRANSITIONS BINDING
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-item, .mobile-nav-item, .logo-link');
  const mobileMenu = document.getElementById('mobile-menu');

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href.startsWith('#')) return;
      
      e.preventDefault();
      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);

      if (!targetSection || targetId === activeSectionId) return;

      // Close mobile menu if open
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
      }

      // Execute cinematic transition
      const currentId = activeSectionId;
      activeSectionId = targetId;
      window.currentActiveSection = targetId;

      performTransition(currentId, targetId, () => {
        // Scroll callback: scroll smoothly to target element
        targetSection.scrollIntoView({ behavior: 'auto' });
        
        // Dispatch global active section update
        window.dispatchEvent(new CustomEvent('section-change', { detail: { activeSection: targetId } }));
      });
    });
  });
}

/* ==========================================================================
   INTERSECTION OBSERVER FOR ACTIVE SECTION STATUS
   ========================================================================== */
function initSectionObserver() {
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-item');

  const options = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Triggers when section occupies center of viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        activeSectionId = id;
        window.currentActiveSection = id;

        // Add active-section class on current element
        sections.forEach(s => s.classList.remove('active-section'));
        entry.target.classList.add('active-section');

        // Update navigation active states
        navItems.forEach((nav) => {
          const href = nav.getAttribute('href');
          if (href === `#${id}`) {
            nav.classList.add('active');
          } else {
            nav.classList.remove('active');
          }
        });

        // Dispatch scroll synchronizer event
        window.dispatchEvent(new CustomEvent('section-change', { detail: { activeSection: id } }));
      }
    });
  }, options);

  sections.forEach((section) => observer.observe(section));
}

/* ==========================================================================
   UI CONTROLS & HEADER GLIDE STYLES
   ========================================================================== */
function initUiToggles() {
  const header = document.getElementById('main-header');
  const langBtn = document.getElementById('lang-toggle');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  // Sticky header class injection
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Language switch toggle
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const currentLang = langBtn.innerText;
      langBtn.innerText = currentLang === 'EN' ? 'PL' : 'EN';
      
      // Temporary hologram overlay flicker effect to indicate system processing
      document.body.style.filter = 'invert(0.1) hue-rotate(15deg)';
      setTimeout(() => {
        document.body.style.filter = '';
      }, 150);
    });
  }

  // Hamburger menu toggle
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const icon = mobileBtn.querySelector('i');
      if (icon) {
        if (mobileMenu.classList.contains('open')) {
          icon.setAttribute('data-lucide', 'x');
        } else {
          icon.setAttribute('data-lucide', 'menu');
        }
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
}

/* ==========================================================================
   LAZY-LOADING THREE.JS RENDER PIPELINE
   ========================================================================== */
function lazyLoadThreeJs() {
  // Use IntersectionObserver to wait until a 3D section is close or page loads
  // For safety, we import the main R3F script after a tiny delay or scroll
  setTimeout(() => {
    import('./app-react.js')
      .then((module) => {
        module.initReactApp();
      })
      .catch((err) => {
        console.error('Failed to load React Three Fiber bundles:', err);
      });
  }, 1000);
}

/* ==========================================================================
   TYPEWRITER CYCLING ANIMATION FOR HERO ROLES
   ========================================================================== */
function initTypewriter() {
  const element = document.getElementById('hero-role-text');
  if (!element) return;

  const roles = [
    'Data Science Engineer',
    'Machine Learning Enthusiast',
    'Python Developer',
    'AI Explorer',
    'Future Data Analyst'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let delay = 120;

  function tick() {
    const currentRole = roles[roleIdx];
    
    if (isDeleting) {
      element.innerText = currentRole.substring(0, charIdx - 1);
      charIdx--;
      delay = 40; // deleting is faster
    } else {
      element.innerText = currentRole.substring(0, charIdx + 1);
      charIdx++;
      delay = 80;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      isDeleting = true;
      delay = 1800; // Pause at full string
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 300; // Pause at blank
    }

    setTimeout(tick, delay);
  }

  tick();
}

/* ==========================================================================
   PROJECT CATEGORY FILTERING LOGIC
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-filter-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Toggle active visual states
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   SCROLL REVEAL OBSERVERS
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.timeline-node-wrapper, .skill-category-card-3d, .profile-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach((el) => observer.observe(el));
}
