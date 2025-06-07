
import React from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TransactionTimelineProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const TransactionTimeline = ({ data, isDarkMode, isLoreMode }: TransactionTimelineProps) => {
  // Enhanced timeline data with more visual elements
  const timelineData = [
    { date: '2024-01', sent: 5, received: 8, contracts: 1, volume: 850, activity: 14 },
    { date: '2024-02', sent: 12, received: 15, contracts: 2, volume: 1200, activity: 29 },
    { date: '2024-03', sent: 8, received: 6, contracts: 3, volume: 950, activity: 17 },
    { date: '2024-04', sent: 15, received: 12, contracts: 1, volume: 1800, activity: 28 },
    { date: '2024-05', sent: 20, received: 18, contracts: 4, volume: 2200, activity: 42 },
    { date: '2024-06', sent: 10, received: 14, contracts: 2, volume: 1400, activity: 26 },
  ];

  const colors = {
    sent: isDarkMode ? '#ef4444' : '#dc2626',
    received: isDarkMode ? '#22c55e' : '#16a34a',
    contracts: isDarkMode ? '#8b5cf6' : '#7c3aed',
    volume: isDarkMode ? '#f59e0b' : '#d97706',
    grid: isDarkMode ? '#374151' : '#e5e7eb',
    text: isDarkMode ? '#9ca3af' : '#6b7280'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-lg border shadow-lg ${
          isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-8 mb-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isLoreMode ? (
                    entry.dataKey === 'sent' ? 'Energy Projected' :
                    entry.dataKey === 'received' ? 'Energy Absorbed' :
                    entry.dataKey === 'contracts' ? 'Mind Bridges' :
                    entry.dataKey === 'volume' ? 'Essence Flow' : entry.name
                  ) : entry.name}
                </span>
              </div>
              <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96 relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-r ${
          isDarkMode 
            ? 'from-purple-900/20 via-blue-900/20 to-purple-900/20' 
            : 'from-purple-100/40 via-blue-100/40 to-purple-100/40'
        } rounded-lg animate-pulse`} />
      </div>
      
      <h3 className={`text-xl font-bold mb-4 text-center relative z-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {isLoreMode ? 'Consciousness Timeline' : 'Transaction Timeline'}
      </h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.sent} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.sent} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.received} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.received} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="contractsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.contracts} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.contracts} stopOpacity={0.1}/>
            </linearGradient>
            <radialGradient id="glowEffect" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.volume} stopOpacity={0.6}/>
              <stop offset="100%" stopColor={colors.volume} stopOpacity={0}/>
            </radialGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={colors.grid} 
            strokeOpacity={0.3}
            strokeWidth={1}
          />
          
          <XAxis 
            dataKey="date" 
            stroke={colors.text}
            fontSize={12}
            fontWeight={500}
            axisLine={false}
            tickLine={false}
          />
          
          <YAxis 
            stroke={colors.text}
            fontSize={12}
            fontWeight={500}
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Volume bars in background */}
          <Bar
            dataKey="volume"
            fill="url(#glowEffect)"
            radius={[2, 2, 0, 0]}
            opacity={0.3}
          />
          
          {/* Main areas with gradients */}
          <Area
            type="monotone"
            dataKey="received"
            stackId="1"
            stroke={colors.received}
            fill="url(#receivedGradient)"
            strokeWidth={2}
            name={isLoreMode ? "Absorbed Energy" : "Received"}
          />
          
          <Area
            type="monotone"
            dataKey="sent"
            stackId="1"
            stroke={colors.sent}
            fill="url(#sentGradient)"
            strokeWidth={2}
            name={isLoreMode ? "Projected Energy" : "Sent"}
          />
          
          <Area
            type="monotone"
            dataKey="contracts"
            stackId="1"
            stroke={colors.contracts}
            fill="url(#contractsGradient)"
            strokeWidth={2}
            name={isLoreMode ? "Mind Bridges" : "Contract Calls"}
          />
          
          {/* Reference line for average activity */}
          <ReferenceLine 
            y={25} 
            stroke={isDarkMode ? '#64748b' : '#94a3b8'} 
            strokeDasharray="5 5" 
            strokeOpacity={0.5}
            label={{ value: "Avg Activity", position: "topLeft" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionTimeline;
