
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Package, User, Layers } from "lucide-react";

interface Block {
  number: string;
  timestamp: string;
  gasUsed: string;
  gasLimit: string;
  transactions: any[];
  miner?: string;
  hash: string;
}

interface LiveBlockFeedProps {
  currentBlock: Block | null;
  isLoading: boolean;
}

const LiveBlockFeed: React.FC<LiveBlockFeedProps> = ({ currentBlock, isLoading }) => {
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [newBlockAnimation, setNewBlockAnimation] = useState(false);

  useEffect(() => {
    if (currentBlock && !isLoading) {
      setRecentBlocks(prev => {
        const newBlocks = [currentBlock, ...prev.slice(0, 4)];
        setNewBlockAnimation(true);
        setTimeout(() => setNewBlockAnimation(false), 1000);
        return newBlocks;
      });
    }
  }, [currentBlock, isLoading]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(parseInt(timestamp, 16) * 1000).toLocaleTimeString();
  };

  const formatGasUsage = (gasUsed: string, gasLimit: string) => {
    const used = parseInt(gasUsed, 16);
    const limit = parseInt(gasLimit, 16);
    const percentage = ((used / limit) * 100).toFixed(1);
    return { used: used.toLocaleString(), percentage };
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Package className="h-5 w-5 text-purple-400" />
            Live Block Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700/50 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="h-5 w-5 text-purple-400" />
          Live Block Feed
          <div className="flex items-center gap-1 text-sm font-normal text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Real-time
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentBlocks.map((block, index) => {
          const gasData = formatGasUsage(block.gasUsed, block.gasLimit);
          const isLatest = index === 0;
          
          return (
            <div
              key={block.hash}
              className={`p-4 rounded-lg border transition-all duration-500 ${
                isLatest && newBlockAnimation
                  ? 'bg-purple-900/30 border-purple-400 shadow-lg shadow-purple-400/20 animate-pulse'
                  : 'bg-gray-900/50 border-gray-600'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      #{parseInt(block.number, 16).toLocaleString()}
                    </div>
                    {isLatest && (
                      <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                        Latest
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="h-4 w-4" />
                      {formatTimestamp(block.timestamp)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Zap className="h-4 w-4" />
                      Gas: {gasData.used} ({gasData.percentage}%)
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-blue-400 text-blue-400">
                    <Package className="h-3 w-3 mr-1" />
                    {block.transactions?.length || 0} TXs
                  </Badge>
                  
                  {block.miner && (
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      <User className="h-3 w-3 mr-1" />
                      {block.miner.slice(0, 8)}...
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="border-purple-400 text-purple-400">
                    <Layers className="h-3 w-3 mr-1" />
                    {block.hash.slice(0, 10)}...
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LiveBlockFeed;
