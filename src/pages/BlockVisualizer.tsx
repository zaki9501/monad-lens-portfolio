
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import Hyperspeed from "../components/Hyperspeed/Hyperspeed";
import EnhancedHyperspeedRays from '../components/EnhancedHyperspeedRays';
import BlockTooltip from '../components/BlockTooltip';
import { useBlockRays } from '../hooks/useBlockRays';

const BlockVisualizer = () => {
  const [newBlockDetected, setNewBlockDetected] = useState(false);
  const [blockRayCount, setBlockRayCount] = useState(40);
  const [networkActivity, setNetworkActivity] = useState(1);
  const { blockRays, hoveredRay, setHoveredRay } = useBlockRays();

  // Calculate network activity based on recent blocks
  useEffect(() => {
    if (blockRays.length > 0) {
      const recentBlocks = blockRays.slice(-3);
      const avgTransactions = recentBlocks.reduce((sum, ray) => 
        sum + (ray.block.transactions?.length || 0), 0
      ) / recentBlocks.length;
      
      // Normalize activity (assuming 100 transactions is high activity)
      const activity = Math.min(avgTransactions / 100, 2);
      setNetworkActivity(activity);
    }
  }, [blockRays]);

  // Enhanced block detection effects
  useEffect(() => {
    if (blockRays.length > 0) {
      setNewBlockDetected(true);
      
      // Adjust ray count based on network activity
      const baseRays = 40;
      const bonusRays = Math.floor(networkActivity * 20);
      setBlockRayCount(baseRays + bonusRays);
      
      setTimeout(() => {
        setNewBlockDetected(false);
        setBlockRayCount(40);
      }, 3000);
    }
  }, [blockRays.length, networkActivity]);

  const hyperspeedOptions = {
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 4,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: newBlockDetected ? (2 + networkActivity) : (1.5 + networkActivity * 0.5),
    carLightsFade: 0.4,
    totalSideLightSticks: 20 + Math.floor(networkActivity * 10),
    lightPairsPerRoadWay: blockRayCount,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5] as [number, number],
    lightStickHeight: [1.3 + networkActivity * 0.5, 1.7 + networkActivity * 0.8] as [number, number],
    movingAwaySpeed: [60 + networkActivity * 20, 120 + networkActivity * 40] as [number, number],
    movingCloserSpeed: [-120 - networkActivity * 30, -200 - networkActivity * 50] as [number, number],
    carLightsLength: [400 * 0.05, 400 * 0.3] as [number, number],
    carLightsRadius: [0.08, 0.20] as [number, number],
    carWidthPercentage: [0.3, 0.5] as [number, number],
    carShiftX: [-0.8, 0.8] as [number, number],
    carFloorSeparation: [0, 5] as [number, number],
    colors: {
      roadColor: newBlockDetected ? 0x1a1a2e : 0x080808,
      islandColor: newBlockDetected ? 0x16213e : 0x0a0a0a,
      background: 0x000000,
      shoulderLines: newBlockDetected ? 0x9333ea : 0x131318,
      brokenLines: newBlockDetected ? 0x9333ea : 0x131318,
      leftCars: [0x03B3C3, 0x6750A2, 0xD856BF, 0x0E5EA5, 0xC247AC],
      rightCars: [0xD856BF, 0x6750A2, 0xC247AC, 0x03B3C3, 0x0E5EA5],
      sticks: newBlockDetected ? 0x9333ea : 0x03B3C3,
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {/* Network Activity Indicator */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md rounded-lg p-4 text-white">
        <div className="text-sm text-gray-400">Network Activity</div>
        <div className="flex items-center space-x-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <div className="text-lg font-bold text-green-400">
            {(networkActivity * 100).toFixed(0)}%
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {blockRays.length} blocks tracked
        </div>
      </div>

      {/* 3D Highway Visualization */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 8, -5]} fov={90} />
        <Environment preset="night" />
        
        {/* Enhanced Block Rays */}
        <EnhancedHyperspeedRays 
          blockData={blockRays} 
          onRayHover={setHoveredRay} 
        />
        
        {/* Add some ambient lighting for the 3D elements */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} color="#9333ea" />
        <pointLight position={[0, 10, 0]} intensity={0.3} color="#06b6d4" />
      </Canvas>

      {/* Background Hyperspeed Effect */}
      <div className="absolute inset-0 opacity-70">
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>
      
      {/* Block Tooltip */}
      {hoveredRay && <BlockTooltip ray={hoveredRay} />}

      {/* New Block Flash Effect */}
      {newBlockDetected && (
        <div className="absolute inset-0 bg-purple-500/20 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default BlockVisualizer;
