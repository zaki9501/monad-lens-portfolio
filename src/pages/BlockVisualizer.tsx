
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, Activity, Clock, Hash, ArrowLeft, Eye, Radio, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";

const fetchLatestBlock = async () => {
  const response = await fetch('https://monad-testnet.hypersync.xyz/', {
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
  const response = await fetch('https://monad-testnet.hypersync.xyz/', {
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
  
  const [latestBlock, setLatestBlock] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoreMode, setIsLoreMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const handleBackClick = () => {
    navigate('/');
  };

  const fetchBlockData = async () => {
    try {
      const [block, number] = await Promise.all([
        fetchLatestBlock(),
        fetchBlockNumber()
      ]);
      
      setLatestBlock(block);
      setBlockNumber(number);
      setLastUpdate(new Date());
      console.log('Block data updated:', { blockNumber: number, blockHash: block?.hash });
    } catch (error) {
      console.error('Failed to fetch block data:', error);
    }
  };

  const startLiveMode = () => {
    setIsLive(true);
    fetchBlockData();
  };

  const stopLiveMode = () => {
    setIsLive(false);
  };

  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(fetchBlockData, 3000); // Update every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(parseInt(timestamp, 16) * 1000);
    return date.toLocaleString();
  };

  const formatNumber = (hex) => {
    if (!hex) return 'N/A';
    return parseInt(hex, 16).toLocaleString();
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackClick}
            className={`${
              isDarkMode 
                ? 'border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700/50' 
                : 'border-gray-300 bg-white/80 text-gray-900 hover:bg-gray-50'
            } animate-fade-in`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Live Status */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/80 border border-gray-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isLive ? 'Live' : 'Stopped'}
              </span>
              {lastUpdate && (
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Box className={`w-12 h-12 mr-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} animate-pulse`} />
            <h1 className={`text-5xl font-bold ${
              isLoreMode 
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent'
                : isDarkMode 
                  ? 'text-white' 
                  : 'text-gray-900'
            }`}>
              {isLoreMode ? 'Chain Oracle' : 'Block Visualizer'}
            </h1>
          </div>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            {isLoreMode 
              ? 'Witness the birth of digital consensus in real-time' 
              : 'Real-time Monad testnet block monitoring and visualization'
            }
          </p>
          
          {/* Mode Toggles */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant={isDarkMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="animate-scale-in"
            >
              {isDarkMode ? '🌙' : '☀️'} {isDarkMode ? 'Dark' : 'Light'}
            </Button>
            <Button
              variant={isLoreMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLoreMode(!isLoreMode)}
              className="animate-scale-in"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isLoreMode ? 'Lore Mode' : 'Standard'}
            </Button>
          </div>
        </div>

        {/* Live Control */}
        <Card className={`max-w-2xl mx-auto mb-8 animate-slide-in-right ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
        }`}>
          <CardHeader>
            <CardTitle className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {isLoreMode ? 'Initiate Chain Oracle' : 'Live Block Monitor'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={startLiveMode}
                disabled={isLive}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Radio className="w-4 h-4 mr-2" />
                {isLoreMode ? 'Begin Observation' : 'Start Live Feed'}
              </Button>
              <Button 
                onClick={stopLiveMode}
                disabled={!isLive}
                variant="outline"
                className={isDarkMode ? 'border-slate-600 text-gray-300' : 'border-gray-300'}
              >
                Stop
              </Button>
            </div>
          </CardContent>
        </Card>

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
                <Card key={index} className={`${
                  isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
                } hover-scale`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.label}
                        </p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stat.value}
                        </p>
                      </div>
                      <stat.icon className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Block Details */}
            <Card className={`${
              isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
            } animate-fade-in`}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {isLoreMode ? 'Block Genesis Data' : 'Latest Block Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Block Hash
                    </p>
                    <p className={`font-mono text-sm break-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {latestBlock.hash}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Parent Hash
                    </p>
                    <p className={`font-mono text-sm break-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {latestBlock.parentHash}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Miner/Validator
                    </p>
                    <p className={`font-mono text-sm break-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {latestBlock.miner}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Gas Limit
                    </p>
                    <p className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(latestBlock.gasLimit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction List */}
            {latestBlock.transactions && latestBlock.transactions.length > 0 && (
              <Card className={`${
                isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
              } animate-fade-in`}>
                <CardHeader>
                  <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    Recent Transactions ({latestBlock.transactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {latestBlock.transactions.slice(0, 10).map((tx, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Hash className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                            <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {typeof tx === 'string' ? tx.slice(0, 10) + '...' : tx.hash?.slice(0, 10) + '...'}
                            </span>
                          </div>
                          {typeof tx === 'object' && tx.value && (
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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

        {/* Features Section */}
        {!latestBlock && (
          <div className="mt-16 grid gap-8 md:grid-cols-3 animate-fade-in">
            {[
              {
                title: isLoreMode ? "Genesis Witness" : "Real-time Blocks",
                description: isLoreMode 
                  ? "Observe the creation of new realities in the blockchain"
                  : "Monitor blocks as they are mined in real-time",
                icon: Box
              },
              {
                title: isLoreMode ? "Transaction Streams" : "Live Transactions", 
                description: isLoreMode
                  ? "Watch the flow of digital intentions across the network"
                  : "See transactions included in each new block",
                icon: Activity
              },
              {
                title: isLoreMode ? "Network Pulse" : "Network Stats",
                description: isLoreMode
                  ? "Feel the heartbeat of the decentralized consciousness"
                  : "Track gas usage, block times, and network activity",
                icon: Zap
              }
            ].map((feature, index) => (
              <Card key={index} className={`${
                isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
              } hover-scale`}>
                <CardHeader>
                  <div className={`w-12 h-12 ${
                    isDarkMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-purple-400 to-blue-400'
                  } rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockVisualizer;
