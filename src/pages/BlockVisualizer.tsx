
import React, { useState, useEffect, useRef } from 'react';
import Hyperspeed from "../components/Hyperspeed/Hyperspeed";

const fetchLatestBlock = async () => {
  const response = await fetch('https://testnet-rpc.monad.xyz/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['latest', true],
      id: 1
    })
  });
  
  if (!response.ok) throw new Error('Failed to fetch block');
  const data = await response.json();
  return data.result;
};

const BlockVisualizer = () => {
  const [lastBlockHash, setLastBlockHash] = useState<string | null>(null);
  const [newBlockDetected, setNewBlockDetected] = useState(false);
  const [blockRayCount, setBlockRayCount] = useState(40);

  const fetchBlockData = async () => {
    try {
      const block = await fetchLatestBlock();
      
      // Check if this is a new block
      const isNewBlock = lastBlockHash && block?.hash && block.hash !== lastBlockHash;
      
      if (isNewBlock) {
        console.log('New block detected:', block.hash);
        setNewBlockDetected(true);
        
        // Add more light rays for the new block
        setBlockRayCount(prev => prev + 5);
        
        // Reset after animation
        setTimeout(() => {
          setNewBlockDetected(false);
          setBlockRayCount(40);
        }, 2000);
      }
      
      setLastBlockHash(block?.hash || null);
    } catch (error) {
      console.error('Failed to fetch block data:', error);
    }
  };

  useEffect(() => {
    fetchBlockData();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchBlockData, 3000);
    return () => clearInterval(interval);
  }, [lastBlockHash]);

  const hyperspeedOptions = {
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 4,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: newBlockDetected ? 4 : 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: blockRayCount,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5] as [number, number],
    lightStickHeight: [1.3, 1.7] as [number, number],
    movingAwaySpeed: [60, 120] as [number, number],
    movingCloserSpeed: [-120, -200] as [number, number],
    carLightsLength: [400 * 0.05, 400 * 0.3] as [number, number],
    carLightsRadius: [0.08, 0.20] as [number, number],
    carWidthPercentage: [0.3, 0.5] as [number, number],
    carShiftX: [-0.8, 0.8] as [number, number],
    carFloorSeparation: [0, 5] as [number, number],
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0x131318,
      brokenLines: 0x131318,
      leftCars: [0x03B3C3, 0x6750A2, 0xD856BF, 0x0E5EA5, 0xC247AC],
      rightCars: [0xD856BF, 0x6750A2, 0xC247AC, 0x03B3C3, 0x0E5EA5],
      sticks: 0x03B3C3,
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <Hyperspeed effectOptions={hyperspeedOptions} />
    </div>
  );
};

export default BlockVisualizer;
