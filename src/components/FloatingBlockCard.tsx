
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface BlockRay {
  id: string;
  block: any;
  position: { x: number; y: number };
  side: 'left' | 'right';
  active: boolean;
  createdAt: number;
}

interface FloatingBlockCardProps {
  blockRay: BlockRay;
  index: number;
}

const FloatingBlockCard: React.FC<FloatingBlockCardProps> = ({ blockRay, index }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { block } = blockRay;

  const cardPosition = useMemo(() => {
    const side = blockRay.side === 'left' ? -8 : 8;
    return [side, 3 + Math.sin(index * 0.5) * 2, -index * 30 - 20] as [number, number, number];
  }, [blockRay.side, index]);

  const blockNumber = parseInt(block.number, 16);
  const transactionCount = block.transactions?.length || 0;
  const gasUsed = parseInt(block.gasUsed, 16);

  useFrame((state) => {
    if (groupRef.current) {
      // Move forward with the highway
      groupRef.current.position.z += 2;
      
      // Reset position when too far ahead
      if (groupRef.current.position.z > 20) {
        groupRef.current.position.z = -200;
      }
      
      // Gentle floating animation
      groupRef.current.position.y = cardPosition[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.3;
      
      // Face the camera
      groupRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={groupRef} position={cardPosition}>
      {/* Card background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial
          color={0x1a1a2e}
          transparent
          opacity={0.9}
          emissive={0x16213e}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Block number */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.5}
        color="#9333ea"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Block #{blockNumber.toLocaleString()}
      </Text>
      
      {/* Transaction count */}
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.3}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
      >
        {transactionCount} transactions
      </Text>
      
      {/* Gas used */}
      <Text
        position={[0, -0.2, 0]}
        fontSize={0.25}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
      >
        Gas: {(gasUsed / 1000000).toFixed(2)}M
      </Text>
      
      {/* Block hash (shortened) */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        {block.hash.slice(0, 10)}...{block.hash.slice(-8)}
      </Text>
    </group>
  );
};

export default FloatingBlockCard;
