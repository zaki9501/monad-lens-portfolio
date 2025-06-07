import React, { useState, useMemo } from 'react';
import { Filter, Wallet, Brain, Zap, ArrowRight, Circle, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TransactionFlowDiagramProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

interface Flow {
  id: string;
  type: 'sent' | 'received' | 'contract' | 'native';
  counterparty: string;
  counterpartyName: string;
  amount: number;
  token: string;
  frequency: number;
  totalValue: number;
  category: 'tokens' | 'native' | 'contracts';
  flows: { amount: number; timestamp: number }[];
}

const TransactionFlowDiagram = ({ data, isDarkMode, isLoreMode }: TransactionFlowDiagramProps) => {
  const [hoveredFlow, setHoveredFlow] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'tokens' | 'native' | 'contracts'>('all');
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);

  const walletAddress = data?.walletAddress?.toLowerCase() || '';

  const flowData: Flow[] = useMemo(() => {
    if (!data?.result?.data) return [];
    const activities = data.result.data;
    const flowsMap: Record<string, Flow> = {};
    activities.forEach(tx => {
      // Sent
      if (tx.from && tx.from.toLowerCase() === walletAddress) {
        const key = `sent-${tx.to}-${tx.addTokens?.[0]?.symbol || 'MON'}`;
        if (!flowsMap[key]) {
          flowsMap[key] = {
            id: key,
            type: 'sent',
            counterparty: tx.to,
            counterpartyName: '',
            amount: 0,
            token: tx.addTokens?.[0]?.symbol || 'MON',
            frequency: 0,
            totalValue: 0,
            category: tx.addTokens?.length ? 'tokens' : 'native',
            flows: []
          };
        }
        (tx.subTokens || []).forEach(t => {
          flowsMap[key].amount += Number(t.amount || 0);
          flowsMap[key].token = t.symbol;
          flowsMap[key].totalValue += Number(t.amount || 0);
          flowsMap[key].flows.push({ amount: t.amount, timestamp: tx.timestamp });
        });
        flowsMap[key].frequency++;
      }
      // Received
      if (tx.to && tx.to.toLowerCase() === walletAddress) {
        const key = `received-${tx.from}-${tx.addTokens?.[0]?.symbol || 'MON'}`;
        if (!flowsMap[key]) {
          flowsMap[key] = {
            id: key,
            type: 'received',
            counterparty: tx.from,
            counterpartyName: '',
            amount: 0,
            token: tx.addTokens?.[0]?.symbol || 'MON',
            frequency: 0,
            totalValue: 0,
            category: tx.addTokens?.length ? 'tokens' : 'native',
            flows: []
          };
        }
        (tx.addTokens || []).forEach(t => {
          flowsMap[key].amount += Number(t.amount || 0);
          flowsMap[key].token = t.symbol;
          flowsMap[key].totalValue += Number(t.amount || 0);
          flowsMap[key].flows.push({ amount: t.amount, timestamp: tx.timestamp });
        });
        flowsMap[key].frequency++;
      }
      // Contract interactions
      if (tx.isContract) {
        const key = `contract-${tx.to}`;
        if (!flowsMap[key]) {
          flowsMap[key] = {
            id: key,
            type: 'contract',
            counterparty: tx.to,
            counterpartyName: '',
            amount: 0,
            token: '',
            frequency: 0,
            totalValue: 0,
            category: 'contracts',
            flows: []
          };
        }
        flowsMap[key].frequency++;
        flowsMap[key].flows.push({ amount: 0, timestamp: tx.timestamp });
      }
    });
    return Object.values(flowsMap);
  }, [data, walletAddress]);

  const filteredFlows: Flow[] = useMemo(() => {
    if (filterType === 'all') return flowData;
    return flowData.filter(flow => flow.category === filterType);
  }, [flowData, filterType]);

  const getFlowWidth = (frequency: number) => {
    const maxFreq = Math.max(...flowData.map(f => f.frequency), 1);
    return Math.max(4, (frequency / maxFreq) * 20);
  };

  const getFlowColor = (type: string) => {
    switch (type) {
      case 'sent': return '#ef4444';      // red
      case 'received': return '#10b981';  // green
      case 'contract': return '#8b5cf6';  // purple
      case 'native': return '#3b82f6';    // blue
      default: return '#64748b';          // gray
    }
  };

  const getCounterpartyAvatar = (name: string) => {
    if (isLoreMode) {
      // Generate different monanimal faces based on name
      const faces = ['🐵', '🦊', '🐨', '🐺', '🦝', '🐸'];
      const index = name.charCodeAt(0) % faces.length;
      return faces[index];
    }
    return name.charAt(0).toUpperCase();
  };

  const filterOptions = [
    { id: 'all', label: 'All Transactions', icon: Circle },
    { id: 'tokens', label: 'Token Transfers', icon: Zap },
    { id: 'native', label: 'Native Transfers', icon: Wallet },
    { id: 'contracts', label: 'Contract Calls', icon: Brain }
  ];

  const isNative = (token) => token?.contractAddress === '0x0000000000000000000000000000000000000000';

  return (
    <div className="h-96 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${isDarkMode ? '#64748b' : '#94a3b8'} 2px, transparent 0)`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isLoreMode ? 'Mind Stream Flow' : 'Transaction Streamflow'}
          </h3>

          {/* Filter Controls */}
          <div className="flex items-center space-x-2">
            <Filter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div className="flex space-x-1">
              {filterOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={filterType === option.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(option.id as any)}
                  className="h-8 px-3 text-xs"
                >
                  <option.icon className="w-3 h-3 mr-1" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Flow Diagram */}
        <div className="flex items-center justify-between h-64">
          {/* Left Side - Wallet Node */}
          <div className="flex flex-col items-center">
            <div className={`relative p-6 rounded-full transition-all duration-500 transform hover:scale-110 ${
              isDarkMode ? 'bg-gradient-to-br from-purple-500 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-blue-500'
            } shadow-2xl`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
              <div className="absolute inset-0 rounded-full animate-pulse opacity-50 bg-gradient-to-br from-white/20 to-transparent" />
              
              {isLoreMode ? (
                <Brain className="w-8 h-8 text-white relative z-10" />
              ) : (
                <Wallet className="w-8 h-8 text-white relative z-10" />
              )}
              
              {/* Ripple Effect */}
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" 
                   style={{ animationDuration: '3s' }} />
            </div>
            
            <p className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isLoreMode ? 'Mind Core' : 'Your Wallet'}
            </p>
          </div>

          {/* Center - Flow Streams */}
          <div className="flex-1 relative h-full mx-8">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                {filteredFlows.map((flow, index) => (
                  <linearGradient key={flow.id} id={`gradient-${flow.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={getFlowColor(flow.type)} stopOpacity="0.8" />
                    <stop offset="50%" stopColor={getFlowColor(flow.type)} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={getFlowColor(flow.type)} stopOpacity="0.8" />
                  </linearGradient>
                ))}
              </defs>

              {filteredFlows.map((flow, index) => {
                const yPos = (index + 1) * (200 / (filteredFlows.length + 1));
                const flowWidth = getFlowWidth(flow.frequency);
                const isHovered = hoveredFlow === flow.id;
                
                return (
                  <g key={flow.id}>
                    {/* Main Flow Path */}
                    <path
                      d={`M 0 ${yPos} Q 200 ${yPos + (isHovered ? -20 : 0)} 400 ${yPos}`}
                      stroke={`url(#gradient-${flow.id})`}
                      strokeWidth={isHovered ? flowWidth * 1.5 : flowWidth}
                      fill="none"
                      className="transition-all duration-300"
                      onMouseEnter={() => setHoveredFlow(flow.id)}
                      onMouseLeave={() => setHoveredFlow(null)}
                    />
                    
                    {/* Animated Flow Particles */}
                    {isHovered && (
                      <>
                        <circle r="3" fill="#ffffff" opacity="0.8">
                          <animateMotion dur="2s" repeatCount="indefinite">
                            <mpath href={`#flow-path-${flow.id}`} />
                          </animateMotion>
                        </circle>
                        <circle r="2" fill="#ffffff" opacity="0.6">
                          <animateMotion dur="3s" repeatCount="indefinite" begin="0.5s">
                            <mpath href={`#flow-path-${flow.id}`} />
                          </animateMotion>
                        </circle>
                      </>
                    )}
                    
                    {/* Hidden path for animation */}
                    <path
                      id={`flow-path-${flow.id}`}
                      d={`M 0 ${yPos} Q 200 ${yPos} 400 ${yPos}`}
                      fill="none"
                      stroke="transparent"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Details */}
            {hoveredFlow && (
              <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-xl z-20 ${
                isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
              } animate-fade-in`}>
                {(() => {
                  const flow = filteredFlows.find(f => f.id === hoveredFlow);
                  if (!flow) return null;
                  
                  return (
                    <div className="text-center space-y-2">
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {flow.counterpartyName}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {flow.frequency} transactions • ${flow.totalValue.toLocaleString()} total value
                      </p>
                      {flow.amount && (
                        <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Latest: {flow.amount} {flow.token}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Side - Counterparties */}
          <div className="flex flex-col space-y-4">
            {filteredFlows.map((flow, index) => (
              <div
                key={flow.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                  hoveredFlow === flow.id 
                    ? isDarkMode ? 'bg-slate-700 shadow-lg scale-105' : 'bg-gray-100 shadow-lg scale-105'
                    : isDarkMode ? 'bg-slate-800/50 hover:bg-slate-700/70' : 'bg-white/50 hover:bg-gray-50'
                } ${isDarkMode ? 'border border-slate-600' : 'border border-gray-200'}`}
                onMouseEnter={() => setHoveredFlow(flow.id)}
                onMouseLeave={() => setHoveredFlow(null)}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  flow.type === 'sent' 
                    ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                    : flow.type === 'received'
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                      : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                }`}>
                  {getCounterpartyAvatar(flow.counterpartyName)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {flow.counterpartyName}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {flow.frequency} TXs
                  </p>
                </div>

                {/* Flow Indicator */}
                <div className="flex items-center space-x-1">
                  {flow.type === 'sent' && <ArrowRight className="w-4 h-4 text-red-400" />}
                  {flow.type === 'received' && <ArrowRight className="w-4 h-4 text-green-400 transform rotate-180" />}
                  {flow.type === 'contract' && <Zap className="w-4 h-4 text-purple-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Active Flows', value: filteredFlows.length, color: 'text-blue-400' },
            { label: 'Total Volume', value: `$${filteredFlows.reduce((sum, f) => sum + f.totalValue, 0).toLocaleString()}`, color: 'text-green-400' },
            { label: 'Unique Counterparties', value: new Set(filteredFlows.map(f => f.counterparty)).size, color: 'text-purple-400' }
          ].map((stat, index) => (
            <div key={index} className={`text-center p-3 rounded-lg ${
              isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'
            }`}>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionFlowDiagram;
