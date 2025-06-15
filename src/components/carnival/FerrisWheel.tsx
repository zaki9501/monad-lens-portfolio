import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface FerrisWheelProps {
  block: any;
  position: [number, number, number];
  size: number;
  color: string;
}

const FerrisWheel: React.FC<FerrisWheelProps> = ({ block, position, size, color }) => {
  const wheelRef = useRef<THREE.Group>(null);
  const gondolasRef = useRef<THREE.Group>(null);

  const transactionCount = block.transactions?.length || 0;
  const gondolaCount = Math.min(Math.max(transactionCount / 10, 6), 20);

  const gondolas = useMemo(() => {
    const gondolaArray = [];
    for (let i = 0; i < gondolaCount; i++) {
      const angle = (i / gondolaCount) * Math.PI * 2;
      const radius = size * 0.8;
      gondolaArray.push({
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ] as [number, number, number],
        angle: angle
      });
    }
    return gondolaArray;
  }, [gondolaCount, size]);

  useFrame((state) => {
    if (wheelRef.current) {
      // Rotate the wheel based on transaction activity
      const speed = 0.005 + (transactionCount / 1000) * 0.02;
      wheelRef.current.rotation.z += speed;
      
      // Pulsing effect based on gas usage
      const gasUsed = parseInt(block.gasUsed || '0', 16);
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * (gasUsed / 30000000);
      wheelRef.current.scale.setScalar(pulse);
    }

    if (gondolasRef.current) {
      // Counter-rotate gondolas to keep them upright
      gondolasRef.current.rotation.z = -wheelRef.current!.rotation.z;
    }
  });

  return (
    <group position={position}>
      {/* Ferris Wheel Structure */}
      <group ref={wheelRef}>
        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[size, size * 0.1, 16, 100]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Inner spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * size * 0.5,
                Math.sin(angle) * size * 0.5,
                0
              ]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[size * 0.8, 0.1, 0.1]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
            </mesh>
          );
        })}
      </group>

      {/* Gondolas */}
      <group ref={gondolasRef}>
        {gondolas.map((gondola, i) => (
          <mesh key={i} position={gondola.position}>
            <boxGeometry args={[0.5, 0.3, 0.3]} />
            <meshStandardMaterial 
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Block Info Text */}
      <Text
        position={[0, size + 1, 0]}
        fontSize={0.5}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        Block #{parseInt(block.number || '0', 16)}
      </Text>

      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.3}
        color="#00FFFF"
        anchorX="center"
        anchorY="middle"
      >
        {transactionCount} TXs
      </Text>
    </group>
  );
};

export default FerrisWheel;
