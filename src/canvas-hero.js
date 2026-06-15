import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function HeroScene() {
  const groupRef = useRef();
  const avatarRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  // Visual state triggers
  const [rippleFactor, setRippleFactor] = useState(1.0);

  // Satellite skill planets
  const satellites = [
    { name: 'Python', color: '#ffd43b', speed: 0.7, radius: 2.1, phase: 0 },
    { name: 'Data Science', color: '#00e5ff', speed: 0.5, radius: 2.5, phase: Math.PI * 0.5 },
    { name: 'Machine Learning', color: '#bd00ff', speed: 0.4, radius: 1.8, phase: Math.PI },
    { name: 'Artificial Intelligence', color: '#ff3d00', speed: 0.6, radius: 2.3, phase: Math.PI * 1.5 }
  ];

  // Floating data cubes (Data Science symbols)
  const dataCubes = [
    { size: 0.06, speed: 0.3, radius: 1.25, offset: [0.3, 0.4, -0.2] },
    { size: 0.08, speed: 0.45, radius: 1.15, offset: [-0.4, -0.3, 0.3] },
    { size: 0.05, speed: 0.25, radius: 1.35, offset: [0.5, -0.2, 0.1] },
    { size: 0.07, speed: 0.35, radius: 1.05, offset: [-0.2, 0.5, -0.4] }
  ];

  const satelliteRefs = useRef(satellites.map(() => React.createRef()));
  const cubeRefs = useRef(dataCubes.map(() => React.createRef()));

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Trigger ripple distortion on click
  const triggerRipple = () => {
    setRippleFactor(1.75); // Expands points scale instantly
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Decay the ripple factor back to baseline 1.0
    if (rippleFactor > 1.0) {
      setRippleFactor(THREE.MathUtils.lerp(rippleFactor, 1.0, 0.08));
    }

    // 1. Mouse responsive rotation + slow auto-drifting
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.current.x * 0.4 + time * 0.03, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.current.y * 0.3 + Math.sin(time * 0.5) * 0.05, 0.05);
    }

    // 2. Central holographic core pulsing + rotating
    if (avatarRef.current) {
      avatarRef.current.rotation.y = time * 0.15;
      const basePulse = Math.sin(time * 1.2) * 0.06 + 1.0;
      const totalScale = basePulse * rippleFactor;
      avatarRef.current.scale.set(totalScale, totalScale, totalScale);
    }

    // 3. Saturn neon rings rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.3;
      ring1Ref.current.rotation.y = time * 0.08;
      const ringScale = Math.sin(time * 2) * 0.02 + 1.0;
      ring1Ref.current.scale.set(ringScale * rippleFactor, ringScale * rippleFactor, ringScale * rippleFactor);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.25;
      ring2Ref.current.rotation.z = time * 0.15;
    }

    // 4. Satellite skill planets orbits
    satellites.forEach((sat, idx) => {
      const ref = satelliteRefs.current[idx].current;
      if (ref) {
        const angle = time * sat.speed + sat.phase;
        
        // Complex orbital paths
        if (idx % 2 === 0) {
          ref.position.x = Math.cos(angle) * sat.radius;
          ref.position.z = Math.sin(angle) * sat.radius;
          ref.position.y = Math.sin(angle * 0.5) * 0.2;
        } else {
          ref.position.x = Math.cos(angle * 0.6) * 0.2;
          ref.position.y = Math.cos(angle) * sat.radius;
          ref.position.z = Math.sin(angle) * sat.radius;
        }
      }
    });

    // 5. Floating data cubes bobbing
    dataCubes.forEach((cube, idx) => {
      const ref = cubeRefs.current[idx].current;
      if (ref) {
        const bounce = Math.sin(time * cube.speed + idx) * 0.2;
        ref.position.x = cube.offset[0] * cube.radius;
        ref.position.y = cube.offset[1] * cube.radius + bounce;
        ref.position.z = cube.offset[2] * cube.radius;
        ref.rotation.y = time * 0.8 + idx;
        ref.rotation.x = time * 0.4;
      }
    });
  });

  return React.createElement(
    'group',
    { ref: groupRef, onClick: triggerRipple },
    [
      // Lights
      React.createElement('ambientLight', { key: 'ambient', intensity: 0.35 }),
      React.createElement('pointLight', { 
        key: 'core-glow-light', 
        position: [0, 0, 0], 
        color: '#00e5ff', 
        intensity: 2,
        distance: 8
      }),
      React.createElement('pointLight', { 
        key: 'light-secondary', 
        position: [-3, 2, 2], 
        color: '#bd00ff', 
        intensity: 1.5,
        distance: 8
      }),

      // Central Holographic Geodesic Wireframe Core
      React.createElement(
        'group',
        { key: 'core-avatar', ref: avatarRef },
        [
          // Outer point cloud core
          React.createElement(
            'points',
            { key: 'cloud-avatar' },
            [
              React.createElement('sphereGeometry', { key: 'geo', args: [0.9, 28, 28] }),
              React.createElement('pointsMaterial', {
                key: 'mat',
                color: '#00e5ff',
                size: 0.025,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
              })
            ]
          ),
          // Geodesic wireframe core sphere
          React.createElement(
            'mesh',
            { key: 'geo-avatar' },
            [
              React.createElement('icosahedronGeometry', { key: 'geo', args: [0.75, 2] }),
              React.createElement('meshBasicMaterial', {
                key: 'mat',
                color: '#bd00ff',
                wireframe: true,
                transparent: true,
                opacity: 0.35
              })
            ]
          )
        ]
      ),

      // Saturn Ring 1 (Inner glowing cyan)
      React.createElement(
        'mesh',
        { key: 'neon-ring-1', ref: ring1Ref },
        [
          React.createElement('torusGeometry', { key: 'geo', args: [1.35, 0.015, 8, 64] }),
          React.createElement('meshBasicMaterial', {
            key: 'mat',
            color: '#00e5ff',
            transparent: true,
            opacity: 0.6,
            wireframe: true
          })
        ]
      ),

      // Saturn Ring 2 (Outer tilted purple)
      React.createElement(
        'mesh',
        { key: 'neon-ring-2', ref: ring2Ref },
        [
          React.createElement('torusGeometry', { key: 'geo', args: [1.65, 0.01, 8, 64] }),
          React.createElement('meshBasicMaterial', {
            key: 'mat',
            color: '#bd00ff',
            transparent: true,
            opacity: 0.4,
            wireframe: true
          })
        ]
      ),

      // Orbiting Skill Satellites
      ...satellites.map((sat, idx) => {
        return React.createElement(
          'mesh',
          { 
            key: `sat-${sat.name}`, 
            ref: satelliteRefs.current[idx],
            position: [sat.radius, 0, 0]
          },
          [
            React.createElement('sphereGeometry', { key: 'geo', args: [0.11, 16, 16] }),
            React.createElement('meshStandardMaterial', {
              key: 'mat',
              color: sat.color,
              emissive: sat.color,
              emissiveIntensity: 1.2,
              roughness: 0.1,
              metalness: 0.8
            }),
            React.createElement('pointLight', {
              key: 'glow',
              color: sat.color,
              intensity: 0.6,
              distance: 1.5
            }),
            // Label
            React.createElement(
              Html,
              {
                key: 'label',
                distanceFactor: 4.5,
                position: [0, 0.25, 0],
                center: true
              },
              React.createElement(
                'div',
                {
                  className: 'planet-label',
                  style: {
                    borderColor: sat.color,
                    boxShadow: `0 0 10px ${sat.color}44`
                  }
                },
                sat.name
              )
            )
          ]
        );
      }),

      // Floating Data Cubes (Layer 4)
      ...dataCubes.map((cube, idx) => {
        return React.createElement(
          'mesh',
          {
            key: `cube-${idx}`,
            ref: cubeRefs.current[idx]
          },
          [
            React.createElement('boxGeometry', { key: 'geo', args: [cube.size, cube.size, cube.size] }),
            React.createElement('meshBasicMaterial', {
              key: 'mat',
              color: idx % 2 === 0 ? '#ffd43b' : '#00e5ff',
              wireframe: true,
              transparent: true,
              opacity: 0.4
            })
          ]
        );
      })
    ]
  );
}
