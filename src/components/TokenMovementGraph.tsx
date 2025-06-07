
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface TokenMovementGraphProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const TokenMovementGraph = ({ data, isDarkMode, isLoreMode }: TokenMovementGraphProps) => {
  // Mock token data
  const tokenData = [
    { name: isLoreMode ? 'Mind Energy (MON)' : 'MON', value: 1250, color: '#8b5cf6' },
    { name: isLoreMode ? 'Dream Tokens (DAK)' : 'DAK', value: 500, color: '#06b6d4' },
    { name: isLoreMode ? 'Soul Currency (YAKI)' : 'YAKI', value: 2000, color: '#10b981' },
    { name: isLoreMode ? 'Thought Crystals (wMON)' : 'wMON', value: 750, color: '#f59e0b' },
  ];

  const movementData = [
    { month: 'Jan', inflow: 300, outflow: 200 },
    { month: 'Feb', inflow: 450, outflow: 280 },
    { month: 'Mar', inflow: 200, outflow: 350 },
    { month: 'Apr', inflow: 600, outflow: 150 },
    { month: 'May', inflow: 800, outflow: 400 },
    { month: 'Jun', inflow: 500, outflow: 300 },
  ];

  return (
    <div className="h-96">
      <h3 className={`text-xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {isLoreMode ? 'Energy Distribution & Flow' : 'Token Holdings & Movement'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        {/* Token Distribution Pie Chart */}
        <div>
          <h4 className={`text-lg font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isLoreMode ? 'Energy Distribution' : 'Token Distribution'}
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tokenData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {tokenData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#ffffff' : '#000000'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Token Movement Bar Chart */}
        <div>
          <h4 className={`text-lg font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isLoreMode ? 'Energy Flow Pattern' : 'Monthly Movement'}
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={movementData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="month" 
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
              <Bar 
                dataKey="inflow" 
                fill="#22c55e" 
                name={isLoreMode ? "Energy Absorbed" : "Inflow"}
              />
              <Bar 
                dataKey="outflow" 
                fill="#ef4444" 
                name={isLoreMode ? "Energy Projected" : "Outflow"}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TokenMovementGraph;
