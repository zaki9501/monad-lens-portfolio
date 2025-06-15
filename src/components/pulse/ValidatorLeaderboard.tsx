
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, CheckCircle, XCircle } from "lucide-react";

interface Validator {
  address: string;
  blocksProduced: number;
  missedBlocks: number;
  performance: number;
  stake: string;
  status: 'active' | 'inactive';
}

const ValidatorLeaderboard: React.FC = () => {
  // Mock validator data
  const validators: Validator[] = [
    {
      address: '0x1234...5678',
      blocksProduced: 1250,
      missedBlocks: 15,
      performance: 98.8,
      stake: '32.5 ETH',
      status: 'active'
    },
    {
      address: '0x2345...6789',
      blocksProduced: 1198,
      missedBlocks: 8,
      performance: 99.3,
      stake: '45.2 ETH',
      status: 'active'
    },
    {
      address: '0x3456...7890',
      blocksProduced: 1156,
      missedBlocks: 22,
      performance: 98.1,
      stake: '38.7 ETH',
      status: 'active'
    },
    {
      address: '0x4567...8901',
      blocksProduced: 1089,
      missedBlocks: 5,
      performance: 99.5,
      stake: '51.3 ETH',
      status: 'active'
    },
    {
      address: '0x5678...9012',
      blocksProduced: 987,
      missedBlocks: 45,
      performance: 95.6,
      stake: '29.8 ETH',
      status: 'inactive'
    }
  ];

  const getPerformanceColor = (performance: number) => {
    if (performance >= 99) return 'text-green-400';
    if (performance >= 97) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceBg = (performance: number) => {
    if (performance >= 99) return 'bg-green-400';
    if (performance >= 97) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Top Performers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">99.5%</div>
            <div className="text-sm text-gray-400">Best Performance</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">156</div>
            <div className="text-sm text-gray-400">Total Validators</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">98.7%</div>
            <div className="text-sm text-gray-400">Avg Performance</div>
          </CardContent>
        </Card>
      </div>

      {/* Validator Leaderboard */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Validator Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validators.map((validator, index) => (
              <div
                key={validator.address}
                className="p-4 rounded-lg bg-gray-900/50 border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[40px]">
                      <div className="text-xl font-bold text-purple-400">
                        #{index + 1}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white">{validator.address}</span>
                        <Badge 
                          variant={validator.status === 'active' ? 'default' : 'secondary'}
                          className={validator.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}
                        >
                          {validator.status === 'active' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {validator.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Stake: {validator.stake}</span>
                        <span>Blocks: {validator.blocksProduced.toLocaleString()}</span>
                        <span>Missed: {validator.missedBlocks}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Performance</span>
                      <span className={`font-bold ${getPerformanceColor(validator.performance)}`}>
                        {validator.performance}%
                      </span>
                    </div>
                    <Progress 
                      value={validator.performance} 
                      className="h-2"
                      style={{
                        background: '#374151'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidatorLeaderboard;
