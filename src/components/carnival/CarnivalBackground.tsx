
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CarnivalBackground: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null);
  const cloudsRef = useRef<THREE.Group>(null);

  // Create starfield
  const starGeometry = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < 1000; i++) {
      vertices.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  // Create cotton candy clouds
  const cottonCandyClouds = React.useMemo(() => {
    const clouds = [];
    for (let i = 0; i < 8; i++) {
      clouds.push({
        position: [
          (Math.random() - 0.5) * 60,
          10 + Math.random() * 20,
          (Math.random() - 0.5) * 60
        ] as [number, number, number],
        scale: 2 + Math.random() * 3,
        color: ['#FFB6C1', '#FF69B4', '#DDA0DD', '#98FB98'][Math.floor(Math.random() * 4)]
      });
    }
    return clouds;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0005;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((cloud, index) => {
        cloud.position.y += Math.sin(state.clock.elapsedTime + index) * 0.01;
        cloud.rotation.y += 0.002;
      });
    }
  });

  return (
    <group>
      {/* Starfield */}
      <points ref={starsRef} geometry={starGeometry}>
        <pointsMaterial color="#FFFFFF" size={0.1} />
      </points>
      
      {/* Cotton Candy Clouds */}
      <group ref={cloudsRef}>
        {cottonCandyClouds.map((cloud, index) => (
          <mesh 
            key={index} 
            position={cloud.position}
            scale={cloud.scale}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial
              color={cloud.color}
              emissive={cloud.color}
              emissiveIntensity={0.2}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>
      
      {/* Ground Platform */}
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#0f0f23"
          emissiveIntensity={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export default CarnivalBackground;
