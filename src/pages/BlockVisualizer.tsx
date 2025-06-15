
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, ArrowLeft, Settings, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBlockRays } from '../hooks/useBlockRays';
import PixelatedRocket from '../components/retro/PixelatedRocket';
import AlienDancers from '../components/retro/AlienDancers';
import PixelGalaxyBackground from '../components/retro/PixelGalaxyBackground';
import RetroDJ from '../components/retro/RetroDJ';

const BlockVisualizer = () => {
  const navigate = useNavigate();
  const { blockRays } = useBlockRays();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [djEnabled, setDjEnabled] = useState(true);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  // Show last 8 blocks as rockets
  const displayBlocks = blockRays.slice(-8);
  const latestBlock = blockRays[blockRays.length - 1];

  // Auto-cycle through blocks
  useEffect(() => {
    if (displayBlocks.length > 0) {
      const interval = setInterval(() => {
        setCurrentBlockIndex((prev) => (prev + 1) % displayBlocks.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [displayBlocks.length]);

  const getRocketTrailColor = (block: any) => {
    const transactionCount = block.block?.transactions?.length || 0;
    const gasUsed = parseInt(block.block?.gasUsed || '0', 16);
    
    if (transactionCount > 100 || gasUsed > 25000000) return '#FF1493'; // Hot pink
    if (transactionCount > 50 || gasUsed > 15000000) return '#00FFFF';  // Cyan  
    return '#39FF14'; // Lime green
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-purple-900 via-black to-blue-900 relative">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 z-20 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackClick}
          className="bg-black/70 border-cyan-500/50 text-cyan-400 hover:bg-cyan-600/30 font-mono"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          EXIT
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-black/70 border-pink-500/50 text-pink-400 hover:bg-pink-600/30 font-mono"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDjEnabled(!djEnabled)}
          className="bg-black/70 border-green-500/50 text-green-400 hover:bg-green-600/30 font-mono"
        >
          <Zap className="w-4 h-4" />
        </Button>
      </div>

      {/* Retro Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-5xl font-bold font-mono bg-gradient-to-r from-cyan-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
          🚀 MONAD'S RETRO ROCKET RAVE 🕺
        </h1>
        <div className="text-center text-pink-400 text-sm font-mono mt-1 animate-pulse">
          [ SYNTHWAVE BLOCKCHAIN DISCO ]
        </div>
      </div>

      {/* Network Stats */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-black/80 border-cyan-500/50 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="text-cyan-400 space-y-2 font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                <span className="text-sm">LIVE ROCKET DISCO</span>
              </div>
              <div className="text-xs text-green-400">
                {blockRays.length} ROCKETS LAUNCHED
              </div>
              {latestBlock && (
                <div className="text-xs text-pink-400">
                  BLOCK #{parseInt(latestBlock.block?.number || '0', 16)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Instructions */}
      <div className="absolute bottom-4 right-4 z-20">
        <Card className="bg-black/80 border-green-500/50 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="text-green-400 text-sm space-y-1 font-mono">
              <div className="text-pink-400 font-bold">🕹️ ARCADE CONTROLS</div>
              <div className="text-xs">🚀 ROCKETS = BLOCKS</div>
              <div className="text-xs">👽 ALIENS = TRANSACTIONS</div>
              <div className="text-xs">🎵 DJ = LIVE ANNOUNCER</div>
              <div className="text-xs">💿 RECORDS = VINYL PLANETS</div>
              <div className="text-xs text-cyan-400">CLICK ALIENS TO ZAP!</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Retro Space Disco */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 20, 30]} fov={75} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={80}
          minDistance={10}
        />
        
        {/* Retro Neon Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[20, 30, 10]} 
          intensity={0.8} 
          color="#FF1493" 
        />
        <pointLight 
          position={[-20, 15, -15]} 
          intensity={0.7} 
          color="#00FFFF" 
        />
        <pointLight 
          position={[20, 10, 15]} 
          intensity={0.7} 
          color="#39FF14" 
        />
        <pointLight 
          position={[0, 25, 0]} 
          intensity={0.5} 
          color="#FFD700" 
        />
        
        {/* Retro Environment */}
        <Environment preset="night" />
        <PixelGalaxyBackground />
        
        {/* Pixelated Rockets for Blocks */}
        {displayBlocks.map((blockRay, index) => (
          <PixelatedRocket
            key={blockRay.id}
            block={blockRay.block}
            position={[
              (index - displayBlocks.length / 2) * 12,
              index * 2,
              -index * 8
            ]}
            size={1.5 + (blockRay.block?.transactions?.length || 0) / 200}
            trailColor={getRocketTrailColor(blockRay)}
          />
        ))}
        
        {/* Alien Dancers for Current Block */}
        {displayBlocks[currentBlockIndex] && (
          <AlienDancers
            transactions={displayBlocks[currentBlockIndex].block?.transactions || []}
            centerPosition={[
              (currentBlockIndex - displayBlocks.length / 2) * 12,
              0,
              -currentBlockIndex * 8
            ]}
          />
        )}
        
        {/* Retro DJ Announcer */}
        <RetroDJ 
          latestBlock={latestBlock?.block}
          isEnabled={djEnabled}
        />
      </Canvas>

      {/* Laser Show Effect for New Blocks */}
      {latestBlock && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl animate-pulse">
            ⚡
          </div>
          <div className="absolute bottom-1/3 right-1/4 text-6xl animate-bounce">
            🎵
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockVisualizer;
