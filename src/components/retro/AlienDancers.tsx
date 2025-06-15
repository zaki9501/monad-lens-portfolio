
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AlienDancersProps {
  transactions: any[];
  centerPosition: [number, number, number];
}

const AlienDancers: React.FC<AlienDancersProps> = ({ 
  transactions, 
  centerPosition 
}) => {
  const dancefloorRef = useRef<THREE.Group>(null);

  const aliens = useMemo(() => {
    return transactions.slice(0, 100).map((tx, index) => {
      const value = parseFloat(tx.value || '0');
      const isHighValue = value > 1000000000000000000; // 1 ETH equivalent
      
      // Arrange aliens in a grid pattern around the dancefloor
      const gridSize = Math.ceil(Math.sqrt(transactions.length));
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      return {
        id: tx.hash || `alien-${index}`,
        position: [
          (col - gridSize / 2) * 1.5,
          0,
          (row - gridSize / 2) * 1.5
        ] as [number, number, number],
        size: isHighValue ? 0.6 : 0.3,
        color: isHighValue ? '#FFD700' : ['#FF1493', '#00FFFF', '#39FF14'][index % 3],
        dancePhase: Math.random() * Math.PI * 2,
        danceSpeed: isHighValue ? 3 : 1.5,
        isHighValue
      };
    });
  }, [transactions]);

  useFrame((state) => {
    if (dancefloorRef.current) {
      dancefloorRef.current.children.forEach((alien, index) => {
        if (aliens[index]) {
          const alienData = aliens[index];
          
          // Dancing animation
          const danceTime = state.clock.elapsedTime * alienData.danceSpeed + alienData.dancePhase;
          
          // Disco dance moves
          alien.position.y = 0.2 + Math.abs(Math.sin(danceTime * 2)) * 0.3;
          alien.rotation.y = Math.sin(danceTime) * 0.5;
          alien.rotation.x = Math.sin(danceTime * 1.5) * 0.2;
          
          // High-value aliens get disco ball effect
          if (alienData.isHighValue) {
            const sparkle = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.4;
            alien.scale.setScalar(sparkle);
          }
        }
      });
    }
  });

  return (
    <group position={centerPosition}>
      {/* Glowing Dancefloor */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#FF1493"
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Alien Dancers */}
      <group ref={dancefloorRef}>
        {aliens.map((alien, index) => (
          <group key={alien.id} position={alien.position}>
            {/* Alien Body (pixelated) */}
            <mesh>
              <boxGeometry args={[alien.size, alien.size * 1.5, alien.size]} />
              <meshStandardMaterial
                color={alien.color}
                emissive={alien.color}
                emissiveIntensity={alien.isHighValue ? 0.5 : 0.3}
              />
            </mesh>
            
            {/* Alien Head */}
            <mesh position={[0, alien.size * 1.2, 0]}>
              <boxGeometry args={[alien.size * 0.8, alien.size * 0.8, alien.size * 0.8]} />
              <meshStandardMaterial
                color={alien.isHighValue ? '#FFD700' : '#39FF14'}
                emissive={alien.isHighValue ? '#FFD700' : '#39FF14'}
                emissiveIntensity={0.4}
              />
            </mesh>
            
            {/* Disco Ball for high-value aliens */}
            {alien.isHighValue && (
              <mesh position={[0, alien.size * 2, 0]}>
                <sphereGeometry args={[alien.size * 0.3, 8, 8]} />
                <meshStandardMaterial
                  color="#C0C0C0"
                  emissive="#FFD700"
                  emissiveIntensity={0.6}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
};

export default AlienDancers;
