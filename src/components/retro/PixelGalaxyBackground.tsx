
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PixelGalaxyBackground: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null);
  const recordsRef = useRef<THREE.Group>(null);

  // Create pixelated starfield
  const starGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < 2000; i++) {
      vertices.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);

  // Create spinning vinyl record planets
  const vinylRecords = useMemo(() => {
    const records = [];
    for (let i = 0; i < 12; i++) {
      records.push({
        position: [
          (Math.random() - 0.5) * 150,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 150
        ] as [number, number, number],
        scale: 3 + Math.random() * 5,
        rotationSpeed: 0.01 + Math.random() * 0.02,
        color: ['#FF1493', '#00FFFF', '#39FF14', '#FFD700'][Math.floor(Math.random() * 4)]
      });
    }
    return records;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0003;
      starsRef.current.rotation.x += 0.0001;
    }
    
    if (recordsRef.current) {
      recordsRef.current.children.forEach((record, index) => {
        record.rotation.z += vinylRecords[index].rotationSpeed;
        record.position.y += Math.sin(state.clock.elapsedTime + index) * 0.005;
      });
    }
  });

  return (
    <group>
      {/* Pixelated Starfield */}
      <points ref={starsRef} geometry={starGeometry}>
        <pointsMaterial 
          color="#FFFFFF" 
          size={2} 
          sizeAttenuation={false}
        />
      </points>
      
      {/* Vinyl Record Planets */}
      <group ref={recordsRef}>
        {vinylRecords.map((record, index) => (
          <group key={index} position={record.position} scale={record.scale}>
            {/* Record disc */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1, 1, 0.1, 16]} />
              <meshStandardMaterial
                color={record.color}
                emissive={record.color}
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Center hole */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.12, 8]} />
              <meshStandardMaterial
                color="#000000"
              />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Pixel Grid Floor */}
      <mesh position={[0, -20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial
          color="#0a0a1a"
          emissive="#FF1493"
          emissiveIntensity={0.1}
          wireframe={true}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

export default PixelGalaxyBackground;
