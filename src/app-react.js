import React from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { GlobalUniverse } from './canvas-universe.js';
import { HeroScene } from './canvas-hero.js';
import { AboutTimeline } from './canvas-about.js';
import { SkillsGalaxy } from './canvas-skills.js';

export function initReactApp() {
  console.log('Bootstrapping React Three Fiber Engine...');

  // 1. Initialize Global Background Universe
  const universeContainer = document.getElementById('canvas-container');
  if (universeContainer) {
    const root = ReactDOM.createRoot(universeContainer);
    root.render(
      React.createElement(Canvas, {
        camera: { position: [0, 0, 8], fov: 60, near: 0.1, far: 100 },
        gl: { antialias: false, alpha: true, powerPreference: 'high-performance' },
        style: { width: '100%', height: '100%', pointerEvents: 'none' }
      }, React.createElement(GlobalUniverse))
    );
  }

  // 2. Initialize Hero Holographic Experience
  const heroContainer = document.getElementById('hero-canvas-mount');
  if (heroContainer) {
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.width = '100%';
    canvasWrapper.style.height = '100%';
    canvasWrapper.style.position = 'absolute';
    canvasWrapper.style.zIndex = '3';
    heroContainer.appendChild(canvasWrapper);

    const root = ReactDOM.createRoot(canvasWrapper);
    root.render(
      React.createElement(Canvas, {
        camera: { position: [0, 0, 5], fov: 45, near: 0.1, far: 20 },
        gl: { antialias: true, alpha: true },
        style: { width: '100%', height: '100%' }
      }, React.createElement(HeroScene))
    );
  }

  // 2b. Initialize About Timeline Experience
  const aboutContainer = document.getElementById('about-canvas-mount');
  if (aboutContainer) {
    aboutContainer.innerHTML = '';
    const root = ReactDOM.createRoot(aboutContainer);
    root.render(
      React.createElement(Canvas, {
        camera: { position: [0, 0, 5], fov: 45, near: 0.1, far: 20 },
        gl: { antialias: true, alpha: true },
        style: { width: '100%', height: '100%' }
      }, React.createElement(AboutTimeline))
    );
  }

  // 3. Initialize Skills Tech Galaxy
  const skillsContainer = document.getElementById('skills-canvas-mount');
  if (skillsContainer) {
    skillsContainer.innerHTML = ''; // Clear loading indicator
    
    const root = ReactDOM.createRoot(skillsContainer);
    root.render(
      React.createElement(Canvas, {
        camera: { position: [0, 0, 7], fov: 50, near: 0.1, far: 20 },
        gl: { antialias: true, alpha: true },
        style: { width: '100%', height: '100%' }
      }, React.createElement(SkillsGalaxy))
    );
  }
}
