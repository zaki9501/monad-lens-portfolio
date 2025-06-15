
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3 } from 'three';
import * as THREE from 'three';

interface ParallelRollercoasterProps {
  blockData: any[];
}

const ParallelRollercoaster: React.FC<ParallelRollercoasterProps> = ({ blockData }) => {
  const track1Ref = useRef<THREE.Group>(null);
  const track2Ref = useRef<THREE.Group>(null);
  const carsRef = useRef<THREE.Group>(null);

  // Create curved track paths
  const trackPaths = useMemo(() => {
    const points1 = [
      new THREE.Vector3(-10, 0, -20),
      new THREE.Vector3(-8, 2, -15),
      new THREE.Vector3(-6, 1, -10),
      new THREE.Vector3(-4, 3, -5),
      new THREE.Vector3(-2, 2, 0),
      new THREE.Vector3(0, 1, 5),
      new THREE.Vector3(2, 2, 10)
    ];

    const points2 = [
      new THREE.Vector3(10, 0, -20),
      new THREE.Vector3(8, 1.5, -15),
      new THREE.Vector3(6, 2.5, -10),
      new THREE.Vector3(4, 1, -5),
      new THREE.Vector3(2, 3, 0),
      new THREE.Vector3(0, 2, 5),
      new THREE.Vector3(-2, 1, 10)
    ];

    return {
      curve1: new CatmullRomCurve3(points1),
      curve2: new CatmullRomCurve3(points2)
    };
  }, []);

  // Create track cars representing transactions
  const cars = useMemo(() => {
    return blockData.slice(-10).flatMap((block, blockIndex) => {
      const transactions = block.transactions || [];
      return transactions.slice(0, 5).map((tx: any, txIndex: number) => ({
        id: `${block.hash}-${txIndex}`,
        track: Math.random() > 0.5 ? 1 : 2, // Random track assignment
        progress: Math.random(),
        speed: 0.01 + Math.random() * 0.02,
        color: ['#FF1493', '#00CED1', '#9932CC'][txIndex % 3]
      }));
    });
  }, [blockData]);

  useFrame(() => {
    if (carsRef.current) {
      carsRef.current.children.forEach((car, index) => {
        if (cars[index]) {
          const carData = cars[index];
          carData.progress += carData.speed;
          
          if (carData.progress > 1) {
            carData.progress = 0;
          }

          const curve = carData.track === 1 ? trackPaths.curve1 : trackPaths.curve2;
          const position = curve.getPoint(carData.progress);
          car.position.copy(position);
          
          // Make cars look forward along the track
          if (carData.progress < 0.99) {
            const nextPosition = curve.getPoint(carData.progress + 0.01);
            car.lookAt(nextPosition);
          }
        }
      });
    }
  });

  return (
    <group>
      {/* Track Rails */}
      <group ref={track1Ref}>
        <mesh>
          <tubeGeometry args={[trackPaths.curve1, 100, 0.1, 8, false]} />
          <meshStandardMaterial color="#C0C0C0" emissive="#404040" emissiveIntensity={0.2} />
        </mesh>
      </group>
      
      <group ref={track2Ref}>
        <mesh>
          <tubeGeometry args={[trackPaths.curve2, 100, 0.1, 8, false]} />
          <meshStandardMaterial color="#C0C0C0" emissive="#404040" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Cars */}
      <group ref={carsRef}>
        {cars.map((car, index) => (
          <mesh key={car.id}>
            <boxGeometry args={[0.3, 0.2, 0.5]} />
            <meshStandardMaterial
              color={car.color}
              emissive={car.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default ParallelRollercoaster;
