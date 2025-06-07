
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface TransactionTimelineProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const TransactionTimeline = ({ data, isDarkMode, isLoreMode }: TransactionTimelineProps) => {
  // Mock timeline data - in real implementation, this would be processed from blockchain data
  const timelineData = [
    { date: '2024-01', sent: 5, received: 8, contracts: 1 },
    { date: '2024-02', sent: 12, received: 15, contracts: 2 },
    { date: '2024-03', sent: 8, received: 6, contracts: 3 },
    { date: '2024-04', sent: 15, received: 12, contracts: 1 },
    { date: '2024-05', sent: 20, received: 18, contracts: 4 },
    { date: '2024-06', sent: 10, received: 14, contracts: 2 },
  ];

  const colors = {
    sent: isDarkMode ? '#ef4444' : '#dc2626',
    received: isDarkMode ? '#22c55e' : '#16a34a',
    contracts: isDarkMode ? '#8b5cf6' : '#7c3aed'
  };

  return (
    <div className="h-96">
      <h3 className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {isLoreMode ? 'Consciousness Timeline' : 'Transaction Timeline'}
      </h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="date" 
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          />
          <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
          />
          <Area
            type="monotone"
            dataKey="received"
            stackId="1"
            stroke={colors.received}
            fill={colors.received}
            fillOpacity={0.6}
            name={isLoreMode ? "Absorbed Energy" : "Received"}
          />
          <Area
            type="monotone"
            dataKey="sent"
            stackId="1"
            stroke={colors.sent}
            fill={colors.sent}
            fillOpacity={0.6}
            name={isLoreMode ? "Projected Energy" : "Sent"}
          />
          <Area
            type="monotone"
            dataKey="contracts"
            stackId="1"
            stroke={colors.contracts}
            fill={colors.contracts}
            fillOpacity={0.6}
            name={isLoreMode ? "Mind Bridges" : "Contract Calls"}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionTimeline;
