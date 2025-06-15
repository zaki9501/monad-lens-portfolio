import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe, Zap, Activity, TrendingUp, Users, Hash, ArrowRight, Fuel, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Globe3D from "@/components/Globe3D";
import StatsWaveChart from "@/components/pulse/StatsWaveChart";

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
  const [liveGlobeTransactions, setLiveGlobeTransactions] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const block = await fetchLatestBlock();
        setCurrentBlock(block);
        setRecentBlocks(prev => [block, ...prev.slice(0, 4)]);
        if (block?.transactions) {
          setTransactions(block.transactions);
          setLiveGlobeTransactions(prevTransactions => {
            const newTransactions = block.transactions || [];
            const uniqueNewTransactions = newTransactions.filter(
                (ntx: any) => !prevTransactions.some((ptx: any) => ptx.hash === ntx.hash)
            );
            const combinedTransactions = [...prevTransactions, ...uniqueNewTransactions];
            const maxGlobeRays = 50;
            return combinedTransactions.slice(-maxGlobeRays);
          });
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
    // Change label from "ETH" to "MON"
    return eth > 0.001 ? `${eth.toFixed(4)} MON` : `${wei.toLocaleString()} wei`;
  };

  const formatAddress = (address: string | null | undefined) => {
    if (!address || typeof address !== 'string') {
      return 'N/A';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleBlockClick = (block: any) => {
    setSelectedBlock(block);
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
              {/* Wave chart below blocks */}
              <div className="mt-3">
                <StatsWaveChart recentBlocks={recentBlocks} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center - 3D Globe Visualization */}
        <div className="col-span-6 relative">
          <Card className="bg-gray-900/30 border-green-900/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                MONAD NETWORK PULSE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)] relative">
              {/* Pass recentBlocks as blocks to Globe3D */}
              <Globe3D blocks={recentBlocks} onBlockClick={handleBlockClick} />

              {/* Overlay info */}
              <div className="absolute top-4 left-4 text-xs space-y-1">
                <div className="text-green-400">Active Validators: <span className="text-cyan-400">99</span></div>
                <div className="text-green-400">Connections: <span className="text-cyan-400">12</span></div>
                <div className="text-green-400">TPS: <span className="text-cyan-400">301</span></div>
              </div>
              
              <div className="absolute top-4 right-4 text-xs space-y-1">
                <div className="text-green-400">Latency: <span className="text-cyan-400">12ms</span></div>
                <div className="text-green-400">Health: <span className="text-green-400">98.7%</span></div>
                <div className="text-green-400">Block Time: <span className="text-cyan-400">~2.5s</span></div>
              </div>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-lg font-bold text-green-400">REAL-TIME MONITORING</div>
                <div className="text-sm text-green-600">
                  {transactions.length} active transactions
                </div>
              </div>

              {/* Selected Block Details Overlay within Globe Card */}
              {selectedBlock && (
                <div className="absolute bottom-4 left-4 bg-gray-900/70 border border-green-900/50 rounded-lg p-4 w-64 animate-fade-in-up shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-green-400">BLOCK DETAILS</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBlock(null)}
                      className="text-green-600 hover:text-green-400 p-0 h-auto"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-600">Number:</span>
                      <span className="text-green-400">{parseInt(selectedBlock.number, 16).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Hash:</span>
                      <span className="text-green-400">{formatAddress(selectedBlock.hash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Time:</span>
                      <span className="text-green-400">{new Date(parseInt(selectedBlock.timestamp, 16) * 1000).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">TXs:</span>
                      <span className="text-green-400">{selectedBlock.transactions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Gas Used:</span>
                      <span className="text-green-400">{parseInt(selectedBlock.gasUsed, 16).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Miner:</span>
                      <span className="text-green-400">{formatAddress(selectedBlock.miner)}</span>
                    </div>
                  </div>
                </div>
              )}
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

          {/* Performance Card */}
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
                <span className="text-sm text-cyan-400">~301</span>
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
