import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function AboutTimeline() {
  const timelineRef = useRef();

  // Milestone data nodes
  const milestones = [
    { year: '2024', event: 'B.Tech Data Science Debut', desc: 'Acquired core Python programming, data structures, and statistics foundations.', radius: 1.5, speed: 0.4, color: '#00e5ff' },
    { year: '2025', event: 'Predictive Modeling & ML', desc: 'Developed supervised classifiers, regressions, and Exploratory Data Analysis pipelines.', radius: 2.3, speed: 0.3, color: '#bd00ff' },
    { year: '2026', event: 'AI Engineering & Deep Learning', desc: 'Crafting collaborative engines, neural networks, and interactive WebGL dashboard dashboards.', radius: 3.1, speed: 0.2, color: '#ff3d00' }
  ];

  const nodeRefs = useRef(milestones.map(() => React.createRef()));
  const [hoveredNode, setHoveredNode] = useState(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate timeline group slowly
    if (timelineRef.current) {
      timelineRef.current.rotation.y = time * 0.08;
    }

    // Animate orbit lines and nodes
    milestones.forEach((node, idx) => {
      const ref = nodeRefs.current[idx].current;
      if (ref) {
        const angle = time * node.speed + (idx * Math.PI * 0.6);
        ref.position.x = Math.cos(angle) * node.radius;
        ref.position.z = Math.sin(angle) * node.radius;
        
        // Slight vertical bobbing (zero gravity effect)
        ref.position.y = Math.sin(time * 1.5 + idx) * 0.15;

        // Pulse scale when hovered
        const scaleVal = hoveredNode === idx ? 1.3 : 1.0;
        ref.scale.set(
          THREE.MathUtils.lerp(ref.scale.x, scaleVal, 0.1),
          THREE.MathUtils.lerp(ref.scale.y, scaleVal, 0.1),
          THREE.MathUtils.lerp(ref.scale.z, scaleVal, 0.1)
        );
      }
    });
  });

  // Helper to draw connecting line geometry
  const createBeamLines = () => {
    const points = [];
    const segments = 64;
    milestones.forEach((node, idx) => {
      // Connect nodes sequentially
      const nextNode = milestones[(idx + 1) % milestones.length];
      const startRadius = node.radius;
      const endRadius = nextNode.radius;
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const theta = t * Math.PI * 0.67 + (idx * Math.PI * 0.6);
        const currentRadius = startRadius + (endRadius - startRadius) * t;
        const x = Math.cos(theta) * currentRadius;
        const z = Math.sin(theta) * currentRadius;
        const y = Math.sin(t * Math.PI) * 0.3; // Curved energy beam arc
        points.push(new THREE.Vector3(x, y, z));
      }
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  };

  return React.createElement(
    'group',
    { ref: timelineRef },
    [
      React.createElement('ambientLight', { key: 'ambient', intensity: 0.4 }),
      React.createElement('pointLight', { 
        key: 'timeline-light', 
        position: [0, 2, 0], 
        color: '#00e5ff', 
        intensity: 1.5,
        distance: 10
      }),

      // Energy beams connecting nodes
      React.createElement(
        'line',
        { key: 'energy-beams' },
        [
          React.createElement('primitive', {
            key: 'geo',
            object: createBeamLines(),
            attach: 'geometry'
          }),
          React.createElement('lineBasicMaterial', {
            key: 'mat',
            color: '#00e5ff',
            transparent: true,
            opacity: 0.2,
            linewidth: 2
          })
        ]
      ),

      // Orbital Milestone Nodes
      ...milestones.map((node, idx) => {
        return React.createElement(
          'mesh',
          {
            key: `node-${node.year}`,
            ref: nodeRefs.current[idx],
            position: [node.radius, 0, 0],
            onPointerOver: () => setHoveredNode(idx),
            onPointerOut: () => setHoveredNode(null)
          },
          [
            // Node sphere
            React.createElement('sphereGeometry', { key: 'geo', args: [0.18, 16, 16] }),
            React.createElement('meshStandardMaterial', {
              key: 'mat',
              color: node.color,
              emissive: node.color,
              emissiveIntensity: hoveredNode === idx ? 1.8 : 0.8,
              roughness: 0.1
            }),

            // Interactive HTML tag floating above
            React.createElement(
              Html,
              {
                key: 'label',
                distanceFactor: 4,
                position: [0, 0.4, 0],
                center: true
              },
              React.createElement(
                'div',
                {
                  className: `planet-label timeline-label ${hoveredNode === idx ? 'active' : ''}`,
                  style: {
                    borderColor: node.color,
                    boxShadow: hoveredNode === idx ? `0 0 15px ${node.color}` : `0 0 5px ${node.color}33`,
                    transition: 'all 0.3s ease',
                    transform: hoveredNode === idx ? 'translate(-50%, -100%) scale(1.05)' : 'translate(-50%, -100%) scale(0.95)',
                    opacity: hoveredNode === idx ? 1.0 : 0.75,
                    width: hoveredNode === idx ? '220px' : '90px'
                  }
                },
                hoveredNode === idx 
                  ? React.createElement('div', { style: { padding: '4px', textAlign: 'left' } }, [
                      React.createElement('span', { style: { fontWeight: 'bold', color: node.color, display: 'block', marginBottom: '2px' } }, `[ ${node.year} ] //`),
                      React.createElement('span', { style: { display: 'block', fontWeight: '500', color: '#ffffff', marginBottom: '4px', fontSize: '0.75rem' } }, node.event),
                      React.createElement('span', { style: { display: 'block', color: 'var(--color-text-muted)', fontSize: '0.65rem', lineHeight: '1.3', whiteSpace: 'normal' } }, node.desc)
                    ])
                  : `YEAR: ${node.year}`
              )
            )
          ]
        );
      })
    ]
  );
}
