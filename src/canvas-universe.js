import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 800;
const FAR_STARS_COUNT = 600;
const SHARD_COUNT = 15;

export function GlobalUniverse() {
  const { camera, scene } = useThree();
  const [activeSection, setActiveSection] = useState('hero');
  const [zoomLevel, setZoomLevel] = useState(1);
  const mouse = useRef({ x: 0, y: 0 });

  // Refs for tracking meshes
  const mainParticlesRef = useRef();
  const farStarsRef = useRef();
  const shardsRef = useRef([]);

  // Data layers positions/velocities
  const positions = useRef(new Float32Array(PARTICLE_COUNT * 3));
  const velocities = useRef(new Float32Array(PARTICLE_COUNT * 3));
  const colors = useRef(new Float32Array(PARTICLE_COUNT * 3));

  const farPositions = useRef(new Float32Array(FAR_STARS_COUNT * 3));

  // Diagnostic states
  useEffect(() => {
    // Enable Fog in the scene
    scene.fog = new THREE.FogExp2('#030307', 0.08);

    // 1. Initialize Main Particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 20;
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 10;

      velocities.current[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities.current[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Cyan/Purple colors
      const isCyan = Math.random() > 0.5;
      colors.current[i * 3] = isCyan ? 0.0 : 0.7;
      colors.current[i * 3 + 1] = isCyan ? 0.9 : 0.0;
      colors.current[i * 3 + 2] = isCyan ? 1.0 : 1.0;
    }

    // 2. Initialize Far Starfield (Layer 1)
    for (let i = 0; i < FAR_STARS_COUNT; i++) {
      farPositions.current[i * 3] = (Math.random() - 0.5) * 40;
      farPositions.current[i * 3 + 1] = (Math.random() - 0.5) * 40;
      farPositions.current[i * 3 + 2] = (Math.random() - 0.8) * 30; // Further back
    }

    // Bind event hooks
    const handleSectionChange = (e) => setActiveSection(e.detail.activeSection);
    const handleZoom = (e) => setZoomLevel(e.detail.zoomIn ? 2.5 : 1);
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('section-change', handleSectionChange);
    window.addEventListener('threejs-zoom', handleZoom);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('section-change', handleSectionChange);
      window.removeEventListener('threejs-zoom', handleZoom);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scene]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Smooth camera drift (auto orbital + mouse responsive parallax)
    const targetCamX = mouse.current.x * 1.5 + Math.sin(time * 0.25) * 0.5;
    const targetCamY = mouse.current.y * 1.2 + Math.cos(time * 0.2) * 0.3;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, zoomLevel === 1 ? 8 : 2.5, 0.04);

    // Layer 1: Far Starfield slow drift
    if (farStarsRef.current) {
      farStarsRef.current.rotation.y = time * 0.005;
      farStarsRef.current.rotation.x = time * 0.002;
    }

    // Layer 2: Mouse-reactive Section Particles
    if (mainParticlesRef.current) {
      const geo = mainParticlesRef.current.geometry;
      const posAttr = geo.getAttribute('position');
      const colAttr = geo.getAttribute('color');
      
      if (posAttr && colAttr) {
        const pos = posAttr.array;
        const col = colAttr.array;
        const vel = velocities.current;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const idx = i * 3;

          // Base drift velocity
          pos[idx] += vel[idx] * 0.5;
          pos[idx + 1] += vel[idx + 1] * 0.5;
          pos[idx + 2] += vel[idx + 2] * 0.5;

          // Mouse gravity pull (soft pull if close to cursor position mapped in 3D)
          const dx = pos[idx] - (mouse.current.x * 5);
          const dy = pos[idx + 1] - (mouse.current.y * 3);
          const distSq = dx * dx + dy * dy;
          if (distSq < 9) {
            // Apply slight push away or pull in based on section
            const force = (3 - Math.sqrt(distSq)) * 0.008;
            pos[idx] += dx * force;
            pos[idx + 1] += dy * force;
          }

          // Wrap around bounds
          if (Math.abs(pos[idx]) > 12) pos[idx] = -pos[idx];
          if (Math.abs(pos[idx + 1]) > 12) pos[idx + 1] = -pos[idx + 1];
          if (Math.abs(pos[idx + 2]) > 6) pos[idx + 2] = -pos[idx + 2];

          // Set specific section themes
          if (activeSection === 'hero') {
            const rVal = Math.sin(time * 0.2 + i) * 0.5 + 0.5;
            col[idx] = rVal * 0.3; // R
            col[idx + 1] = 0.5 + rVal * 0.4; // G
            col[idx + 2] = 1.0; // B
          } else if (activeSection === 'about') {
            col[idx] = 0.4;
            col[idx + 1] = 0.5;
            col[idx + 2] = 0.7;
          } else if (activeSection === 'skills') {
            // Pull points closer to center
            col[idx] = 0.0;
            col[idx + 1] = 0.9;
            col[idx + 2] = 0.9;
          } else if (activeSection === 'projects') {
            col[idx] = 0.75;
            col[idx + 1] = 0.0;
            col[idx + 2] = 1.0;
          } else if (activeSection === 'articles') {
            col[idx] = 0.0;
            col[idx + 1] = 0.8;
            col[idx + 2] = 0.2;
          } else if (activeSection === 'contact') {
            col[idx] = 1.0;
            col[idx + 1] = 0.2;
            col[idx + 2] = 0.5;
          }
        }
        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      }
    }

    // Layer 4: Floating Data Shards (drift upwards and rotate)
    shardsRef.current.forEach((shard, idx) => {
      if (shard) {
        shard.position.y += 0.01 + (idx % 3) * 0.005;
        shard.rotation.x += 0.005;
        shard.rotation.y += 0.008;

        // Wrap shards bottom to top
        if (shard.position.y > 10) {
          shard.position.y = -10;
          shard.position.x = (Math.random() - 0.5) * 16;
          shard.position.z = (Math.random() - 0.5) * 8;
        }
      }
    });
  });

  return React.createElement(
    'group',
    null,
    [
      // Layer 1: Far Starfield (Deep Background points)
      React.createElement(
        'points',
        { key: 'far-stars', ref: farStarsRef },
        [
          React.createElement(
            'bufferGeometry',
            { key: 'geometry' },
            React.createElement('bufferAttribute', {
              key: 'attr-position',
              attach: 'attributes-position',
              args: [farPositions.current, 3]
            })
          ),
          React.createElement('pointsMaterial', {
            key: 'material',
            size: 0.04,
            color: '#4e5a7d',
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true,
            depthWrite: false
          })
        ]
      ),

      // Layer 2: Reactive Section Particles
      React.createElement(
        'points',
        { key: 'main-particles', ref: mainParticlesRef },
        [
          React.createElement(
            'bufferGeometry',
            { key: 'geometry' },
            [
              React.createElement('bufferAttribute', {
                key: 'attr-position',
                attach: 'attributes-position',
                args: [positions.current, 3]
              }),
              React.createElement('bufferAttribute', {
                key: 'attr-color',
                attach: 'attributes-color',
                args: [colors.current, 3]
              })
            ]
          ),
          React.createElement('pointsMaterial', {
            key: 'material',
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          })
        ]
      ),

      // Layer 3: Perspective Neon Grid Plane (Bottom floor)
      React.createElement('gridHelper', {
        key: 'perspective-grid',
        args: [40, 40, '#00e5ff', '#121226'],
        position: [0, -3.8, 0],
        rotation: [0, 0, 0]
      }),

      // Layer 4: Floating Data Shards (drifting wireframe boxes)
      ...Array.from({ length: SHARD_COUNT }).map((_, idx) => {
        const randX = (Math.random() - 0.5) * 16;
        const randY = (Math.random() - 0.5) * 20;
        const randZ = (Math.random() - 0.5) * 8;
        const size = Math.random() * 0.15 + 0.05;
        
        return React.createElement(
          'mesh',
          {
            key: `shard-${idx}`,
            ref: (el) => (shardsRef.current[idx] = el),
            position: [randX, randY, randZ]
          },
          [
            React.createElement('boxGeometry', { key: 'geo', args: [size, size, size] }),
            React.createElement('meshBasicMaterial', {
              key: 'mat',
              color: idx % 2 === 0 ? '#00e5ff' : '#bd00ff',
              wireframe: true,
              transparent: true,
              opacity: 0.15
            })
          ]
        );
      })
    ]
  );
}
