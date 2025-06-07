
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowDown, Repeat, Zap, Circle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'contract';
  amount: string;
  from: string;
  to: string;
  timestamp: Date;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface LiveTransactionLoggerProps {
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const LiveTransactionLogger = ({ isDarkMode, isLoreMode }: LiveTransactionLoggerProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isActive, setIsActive] = useState(false);

  // Mock transaction types for simulation
  const transactionTypes = ['sent', 'received', 'contract'] as const;
  const mockAddresses = [
    '0xabc...def', '0x123...456', '0x789...abc', '0xdef...ghi', 
    '0x456...jkl', '0xmno...pqr', '0xstu...vwx', '0xyz...123'
  ];

  // Generate random transaction
  const generateTransaction = (): Transaction => {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const amount = (Math.random() * 1000 + 10).toFixed(2);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount: `${amount} MON`,
      from: mockAddresses[Math.floor(Math.random() * mockAddresses.length)],
      to: mockAddresses[Math.floor(Math.random() * mockAddresses.length)],
      timestamp: new Date(),
      x: Math.random() * 80 + 10, // 10% to 90% of container width
      y: Math.random() * 70 + 15, // 15% to 85% of container height
      size: Math.random() * 30 + 20, // 20px to 50px
      opacity: 1
    };
  };

  // Start/stop transaction simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        const newTransaction = generateTransaction();
        setTransactions(prev => [...prev, newTransaction]);
      }, Math.random() * 2000 + 500); // Random interval between 0.5-2.5s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // Remove old transactions and fade out existing ones
  useEffect(() => {
    const fadeInterval = setInterval(() => {
      setTransactions(prev => 
        prev
          .map(tx => ({ ...tx, opacity: tx.opacity - 0.05 }))
          .filter(tx => tx.opacity > 0)
      );
    }, 100);

    return () => clearInterval(fadeInterval);
  }, []);

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sent':
        return isDarkMode ? '#ef4444' : '#dc2626';
      case 'received':
        return isDarkMode ? '#22c55e' : '#16a34a';
      case 'contract':
        return isDarkMode ? '#8b5cf6' : '#7c3aed';
      default:
        return isDarkMode ? '#64748b' : '#94a3b8';
    }
  };

  const getTransactionIcon = (type: string) => {
    if (isLoreMode) {
      return <Zap className="w-4 h-4" />;
    }
    
    switch (type) {
      case 'sent':
        return <ArrowRight className="w-4 h-4" />;
      case 'received':
        return <ArrowDown className="w-4 h-4" />;
      case 'contract':
        return <Repeat className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    if (isLoreMode) {
      switch (type) {
        case 'sent':
          return 'Energy Projection';
        case 'received':
          return 'Energy Absorption';
        case 'contract':
          return 'Mind Bridge';
        default:
          return 'Consciousness Flow';
      }
    }
    
    switch (type) {
      case 'sent':
        return 'Sent';
      case 'received':
        return 'Received';
      case 'contract':
        return 'Contract';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="h-96 relative overflow-hidden rounded-2xl">
      {/* Background with grid pattern */}
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50'
      } rounded-2xl`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${isDarkMode ? '#64748b' : '#94a3b8'} 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 animate-pulse">
          <div className={`w-full h-full rounded-full bg-gradient-to-r ${
            isDarkMode ? 'from-purple-500 to-blue-500' : 'from-purple-400 to-blue-400'
          }`} />
        </div>
        
        <div className="absolute bottom-16 right-16 w-24 h-24 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
          <div className={`w-full h-full rounded-full bg-gradient-to-r ${
            isDarkMode ? 'from-green-500 to-teal-500' : 'from-green-400 to-teal-400'
          }`} />
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isLoreMode ? 'Consciousness Stream' : 'Live Transaction Monitor'}
          </h3>
          
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isActive ? 'Stop Monitor' : 'Start Monitor'}
          </button>
        </div>

        {/* Stats */}
        <div className="flex space-x-4 text-sm">
          <div className={`px-3 py-1 rounded-full ${
            isDarkMode ? 'bg-slate-800/50 text-gray-300' : 'bg-white/50 text-gray-600'
          }`}>
            Active: {transactions.length}
          </div>
          <div className={`px-3 py-1 rounded-full ${
            isDarkMode ? 'bg-slate-800/50 text-gray-300' : 'bg-white/50 text-gray-600'
          }`}>
            Status: {isActive ? 'Monitoring' : 'Stopped'}
          </div>
        </div>
      </div>

      {/* Transaction Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="absolute transition-all duration-300 ease-out"
            style={{
              left: `${tx.x}%`,
              top: `${tx.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: tx.opacity,
            }}
          >
            {/* Main bubble */}
            <div
              className="relative rounded-full shadow-lg animate-pulse flex items-center justify-center"
              style={{
                width: `${tx.size}px`,
                height: `${tx.size}px`,
                backgroundColor: getTransactionColor(tx.type),
                animation: `pulse 2s infinite, fadeIn 0.5s ease-out`,
              }}
            >
              {/* Icon */}
              <div className="text-white">
                {getTransactionIcon(tx.type)}
              </div>
              
              {/* Ripple effect */}
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: getTransactionColor(tx.type),
                  animationDuration: '2s',
                }}
              />
              
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-full opacity-50 blur-sm"
                style={{
                  backgroundColor: getTransactionColor(tx.type),
                  transform: 'scale(1.5)',
                }}
              />
            </div>

            {/* Transaction details tooltip */}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-2 rounded-lg text-xs font-mono whitespace-nowrap ${
              isDarkMode ? 'bg-slate-800/90 text-white' : 'bg-white/90 text-gray-900'
            } shadow-lg border ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
              <div className="font-bold">{getTransactionLabel(tx.type)}</div>
              <div>{tx.amount}</div>
              <div className="text-xs opacity-70">
                {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className={`p-3 rounded-lg backdrop-blur-sm ${
          isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
        } border ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
          <div className="flex justify-center space-x-6 text-xs">
            {transactionTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getTransactionColor(type) }}
                />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {getTransactionLabel(type)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network lines connecting some bubbles */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {transactions.slice(0, 5).map((tx, index) => {
          const nextTx = transactions[index + 1];
          if (!nextTx) return null;
          
          return (
            <line
              key={`${tx.id}-${nextTx.id}`}
              x1={`${tx.x}%`}
              y1={`${tx.y}%`}
              x2={`${nextTx.x}%`}
              y2={`${nextTx.y}%`}
              stroke={isDarkMode ? '#64748b' : '#94a3b8'}
              strokeWidth="1"
              strokeOpacity={Math.min(tx.opacity, nextTx.opacity) * 0.3}
              strokeDasharray="2,2"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default LiveTransactionLogger;
