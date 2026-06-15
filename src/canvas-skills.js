import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export function SkillsGalaxy() {
  const { camera } = useThree();
  const galaxyRef = useRef();
  const sunRef = useRef();

  // Selected active skill node for holographic detail overlays
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Skill database with domain clustering, radii, tilt, and strength (speed representation)
  const skills = [
    // Python Cluster (Radius: 1.5 - 2.2, Cluster Angle Offset: 0)
    { name: 'Python Core', domain: 'Python', strength: 0.95, radius: 1.6, color: '#ffd43b', angleOffset: 0, desc: 'Advanced scripting, object-oriented programming, data structures, and pipeline optimization.' },
    { name: 'SQL & Database', domain: 'Python', strength: 0.85, radius: 2.1, color: '#3178c6', angleOffset: 0.3, desc: 'Relational query construction, data cleaning schemas, and SQLite/PostgreSQL connectors.' },
    
    // AI / ML Cluster (Radius: 2.6 - 3.8, Cluster Angle Offset: Math.PI * 0.67)
    { name: 'Scikit-Learn', domain: 'AI / ML', strength: 0.90, radius: 2.6, color: '#00e5ff', angleOffset: Math.PI * 0.67, desc: 'Supervised classifiers, regression analysis, feature engineering, and model validation.' },
    { name: 'TensorFlow', domain: 'AI / ML', strength: 0.80, radius: 3.2, color: '#ff3d00', angleOffset: Math.PI * 0.67 + 0.2, desc: 'Neural network training, weights optimizations, and deep learning system prototyping.' },
    { name: 'EDA Modeling', domain: 'AI / ML', strength: 0.92, radius: 3.8, color: '#bd00ff', angleOffset: Math.PI * 0.67 - 0.2, desc: 'Exploratory data analysis, outlier cleaning, and statistical distributions modelling.' },

    // Data Science Tools Cluster (Radius: 4.4 - 5.8, Cluster Angle Offset: Math.PI * 1.33)
    { name: 'NumPy & Pandas', domain: 'Data Science', strength: 0.98, radius: 4.4, color: '#ffd43b', angleOffset: Math.PI * 1.33, desc: 'High-performance array operations, data clean frames, aggregates, and time-series.' },
    { name: 'Matplotlib', domain: 'Data Science', strength: 0.88, radius: 5.0, color: '#bd00ff', angleOffset: Math.PI * 1.33 + 0.25, desc: 'Custom diagnostic charting, data visualization grids, and distribution graphs.' },
    { name: 'React JS & UI', domain: 'Data Science', strength: 0.82, radius: 5.6, color: '#00e5ff', angleOffset: Math.PI * 1.33 - 0.25, desc: 'Front-end creative panels, Three.js bindings, and interactive browser widgets.' }
  ];

  const skillRefs = useRef(skills.map(() => React.createRef()));

  // Target coordinates for camera lerping on hover
  const targetCam = useRef(new THREE.Vector3(0, 0, 8));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate center sun core
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.2;
    }

    // Animate skill planets orbiting
    skills.forEach((skill, idx) => {
      const ref = skillRefs.current[idx].current;
      if (ref) {
        // Orbit speed proportional to skill strength
        const speedMultiplier = 0.15 + skill.strength * 0.25;
        const angle = time * speedMultiplier + skill.angleOffset;
        
        ref.position.x = Math.cos(angle) * skill.radius;
        ref.position.z = Math.sin(angle) * skill.radius;
        ref.position.y = Math.sin(time * 0.8 + idx) * 0.1; // Zero-gravity floating
      }
    });

    // Hover camera zoom lerp pull
    if (hoveredSkill !== null) {
      const hoveredRef = skillRefs.current[hoveredSkill].current;
      if (hoveredRef) {
        // Position camera closer to planet coordinates
        const targetX = hoveredRef.position.x * 1.25;
        const targetY = hoveredRef.position.y + 0.8;
        const targetZ = hoveredRef.position.z * 1.25;
        targetCam.current.set(targetX, targetY, targetZ);
      }
    } else {
      // Default rest position
      targetCam.current.set(0, 0, 7.5);
    }

    // Move camera to target coordinates smoothly
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCam.current.x, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCam.current.y, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCam.current.z, 0.05);
  });

  return React.createElement(
    'group',
    { ref: galaxyRef },
    [
      // Lights
      React.createElement('ambientLight', { key: 'ambient', intensity: 0.35 }),
      React.createElement('pointLight', { 
        key: 'sun-glow', 
        position: [0, 0, 0], 
        color: '#00e5ff', 
        intensity: 2,
        distance: 12
      }),

      // Sun Core (Holographic Center)
      React.createElement(
        'mesh',
        { key: 'skills-sun', ref: sunRef },
        [
          React.createElement('sphereGeometry', { key: 'geo', args: [0.5, 12, 12] }),
          React.createElement('meshBasicMaterial', {
            key: 'mat',
            color: '#00e5ff',
            wireframe: true,
            transparent: true,
            opacity: 0.45
          })
        ]
      ),

      // Orbit Tracks for visual guides
      ...skills.map((skill, idx) => {
        return React.createElement(
          'mesh',
          { 
            key: `track-${idx}`,
            rotation: [Math.PI / 2, 0, 0]
          },
          [
            React.createElement('ringGeometry', { key: 'geo', args: [skill.radius - 0.01, skill.radius + 0.01, 64] }),
            React.createElement('meshBasicMaterial', {
              key: 'mat',
              color: '#00e5ff',
              transparent: true,
              opacity: 0.05,
              side: THREE.DoubleSide
            })
          ]
        );
      }),

      // Skill Satellites (orbiting planets)
      ...skills.map((skill, idx) => {
        return React.createElement(
          'mesh',
          {
            key: `sat-skill-${idx}`,
            ref: skillRefs.current[idx],
            position: [skill.radius, 0, 0],
            onPointerOver: () => setHoveredSkill(idx),
            onPointerOut: () => setHoveredSkill(null),
            onClick: () => setSelectedSkill(selectedSkill === idx ? null : idx)
          },
          [
            // Spherical Node
            React.createElement('sphereGeometry', { key: 'geo', args: [0.15, 16, 16] }),
            React.createElement('meshStandardMaterial', {
              key: 'mat',
              color: skill.color,
              emissive: skill.color,
              emissiveIntensity: hoveredSkill === idx ? 1.5 : 0.6,
              roughness: 0.1
            }),

            // Floating title tag
            React.createElement(
              Html,
              {
                key: 'label',
                distanceFactor: 5,
                position: [0, 0.35, 0],
                center: true
              },
              React.createElement(
                'div',
                {
                  className: 'planet-label',
                  style: {
                    borderColor: skill.color,
                    boxShadow: hoveredSkill === idx ? `0 0 10px ${skill.color}` : `0 0 5px ${skill.color}33`,
                    opacity: hoveredSkill === idx ? 1.0 : 0.7
                  }
                },
                skill.name
              )
            ),

            // Holographic Details Overlay (mounted in 3D relative coordinates when clicked)
            selectedSkill === idx && React.createElement(
              Html,
              {
                key: 'detail-holo',
                distanceFactor: 4,
                position: [0, -0.65, 0],
                center: true
              },
              React.createElement(
                'div',
                {
                  className: 'glass-panel',
                  style: {
                    padding: '1rem',
                    width: '240px',
                    borderColor: skill.color,
                    boxShadow: `0 0 20px ${skill.color}55`,
                    background: 'rgba(5, 5, 10, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '8px'
                  }
                },
                [
                  React.createElement('div', {
                    key: 'header',
                    className: 'font-mono neon-text',
                    style: { fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.35rem', marginBottom: '0.5rem', color: skill.color }
                  }, `// ${skill.domain.toUpperCase()}_SYS`),
                  React.createElement('div', {
                    key: 'name',
                    style: { fontWeight: '700', fontSize: '0.85rem', color: '#ffffff', marginBottom: '0.25rem' }
                  }, skill.name),
                  React.createElement('div', {
                    key: 'desc',
                    style: { fontSize: '0.65rem', color: 'var(--color-text-muted)', lineHeight: '1.4', marginBottom: '0.5rem' }
                  }, skill.desc),
                  React.createElement('div', {
                    key: 'metric',
                    className: 'font-mono',
                    style: { fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', color: '#ffffff' }
                  }, [
                    React.createElement('span', { key: 'l' }, 'PROFICIENCY:'),
                    React.createElement('span', { key: 'v', style: { color: skill.color } }, `${Math.round(skill.strength * 100)}%`)
                  ])
                ]
              )
            )
          ]
        );
      }),

      // OrbitControls for dragging and scrolling zoom
      React.createElement(OrbitControls, {
        key: 'controls',
        enableZoom: true,
        enablePan: false,
        zoomSpeed: 0.5,
        rotateSpeed: 0.4,
        minDistance: 3,
        maxDistance: 12,
        autoRotate: hoveredSkill === null,
        autoRotateSpeed: 0.25
      })
    ]
  );
}
