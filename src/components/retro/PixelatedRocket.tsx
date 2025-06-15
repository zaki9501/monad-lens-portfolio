
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface PixelatedRocketProps {
  block: any;
  position: [number, number, number];
  size: number;
  trailColor: string;
}

const PixelatedRocket: React.FC<PixelatedRocketProps> = ({ 
  block, 
  position, 
  size, 
  trailColor 
}) => {
  const rocketRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Group>(null);

  const transactionCount = block.transactions?.length || 0;
  const blockNumber = parseInt(block.number || '0', 16);
  const gasUsed = parseInt(block.gasUsed || '0', 16);

  // Create pixelated rocket geometry
  const rocketParts = useMemo(() => {
    const parts = [];
    
    // Main body (pixelated cylinder)
    parts.push({
      geometry: 'box',
      args: [size * 0.3, size * 1.2, size * 0.3],
      position: [0, 0, 0],
      color: '#00FFFF'
    });
    
    // Nose cone (pixelated)
    parts.push({
      geometry: 'box',
      args: [size * 0.2, size * 0.4, size * 0.2],
      position: [0, size * 0.8, 0],
      color: '#FF1493'
    });
    
    // Wings (8-bit style)
    parts.push({
      geometry: 'box',
      args: [size * 0.8, size * 0.2, size * 0.1],
      position: [0, -size * 0.3, 0],
      color: '#39FF14'
    });
    
    return parts;
  }, [size]);

  // Create neon trail particles
  const trailParticles = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        position: [
          (Math.random() - 0.5) * size * 0.5,
          -i * 0.3 - size,
          (Math.random() - 0.5) * size * 0.5
        ] as [number, number, number],
        scale: Math.random() * 0.3 + 0.1
      });
    }
    return particles;
  }, [size]);

  useFrame((state) => {
    if (rocketRef.current) {
      // Rocket movement and rotation
      rocketRef.current.position.y += 0.02 * (transactionCount / 100 + 1);
      
      // Reset position when too high
      if (rocketRef.current.position.y > 50) {
        rocketRef.current.position.y = position[1];
      }
      
      // Slight wobble for retro feel
      rocketRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }

    if (trailRef.current) {
      // Animate trail particles
      trailRef.current.children.forEach((particle, index) => {
        particle.position.y -= 0.1;
        if (particle.position.y < -20) {
          particle.position.y = 0;
        }
        
        // Pulsing effect
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 5 + index) * 0.3;
        particle.scale.setScalar(pulse * trailParticles[index].scale);
      });
    }
  });

  return (
    <group position={position}>
      {/* Pixelated Rocket */}
      <group ref={rocketRef}>
        {rocketParts.map((part, index) => (
          <mesh key={index} position={part.position}>
            <boxGeometry args={part.args} />
            <meshStandardMaterial
              color={part.color}
              emissive={part.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Neon Trail */}
      <group ref={trailRef}>
        {trailParticles.map((particle, index) => (
          <mesh key={index} position={particle.position}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color={trailColor}
              emissive={trailColor}
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Block Info Display */}
      <Text
        position={[2, 1, 0]}
        fontSize={0.4}
        color="#00FFFF"
        anchorX="center"
        anchorY="middle"
        font="/fonts/monospace"
      >
        BLOCK #{blockNumber}
      </Text>

      <Text
        position={[2, 0.4, 0]}
        fontSize={0.3}
        color="#FF1493"
        anchorX="center"
        anchorY="middle"
      >
        {transactionCount} ALIENS
      </Text>

      <Text
        position={[2, -0.2, 0]}
        fontSize={0.25}
        color="#39FF14"
        anchorX="center"
        anchorY="middle"
      >
        GAS: {(gasUsed / 1000000).toFixed(1)}M
      </Text>
    </group>
  );
};

export default PixelatedRocket;
