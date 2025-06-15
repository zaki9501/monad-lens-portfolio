
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Color } from 'three';
import FloatingBlockCard from './FloatingBlockCard';

interface BlockRay {
  id: string;
  block: any;
  position: { x: number; y: number };
  side: 'left' | 'right';
  active: boolean;
  createdAt: number;
}

interface EnhancedHyperspeedRaysProps {
  blockData: BlockRay[];
  onRayHover: (ray: BlockRay | null) => void;
}

const EnhancedHyperspeedRays: React.FC<EnhancedHyperspeedRaysProps> = ({ 
  blockData, 
  onRayHover 
}) => {
  const groupRef = useRef<any>();

  const enhancedRayMeshes = useMemo(() => {
    return blockData.map((ray, index) => {
      const gasUsed = parseInt(ray.block.gasUsed, 16);
      const transactionCount = ray.block.transactions?.length || 0;
      
      // Color based on transaction count and gas usage
      const intensity = Math.min(transactionCount / 100, 1); // Normalize to 0-1
      const gasIntensity = Math.min(gasUsed / 30000000, 1); // Normalize based on typical gas limit
      
      let color = new Color();
      if (transactionCount > 50) {
        color.setHSL(0.05, 1, 0.5 + intensity * 0.3); // Orange to bright orange
      } else if (transactionCount > 20) {
        color.setHSL(0.15, 1, 0.5 + intensity * 0.3); // Yellow
      } else {
        color.setHSL(0.6, 1, 0.4 + intensity * 0.4); // Blue to bright blue
      }

      return {
        ...ray,
        position3D: new Vector3(
          (ray.side === 'left' ? -6 : 6) + (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 4,
          -index * 25 - 15
        ),
        color: color,
        size: 0.2 + gasIntensity * 0.3, // Size based on gas usage
        pulseSpeed: 1 + transactionCount / 50 // Pulse speed based on transactions
      };
    });
  }, [blockData]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child: Mesh, index: number) => {
        const rayData = enhancedRayMeshes[index];
        if (!rayData) return;

        // Move rays forward
        child.position.z += 2.5;
        
        // Reset position when ray goes too far
        if (child.position.z > 15) {
          child.position.z = -150;
        }
        
        // Pulsing animation based on transaction activity
        const pulseIntensity = 1 + Math.sin(state.clock.elapsedTime * rayData.pulseSpeed) * 0.3;
        child.scale.setScalar(pulseIntensity);
        
        // Floating animation with different frequencies
        child.position.y += Math.sin(state.clock.elapsedTime * 1.5 + index * 0.3) * 0.02;
      });
    }
  });

  return (
    <>
      {/* Enhanced ray meshes */}
      <group ref={groupRef}>
        {enhancedRayMeshes.map((ray, index) => (
          <mesh
            key={ray.id}
            position={ray.position3D}
            onPointerEnter={() => onRayHover(ray)}
            onPointerLeave={() => onRayHover(null)}
          >
            <sphereGeometry args={[ray.size, 16, 16]} />
            <meshStandardMaterial
              color={ray.color}
              emissive={ray.color}
              emissiveIntensity={ray.active ? 0.6 : 0.3}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>

      {/* Floating block information cards */}
      {blockData.slice(0, 5).map((ray, index) => (
        <FloatingBlockCard key={ray.id} blockRay={ray} index={index} />
      ))}
    </>
  );
};

export default EnhancedHyperspeedRays;
