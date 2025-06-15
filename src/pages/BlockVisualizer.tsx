
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBlockRays } from '../hooks/useBlockRays';
import FerrisWheel from '../components/carnival/FerrisWheel';
import PopcornTransactions from '../components/carnival/PopcornTransactions';
import ParallelRollercoaster from '../components/carnival/ParallelRollercoaster';
import CosmicClownAnnouncer from '../components/carnival/CosmicClownAnnouncer';
import CarnivalBackground from '../components/carnival/CarnivalBackground';

const BlockVisualizer = () => {
  const navigate = useNavigate();
  const { blockRays } = useBlockRays();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clownEnabled, setClownEnabled] = useState(true);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  // Cycle through recent blocks for Ferris wheels
  const displayBlocks = blockRays.slice(-6); // Show last 6 blocks
  const latestBlock = blockRays[blockRays.length - 1];

  // Auto-cycle through blocks for main display
  useEffect(() => {
    if (displayBlocks.length > 0) {
      const interval = setInterval(() => {
        setCurrentBlockIndex((prev) => (prev + 1) % displayBlocks.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [displayBlocks.length]);

  const getBlockColor = (block: any) => {
    const transactionCount = block.block?.transactions?.length || 0;
    if (transactionCount > 100) return '#FF1493'; // Hot pink for high activity
    if (transactionCount > 50) return '#00FFFF';  // Cyan for medium activity
    return '#9370DB'; // Purple for low activity
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-purple-900 via-pink-900 to-blue-900 relative">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 z-20 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackClick}
          className="bg-black/50 border-purple-500/50 text-white hover:bg-purple-600/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-black/50 border-purple-500/50 text-white hover:bg-purple-600/50"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setClownEnabled(!clownEnabled)}
          className="bg-black/50 border-purple-500/50 text-white hover:bg-purple-600/50"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Carnival Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          🎪 Monad's Cosmic Crypto Carnival 🎠
        </h1>
      </div>

      {/* Network Stats */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-black/50 border-purple-500/50 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="text-white space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live Carnival Activity</span>
              </div>
              <div className="text-xs text-purple-300">
                {blockRays.length} blocks in the carnival
              </div>
              {latestBlock && (
                <div className="text-xs text-cyan-300">
                  Latest: Block #{parseInt(latestBlock.block?.number || '0', 16)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ride Instructions */}
      <div className="absolute bottom-4 right-4 z-20">
        <Card className="bg-black/50 border-purple-500/50 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="text-white text-sm space-y-1">
              <div className="text-purple-300 font-semibold">🎠 Carnival Guide</div>
              <div className="text-xs">🎡 Ferris wheels = Blocks</div>
              <div className="text-xs">🍿 Popcorn = Transactions</div>
              <div className="text-xs">🎢 Rollercoaster = Parallel execution</div>
              <div className="text-xs">🤡 Clown = Live announcements</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Carnival Scene */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 15, 20]} fov={75} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={50}
          minDistance={5}
        />
        
        {/* Carnival Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 20, 5]} 
          intensity={0.8} 
          color="#FFB6C1" 
        />
        <pointLight 
          position={[-10, 10, -10]} 
          intensity={0.6} 
          color="#00FFFF" 
        />
        <pointLight 
          position={[10, 5, 10]} 
          intensity={0.6} 
          color="#FF69B4" 
        />
        
        {/* Environment */}
        <Environment preset="night" />
        <CarnivalBackground />
        
        {/* Ferris Wheels for Recent Blocks */}
        {displayBlocks.map((blockRay, index) => (
          <FerrisWheel
            key={blockRay.id}
            block={blockRay.block}
            position={[
              (index - displayBlocks.length / 2) * 8,
              0,
              -index * 5
            ]}
            size={2 + (blockRay.block?.transactions?.length || 0) / 100}
            color={getBlockColor(blockRay)}
          />
        ))}
        
        {/* Popcorn Transactions for Current Block */}
        {displayBlocks[currentBlockIndex] && (
          <PopcornTransactions
            transactions={displayBlocks[currentBlockIndex].block?.transactions || []}
            centerPosition={[
              (currentBlockIndex - displayBlocks.length / 2) * 8,
              0,
              -currentBlockIndex * 5
            ]}
          />
        )}
        
        {/* Parallel Execution Rollercoaster */}
        <ParallelRollercoaster blockData={blockRays.map(ray => ray.block)} />
        
        {/* Cosmic Clown Announcer */}
        <CosmicClownAnnouncer 
          latestBlock={latestBlock?.block}
          isEnabled={clownEnabled}
        />
      </Canvas>

      {/* Fireworks Effect for New Blocks */}
      {latestBlock && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-bounce">
            🎆
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockVisualizer;
