
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe, Zap, Activity, TrendingUp, Users, Hash, ArrowRight, Fuel } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data fetching function (replace with actual Monad API)
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
  const [currentBlock, setCurrentBlock] = useState<any>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [recentBlocks, setRecentBlocks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const block = await fetchLatestBlock();
        setCurrentBlock(block);
        setRecentBlocks(prev => [block, ...prev.slice(0, 4)]);
        if (block?.transactions) {
          setTransactions(block.transactions.slice(0, 10));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch block data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: string) => {
    const wei = parseInt(value, 16);
    const eth = wei / 1e18;
    return eth > 0.001 ? `${eth.toFixed(4)} ETH` : `${wei.toLocaleString()} wei`;
  };

  const formatAddress = (address: string | null | undefined) => {
    if (!address || typeof address !== 'string') {
      return 'N/A';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      {/* Header */}
      <div className="border-b border-green-900/50 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-green-400">MONAD PULSE</h1>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>REAL-TIME</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Search address (0x...)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="bg-gray-900/50 border-green-900 text-green-400 placeholder-green-600"
            />
            <Button className="bg-green-600 hover:bg-green-700">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Left Panel - Stats */}
        <div className="col-span-3 space-y-4">
          {/* Network Stats */}
          <Card className="bg-gray-900/30 border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">NETWORK OVERVIEW</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {currentBlock ? parseInt(currentBlock.number, 16).toLocaleString() : '---'}
                  </div>
                  <div className="text-xs text-green-600">Block Height</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {currentBlock?.transactions?.length || 0}
                  </div>
                  <div className="text-xs text-cyan-600">Transactions</div>
                </div>
              </div>
              
              <div className="border-t border-green-900/50 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-green-600">Gas Used</span>
                  <span className="text-xs text-green-400">
                    {currentBlock ? `${((parseInt(currentBlock.gasUsed, 16) / parseInt(currentBlock.gasLimit, 16)) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-600 to-cyan-400 h-2 rounded-full"
                    style={{ 
                      width: currentBlock ? `${((parseInt(currentBlock.gasUsed, 16) / parseInt(currentBlock.gasLimit, 16)) * 100)}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Blocks */}
          <Card className="bg-gray-900/30 border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">RECENT BLOCKS</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {recentBlocks.map((block, index) => (
                    <div key={block.hash} className="flex items-center justify-between p-2 bg-gray-800/30 rounded border border-green-900/30">
                      <div>
                        <div className="text-sm font-bold text-green-400">
                          #{parseInt(block.number, 16).toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">
                          {block.transactions?.length || 0} txs
                        </div>
                      </div>
                      <div className="text-xs text-cyan-400">
                        {new Date(parseInt(block.timestamp, 16) * 1000).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Center - 3D Globe Visualization */}
        <div className="col-span-6 relative">
          <Card className="bg-gray-900/30 border-green-900/50 h-full">
            <CardContent className="p-0 h-full flex items-center justify-center relative overflow-hidden">
              {/* 3D Globe Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-96 h-96">
                  {/* Main Globe - 3D effect with gradients */}
                  <div className="absolute inset-0 rounded-full bg-gradient-radial from-green-900/20 via-green-800/30 to-green-700/50 border-2 border-green-500/50">
                    {/* Globe Meridians - Vertical lines */}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={`meridian-${i}`}
                        className="absolute border-green-500/30 rounded-full"
                        style={{
                          top: '5%',
                          bottom: '5%',
                          left: `${8.33 * i}%`,
                          width: '1px',
                          borderLeft: '1px solid',
                          transform: `perspective(400px) rotateY(${i * 15}deg)`,
                        }}
                      />
                    ))}
                    
                    {/* Globe Parallels - Horizontal lines */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`parallel-${i}`}
                        className="absolute border-green-500/30"
                        style={{
                          top: `${12.5 * i + 12.5}%`,
                          left: '5%',
                          right: '5%',
                          height: '1px',
                          borderTop: '1px solid',
                          borderRadius: '50%',
                          transform: `perspective(400px) rotateX(${(i - 4) * 10}deg)`,
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-pulse scale-110"></div>
                  
                  {/* Connection Points on Globe */}
                  {[
                    { x: 30, y: 40, label: 'Node 1' },
                    { x: 70, y: 25, label: 'Node 2' },
                    { x: 45, y: 65, label: 'Node 3' },
                    { x: 80, y: 50, label: 'Node 4' },
                    { x: 20, y: 70, label: 'Node 5' },
                  ].map((node, index) => (
                    <div key={node.label} className="absolute">
                      {/* Node Point */}
                      <div
                        className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"
                        style={{
                          top: `${node.y}%`,
                          left: `${node.x}%`,
                          zIndex: 10,
                          animationDelay: `${index * 300}ms`,
                        }}
                      />
                      
                      {/* Connection Rays */}
                      {index < 4 && (
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{ zIndex: 5 }}
                        >
                          <defs>
                            <linearGradient id={`ray-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.8)" />
                              <stop offset="50%" stopColor="rgba(6, 182, 212, 1)" />
                              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.8)" />
                            </linearGradient>
                          </defs>
                          <path
                            d={`M ${node.x * 3.84} ${node.y * 3.84} Q ${(node.x + 50) * 1.92} ${(node.y - 20) * 1.92} ${(node.x + 40) * 3.84} ${(node.y + 30) * 3.84}`}
                            stroke={`url(#ray-gradient-${index})`}
                            strokeWidth="2"
                            fill="none"
                            className="animate-pulse"
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))',
                              strokeDasharray: '10 5',
                              animation: `drawPath 3s ease-in-out infinite ${index * 500}ms`,
                            }}
                          />
                          
                          {/* Moving Energy Particle */}
                          <circle
                            r="2"
                            fill="rgba(6, 182, 212, 1)"
                            className="shadow-lg"
                            style={{
                              filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.8))',
                            }}
                          >
                            <animateMotion
                              dur="2s"
                              repeatCount="indefinite"
                              begin={`${index * 400}ms`}
                            >
                              <mpath href={`#path-${index}`} />
                            </animateMotion>
                          </circle>
                          
                          <path
                            id={`path-${index}`}
                            d={`M ${node.x * 3.84} ${node.y * 3.84} Q ${(node.x + 50) * 1.92} ${(node.y - 20) * 1.92} ${(node.x + 40) * 3.84} ${(node.y + 30) * 3.84}`}
                            fill="none"
                            opacity="0"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                  
                  {/* Data Flow Visualization */}
                  <div className="absolute inset-0">
                    {transactions.slice(0, 3).map((tx, index) => (
                      <div
                        key={tx.hash + index}
                        className="absolute w-1 h-1 bg-green-400 rounded-full animate-ping"
                        style={{
                          top: `${Math.random() * 80 + 10}%`,
                          left: `${Math.random() * 80 + 10}%`,
                          animationDelay: `${index * 600}ms`,
                          animationDuration: '2s',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Central Info Overlay */}
              <div className="z-20 text-center">
                <Globe className="h-12 w-12 text-green-400 mx-auto mb-2 animate-pulse" />
                <div className="text-lg font-bold text-green-400">MONAD NETWORK</div>
                <div className="text-sm text-green-600">Real-time blockchain monitoring</div>
                <div className="text-xs text-cyan-400 mt-2">
                  {transactions.length} active connections
                </div>
              </div>
              
              {/* Corner Stats */}
              <div className="absolute top-4 left-4 text-xs">
                <div className="text-green-400">TPS: <span className="text-cyan-400">1,247</span></div>
                <div className="text-green-400">Nodes: <span className="text-cyan-400">142</span></div>
              </div>
              
              <div className="absolute top-4 right-4 text-xs">
                <div className="text-green-400">Latency: <span className="text-cyan-400">12ms</span></div>
                <div className="text-green-400">Health: <span className="text-green-400">98.7%</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Live Activity */}
        <div className="col-span-3 space-y-4">
          {/* Transaction Stream */}
          <Card className="bg-gray-900/30 border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">LIVE TRANSACTIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx.hash + index}
                      className="p-2 bg-gray-800/30 rounded border border-green-900/30 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <Hash className="h-3 w-3 text-green-600" />
                        <span className="text-green-400">{formatAddress(tx.hash)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span className="text-cyan-400">{formatAddress(tx.from)}</span>
                        <ArrowRight className="h-3 w-3 text-green-600" />
                        <span className="text-green-400">{formatAddress(tx.to)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                          {formatValue(tx.value)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Fuel className="h-3 w-3" />
                          {parseInt(tx.gas, 16).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Network Performance */}
          <Card className="bg-gray-900/30 border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">PERFORMANCE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">Block Time</span>
                <span className="text-sm text-green-400">~2.5s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">TPS</span>
                <span className="text-sm text-cyan-400">~1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">Active Validators</span>
                <span className="text-sm text-green-400">142</span>
              </div>
              
              <div className="border-t border-green-900/50 pt-3">
                <div className="text-xs text-green-600 mb-2">Network Health</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-6 bg-green-600 rounded animate-pulse"></div>
                  <div className="h-6 bg-green-500 rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <div className="h-6 bg-cyan-400 rounded animate-pulse" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlockVisualizer;
