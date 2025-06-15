
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface CosmicClownAnnouncerProps {
  latestBlock: any;
  isEnabled: boolean;
}

const CosmicClownAnnouncer: React.FC<CosmicClownAnnouncerProps> = ({ 
  latestBlock, 
  isEnabled 
}) => {
  const clownRef = useRef<THREE.Group>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const funnyMessages = [
    "Whee! Block {blockNum} just landed with {txCount} transactions—popcorn's poppin'!",
    "Zoom, zoom! Parallel execution's got this block flying faster than a crypto comet!",
    "Holy blockchain! {txCount} transactions in one second? That's faster than my juggling!",
    "Step right up! Block {blockNum} with {gasUsed}M gas—what a spectacle!",
    "Ladies and gentlemen, witness the magnificent Monad magic in block {blockNum}!",
    "Ding ding! All aboard the blockchain express! Next stop: block {blockNum}!"
  ];

  useEffect(() => {
    if (latestBlock && isEnabled) {
      const message = funnyMessages[Math.floor(Math.random() * funnyMessages.length)]
        .replace('{blockNum}', parseInt(latestBlock.number || '0', 16).toString())
        .replace('{txCount}', (latestBlock.transactions?.length || 0).toString())
        .replace('{gasUsed}', (parseInt(latestBlock.gasUsed || '0', 16) / 1000000).toFixed(1));
      
      setCurrentMessage(message);
      setShowMessage(true);
      
      setTimeout(() => setShowMessage(false), 5000);
    }
  }, [latestBlock, isEnabled]);

  useFrame((state) => {
    if (clownRef.current) {
      // Bouncy floating animation
      clownRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
      clownRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  if (!isEnabled) return null;

  return (
    <group ref={clownRef} position={[0, 8, 5]}>
      {/* Clown Head */}
      <mesh>
        <sphereGeometry args={[1]} />
        <meshStandardMaterial
          color="#FFB6C1"
          emissive="#FF69B4"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Clown Hat */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.8, 1.5]} />
        <meshStandardMaterial
          color="#9370DB"
          emissive="#9370DB"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Hat Pompom */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Speech Bubble */}
      {showMessage && (
        <group position={[3, 1, 0]}>
          <mesh>
            <boxGeometry args={[4, 2, 0.1]} />
            <meshStandardMaterial
              color="#FFFFFF"
              transparent
              opacity={0.9}
            />
          </mesh>
          <Text
            position={[0, 0, 0.1]}
            fontSize={0.15}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            maxWidth={3.5}
            textAlign="center"
          >
            {currentMessage}
          </Text>
        </group>
      )}
    </group>
  );
};

export default CosmicClownAnnouncer;
