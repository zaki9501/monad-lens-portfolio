import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Activity, Clock, Hash, ArrowLeft, Eye, Radio, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import Hyperspeed, { HyperspeedRef } from "../components/Hyperspeed/Hyperspeed";

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

const fetchBlockNumber = async () => {
  const response = await fetch('https://testnet-rpc.monad.xyz/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    })
  });
  
  if (!response.ok) throw new Error('Failed to fetch block number');
  const data = await response.json();
  return parseInt(data.result, 16);
};

const BlockVisualizer = () => {
  const navigate = useNavigate();
  const { authenticated } = usePrivy();
  const hyperspeedRef = useRef<HyperspeedRef>(null);
  
  const [latestBlock, setLatestBlock] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoreMode, setIsLoreMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastBlockHash, setLastBlockHash] = useState<string | null>(null);

  const handleBackClick = () => {
    navigate('/');
  };

  const fetchBlockData = async () => {
    try {
      console.log('Fetching block data...');
      setConnectionStatus('connecting');
      
      const [block, number] = await Promise.all([
        fetchLatestBlock(),
        fetchBlockNumber()
      ]);
      
      // Check if this is a new block
      const isNewBlock = lastBlockHash && block?.hash && block.hash !== lastBlockHash;
      
      setLatestBlock(block);
      setBlockNumber(number);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      
      // Add light ray for new blocks
      if (isNewBlock && hyperspeedRef.current) {
        console.log('New block detected, adding light ray:', block.hash);
        hyperspeedRef.current.addBlockLightRay(block);
      }
      
      setLastBlockHash(block?.hash || null);
      
      console.log('Block data updated:', { blockNumber: number, blockHash: block?.hash });
    } catch (error) {
      console.error('Failed to fetch block data:', error);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    fetchBlockData();
  }, []);

  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(fetchBlockData, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, lastBlockHash]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(parseInt(timestamp, 16) * 1000);
    return date.toLocaleString();
  };

  const formatNumber = (hex) => {
    if (!hex) return 'N/A';
    return parseInt(hex, 16).toLocaleString();
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-400';
      case 'connecting': return 'bg-yellow-400';
      case 'error': return 'bg-red-400';
      case 'stopped': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      case 'stopped': return 'Stopped';
      default: return 'Unknown';
    }
  };

  // Hyperspeed effect options
  const hyperspeedOptions = {
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 12,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: connectionStatus === 'connected' ? 2 : 1,
    carLightsFade: 0.4,
    totalSideLightSticks: 30,
    lightPairsPerRoadWay: 50,
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: isDarkMode ? 0x131318 : 0xffffff,
      brokenLines: isDarkMode ? 0x131318 : 0xffffff,
      leftCars: isLoreMode 
        ? [0xD856BF, 0x6750A2, 0xC247AC]
        : [0x03B3C3, 0x0E5EA5, 0x324555],
      rightCars: isLoreMode
        ? [0xFF322F, 0xA33010, 0xA81508] 
        : [0xD856BF, 0x6750A2, 0xC247AC],
      sticks: isDarkMode ? 0x03B3C3 : 0x6750A2,
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed ref={hyperspeedRef} effectOptions={hyperspeedOptions} />
      </div>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 z-10 bg-black/50" />
      
      {/* Content */}
      <div className={`relative z-20 min-h-screen transition-all duration-500`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackClick}
              className="border-slate-600 bg-slate-800/80 text-white hover:bg-slate-700/80 backdrop-blur-sm animate-fade-in"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Live Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 backdrop-blur-sm">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium text-white">
                  {getStatusText()}
                </span>
                {lastUpdate && connectionStatus === 'connected' && (
                  <span className="text-xs text-gray-400">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <Box className="w-12 h-12 mr-4 text-purple-400 animate-pulse" />
              <h1 className={`text-5xl font-bold ${
                isLoreMode 
                  ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent'
                  : 'text-white'
              }`}>
                {isLoreMode ? 'Chain Oracle' : 'Block Visualizer'}
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-6">
              {isLoreMode 
                ? 'Witness blockchain genesis as light rays pierce the hyperspeed void' 
                : 'Watch live Monad blocks as light rays in hyperspeed visualization'
              }
            </p>
            
            {/* Mode Toggles */}
            <div className="flex justify-center space-x-4 mb-8">
              <Button
                variant={isDarkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="animate-scale-in bg-slate-800/80 backdrop-blur-sm"
              >
                {isDarkMode ? '🌙' : '☀️'} {isDarkMode ? 'Dark' : 'Light'}
              </Button>
              <Button
                variant={isLoreMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLoreMode(!isLoreMode)}
                className="animate-scale-in bg-slate-800/80 backdrop-blur-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isLoreMode ? 'Lore Mode' : 'Standard'}
              </Button>
            </div>
          </div>

          {/* Connection Error Message */}
          {connectionStatus === 'error' && (
            <Card className="max-w-2xl mx-auto mb-8 bg-red-900/80 border-red-700 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <p className="text-red-300 mb-4">
                  Unable to connect to Monad testnet. Retrying automatically...
                </p>
                <Button 
                  onClick={fetchBlockData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Retry Connection
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Block Data */}
          {latestBlock && (
            <div className="space-y-8 animate-fade-in">
              {/* Block Stats */}
              <div className="grid gap-6 md:grid-cols-4">
                {[
                  { label: 'Block Number', value: formatNumber(latestBlock.number), icon: Box },
                  { label: 'Transactions', value: latestBlock.transactions?.length || 0, icon: Activity },
                  { label: 'Gas Used', value: formatNumber(latestBlock.gasUsed), icon: Zap },
                  { label: 'Timestamp', value: formatTimestamp(latestBlock.timestamp), icon: Clock }
                ].map((stat, index) => (
                  <Card key={index} className="bg-slate-800/80 border-slate-700 backdrop-blur-sm hover-scale">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">
                            {stat.label}
                          </p>
                          <p className="text-lg font-bold text-white">
                            {stat.value}
                          </p>
                        </div>
                        <stat.icon className="w-6 h-6 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Block Details */}
              <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-white">
                    {isLoreMode ? 'Block Genesis Data' : 'Latest Block Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        Block Hash
                      </p>
                      <p className="font-mono text-sm break-all text-white">
                        {latestBlock.hash}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        Parent Hash
                      </p>
                      <p className="font-mono text-sm break-all text-white">
                        {latestBlock.parentHash}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        Miner/Validator
                      </p>
                      <p className="font-mono text-sm break-all text-white">
                        {latestBlock.miner}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        Gas Limit
                      </p>
                      <p className="font-mono text-sm text-white">
                        {formatNumber(latestBlock.gasLimit)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction List */}
              {latestBlock.transactions && latestBlock.transactions.length > 0 && (
                <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Recent Transactions ({latestBlock.transactions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {latestBlock.transactions.slice(0, 10).map((tx, index) => (
                        <div key={index} className="p-3 rounded-lg bg-slate-700/50 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Hash className="w-4 h-4 text-purple-400" />
                              <span className="font-mono text-sm text-white">
                                {typeof tx === 'string' ? tx.slice(0, 10) + '...' : tx.hash?.slice(0, 10) + '...'}
                              </span>
                            </div>
                            {typeof tx === 'object' && tx.value && (
                              <span className="text-sm text-gray-400">
                                {(parseInt(tx.value, 16) / 1e18).toFixed(4)} MON
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Features Section when no block data */}
          {!latestBlock && connectionStatus !== 'error' && (
            <div className="mt-16 grid gap-8 md:grid-cols-3 animate-fade-in">
              {[
                {
                  title: isLoreMode ? "Genesis Light Rays" : "Block Light Rays",
                  description: isLoreMode 
                    ? "Each new block manifests as a brilliant light ray piercing through hyperspeed reality"
                    : "Watch new blocks appear as dynamic light rays shooting through the hyperspeed visualization",
                  icon: Box
                },
                {
                  title: isLoreMode ? "Transaction Streams" : "Live Transactions", 
                  description: isLoreMode
                    ? "Observe the flow of digital intentions across the network in real-time"
                    : "See transactions included in each new block with detailed hyperspeed visualization",
                  icon: Activity
                },
                {
                  title: isLoreMode ? "Network Pulse" : "Network Stats",
                  description: isLoreMode
                    ? "Feel the heartbeat of the decentralized consciousness through light and motion"
                    : "Track gas usage, block times, and network activity with immersive visual effects",
                  icon: Zap
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-slate-800/80 border-slate-700 backdrop-blur-sm hover-scale">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockVisualizer;
