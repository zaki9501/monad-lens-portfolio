
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, Activity, Package } from "lucide-react";

const ChartsSection: React.FC = () => {
  const [blockData, setBlockData] = useState<any[]>([]);
  const [gasData, setGasData] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock data for demonstration
    const generateMockData = () => {
      const blocks = [];
      const gas = [];
      const now = Date.now();
      
      for (let i = 0; i < 20; i++) {
        const time = now - (19 - i) * 60000; // 1 minute intervals
        blocks.push({
          time: new Date(time).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          blocks: Math.floor(Math.random() * 10) + 50,
          transactions: Math.floor(Math.random() * 500) + 100
        });
        
        gas.push({
          time: new Date(time).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          avgGas: Math.floor(Math.random() * 500000) + 100000,
          maxGas: Math.floor(Math.random() * 1000000) + 500000
        });
      }
      
      setBlockData(blocks);
      setGasData(gas);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const formatGas = (value: number) => {
    return `${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Blocks Per Minute Chart */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Package className="h-5 w-5 text-blue-400" />
            Blocks & Transactions Per Minute
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={blockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="blocks" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Blocks"
              />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Transactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gas Usage Chart */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-yellow-400" />
            Gas Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickFormatter={formatGas}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatGas(value), '']}
              />
              <Bar 
                dataKey="avgGas" 
                fill="#F59E0B" 
                name="Avg Gas"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="maxGas" 
                fill="#EF4444" 
                name="Max Gas"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Network Stats */}
      <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-purple-400" />
            Network Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">1.2s</div>
              <div className="text-sm text-gray-400">Avg Block Time</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">98.7%</div>
              <div className="text-sm text-gray-400">Network Uptime</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400">9.8K</div>
              <div className="text-sm text-gray-400">Peak TPS</div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400">156</div>
              <div className="text-sm text-gray-400">Active Validators</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;
