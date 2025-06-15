
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

interface BlockRay {
  id: string;
  block: any;
  position: { x: number; y: number };
  side: 'left' | 'right';
  active: boolean;
  createdAt: number;
}

interface HyperspeedBlockRaysProps {
  blockData: BlockRay[];
  onRayHover: (ray: BlockRay | null) => void;
}

const HyperspeedBlockRays: React.FC<HyperspeedBlockRaysProps> = ({ blockData, onRayHover }) => {
  const groupRef = useRef<any>();

  const rayMeshes = useMemo(() => {
    return blockData.map((ray, index) => ({
      ...ray,
      position3D: new Vector3(
        (ray.side === 'left' ? -5 : 5) + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 4,
        -index * 20 - 10
      )
    }));
  }, [blockData]);

  useFrame((state) => {
    if (groupRef.current) {
      // Move rays forward
      groupRef.current.children.forEach((child: Mesh, index: number) => {
        child.position.z += 2;
        
        // Reset position when ray goes too far
        if (child.position.z > 10) {
          child.position.z = -100;
        }
        
        // Add some floating animation
        child.position.y += Math.sin(state.clock.elapsedTime * 2 + index) * 0.01;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {rayMeshes.map((ray, index) => (
        <mesh
          key={ray.id}
          position={ray.position3D}
          onPointerEnter={() => onRayHover(ray)}
          onPointerLeave={() => onRayHover(null)}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color={ray.active ? 0x9333ea : 0x6366f1}
            emissive={ray.active ? 0x4c1d95 : 0x312e81}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

export default HyperspeedBlockRays;
