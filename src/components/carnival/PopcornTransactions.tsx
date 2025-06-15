
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PopcornTransactionsProps {
  transactions: any[];
  centerPosition: [number, number, number];
}

const PopcornTransactions: React.FC<PopcornTransactionsProps> = ({ 
  transactions, 
  centerPosition 
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const popcornKernels = useMemo(() => {
    return transactions.slice(0, 50).map((tx, index) => {
      // Calculate value for sizing
      const value = parseFloat(tx.value || '0');
      const isHighValue = value > 1000000000000000000; // 1 ETH equivalent
      
      // Random explosion direction
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * Math.PI * 0.3;
      const distance = 2 + Math.random() * 3;
      
      return {
        id: tx.hash || `tx-${index}`,
        position: [
          Math.cos(angle) * Math.cos(elevation) * distance,
          Math.sin(elevation) * distance,
          Math.sin(angle) * Math.cos(elevation) * distance
        ] as [number, number, number],
        size: isHighValue ? 0.3 : 0.1 + Math.random() * 0.1,
        color: isHighValue ? '#FFD700' : ['#FF69B4', '#00FFFF', '#9370DB'][Math.floor(Math.random() * 3)],
        velocity: [
          (Math.random() - 0.5) * 0.02,
          Math.random() * 0.01,
          (Math.random() - 0.5) * 0.02
        ] as [number, number, number],
        life: 1,
        isHighValue
      };
    });
  }, [transactions]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        if (popcornKernels[index]) {
          const kernel = popcornKernels[index];
          
          // Apply gravity and movement
          child.position.x += kernel.velocity[0];
          child.position.y += kernel.velocity[1];
          child.position.z += kernel.velocity[2];
          
          // Gravity
          kernel.velocity[1] -= 0.0005;
          
          // Rotation for popcorn effect
          child.rotation.x += 0.05;
          child.rotation.y += 0.03;
          
          // Glitter effect for high value transactions
          if (kernel.isHighValue) {
            const sparkle = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
            child.scale.setScalar(sparkle);
          }
          
          // Fade out over time
          kernel.life -= 0.005;
          (child.material as THREE.MeshStandardMaterial).opacity = Math.max(0, kernel.life);
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={centerPosition}>
      {popcornKernels.map((kernel, index) => (
        <mesh key={kernel.id} position={kernel.position}>
          <dodecahedronGeometry args={[kernel.size]} />
          <meshStandardMaterial
            color={kernel.color}
            emissive={kernel.color}
            emissiveIntensity={kernel.isHighValue ? 0.5 : 0.2}
            transparent
            opacity={kernel.life}
          />
        </mesh>
      ))}
    </group>
  );
};

export default PopcornTransactions;
