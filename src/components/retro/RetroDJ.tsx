
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface RetroDJProps {
  latestBlock: any;
  isEnabled: boolean;
}

const RetroDJ: React.FC<RetroDJProps> = ({ latestBlock, isEnabled }) => {
  const djRef = useRef<THREE.Group>(null);
  const [currentQuip, setCurrentQuip] = useState('');
  const [showQuip, setShowQuip] = useState(false);

  const djQuips = [
    "Block {blockNum} just dropped {txCount} aliens on the dancefloor—let's boogie!",
    "Parallel execution's got these transactions moonwalking! Block {blockNum} is groovin'!",
    "Whoosh! Block {blockNum} blasted off with {gasUsed}M gas—rocket fuel baby!",
    "Finality in 1s, baby! Block {blockNum} is officially in orbit!",
    "10K TPS and no lag—booyah! {txCount} aliens are getting down!",
    "Beep-boop! Block {blockNum} landed on the cosmic dancefloor!"
  ];

  useEffect(() => {
    if (latestBlock && isEnabled) {
      const quip = djQuips[Math.floor(Math.random() * djQuips.length)]
        .replace('{blockNum}', parseInt(latestBlock.number || '0', 16).toString())
        .replace('{txCount}', (latestBlock.transactions?.length || 0).toString())
        .replace('{gasUsed}', (parseInt(latestBlock.gasUsed || '0', 16) / 1000000).toFixed(1));
      
      setCurrentQuip(quip);
      setShowQuip(true);
      
      setTimeout(() => setShowQuip(false), 6000);
    }
  }, [latestBlock, isEnabled]);

  useFrame((state) => {
    if (djRef.current) {
      // DJ bobbing to the beat
      djRef.current.position.y = 12 + Math.sin(state.clock.elapsedTime * 4) * 0.8;
      djRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  if (!isEnabled) return null;

  return (
    <group ref={djRef} position={[-8, 12, 8]}>
      {/* DJ Body (pixelated) */}
      <mesh>
        <boxGeometry args={[1.5, 2, 1]} />
        <meshStandardMaterial
          color="#9370DB"
          emissive="#9370DB"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* DJ Head */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.2, 1.2, 1]} />
        <meshStandardMaterial
          color="#FFB6C1"
          emissive="#FF1493"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Sunglasses (pixelated) */}
      <mesh position={[0, 1.7, 0.6]}>
        <boxGeometry args={[1.4, 0.3, 0.1]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#00FFFF"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* DJ Turntables */}
      <group position={[0, -1.5, 1]}>
        <mesh position={[-0.8, 0, 0]} rotation={[0, 0, state.clock.elapsedTime * 2]}>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
          <meshStandardMaterial
            color="#000000"
            emissive="#39FF14"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0.8, 0, 0]} rotation={[0, 0, -state.clock.elapsedTime * 2]}>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
          <meshStandardMaterial
            color="#000000"
            emissive="#FF1493"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Speech Bubble */}
      {showQuip && (
        <group position={[4, 2, 0]}>
          <mesh>
            <boxGeometry args={[6, 2.5, 0.1]} />
            <meshStandardMaterial
              color="#000000"
              emissive="#00FFFF"
              emissiveIntensity={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
          <Text
            position={[0, 0, 0.1]}
            fontSize={0.15}
            color="#39FF14"
            anchorX="center"
            anchorY="middle"
            maxWidth={5.5}
            textAlign="center"
            font="/fonts/monospace"
          >
            {currentQuip}
          </Text>
        </group>
      )}
    </group>
  );
};

export default RetroDJ;
