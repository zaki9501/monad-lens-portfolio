
import React, { useState } from 'react';
import { ArrowRight, ArrowDown, Repeat, Brain, Zap, Wallet, Circle } from 'lucide-react';

interface TransactionFlowDiagramProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const TransactionFlowDiagram = ({ data, isDarkMode, isLoreMode }: TransactionFlowDiagramProps) => {
  const [hoveredFlow, setHoveredFlow] = useState<number | null>(null);

  // Enhanced flow data with more visual elements
  const flowData = [
    {
      type: 'received',
      from: '0xabc...def',
      amount: '500 MON',
      timestamp: '2h ago',
      hash: '0x1234...abcd',
      gasUsed: '21000',
      status: 'success'
    },
    {
      type: 'sent',
      to: '0x123...456',
      amount: '150 MON', 
      timestamp: '5h ago',
      hash: '0x5678...efgh',
      gasUsed: '25000',
      status: 'success'
    },
    {
      type: 'contract',
      contract: '0x789...abc',
      method: 'swap',
      timestamp: '1d ago',
      hash: '0x9012...ijkl',
      gasUsed: '180000',
      status: 'success'
    }
  ];

  const getIcon = (type: string) => {
    if (isLoreMode) {
      return <Brain className="w-6 h-6" />;
    }
    switch (type) {
      case 'sent': return <ArrowRight className="w-6 h-6" />;
      case 'received': return <ArrowDown className="w-6 h-6" />;
      case 'contract': return <Repeat className="w-6 h-6" />;
      default: return <ArrowRight className="w-6 h-6" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'sent': 
        return {
          primary: isDarkMode ? 'from-red-500 to-red-600' : 'from-red-400 to-red-500',
          bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
          border: 'border-red-500',
          text: isDarkMode ? 'text-red-400' : 'text-red-600'
        };
      case 'received': 
        return {
          primary: isDarkMode ? 'from-green-500 to-green-600' : 'from-green-400 to-green-500',
          bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
          border: 'border-green-500',
          text: isDarkMode ? 'text-green-400' : 'text-green-600'
        };
      case 'contract': 
        return {
          primary: isDarkMode ? 'from-purple-500 to-purple-600' : 'from-purple-400 to-purple-500',
          bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
          border: 'border-purple-500',
          text: isDarkMode ? 'text-purple-400' : 'text-purple-600'
        };
      default: 
        return {
          primary: isDarkMode ? 'from-gray-500 to-gray-600' : 'from-gray-400 to-gray-500',
          bg: isDarkMode ? 'bg-gray-500/10' : 'bg-gray-50',
          border: 'border-gray-500',
          text: isDarkMode ? 'text-gray-400' : 'text-gray-600'
        };
    }
  };

  return (
    <div className="h-96 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkMode ? '#64748b' : '#94a3b8'} 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <h3 className={`text-xl font-bold mb-6 text-center relative z-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {isLoreMode ? 'Mind Flow Patterns' : 'Transaction Flow'}
      </h3>
      
      <div className="flex flex-col items-center space-y-8 relative z-10">
        {flowData.map((flow, index) => {
          const colors = getColors(flow.type);
          const isHovered = hoveredFlow === index;
          
          return (
            <div 
              key={index} 
              className="flex items-center space-x-6 w-full max-w-4xl"
              onMouseEnter={() => setHoveredFlow(index)}
              onMouseLeave={() => setHoveredFlow(null)}
            >
              {/* Connection line to previous */}
              {index > 0 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-transparent via-current to-transparent opacity-30 -mt-12" />
              )}
              
              {/* Icon container with enhanced styling */}
              <div className={`relative p-4 rounded-2xl transition-all duration-300 transform ${
                isHovered ? 'scale-110 shadow-2xl' : 'scale-100 shadow-lg'
              } bg-gradient-to-br ${colors.primary}`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                <div className={`${colors.text} relative z-10`}>
                  {getIcon(flow.type)}
                </div>
                
                {/* Pulse animation */}
                <div className={`absolute inset-0 rounded-2xl animate-pulse ${colors.bg} opacity-50`} />
                
                {/* Status indicator */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                  flow.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                } shadow-sm`} />
              </div>
              
              {/* Main content with enhanced design */}
              <div className="flex-1">
                <div className={`p-6 rounded-2xl transition-all duration-300 ${
                  isHovered ? 'transform scale-105 shadow-xl' : 'shadow-lg'
                } ${
                  isDarkMode ? 'bg-slate-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
                } border-l-4 ${colors.border} relative overflow-hidden`}>
                  
                  {/* Background pattern */}
                  <div className={`absolute inset-0 opacity-5 ${colors.bg}`} />
                  
                  {/* Content */}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <p className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {isLoreMode ? (
                            flow.type === 'sent' ? 'Energy Projection' :
                            flow.type === 'received' ? 'Energy Absorption' :
                            'Mind Bridge Activation'
                          ) : (
                            flow.type === 'sent' ? 'Sent Transaction' :
                            flow.type === 'received' ? 'Received Transaction' :
                            'Contract Interaction'
                          )}
                        </p>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          {flow.type.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Amount / Method
                          </p>
                          <p className={`font-mono text-lg font-bold ${colors.text}`}>
                            {flow.amount || flow.method || 'Interaction'}
                          </p>
                        </div>
                        
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Gas Used
                          </p>
                          <p className={`font-mono text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {flow.gasUsed}
                          </p>
                        </div>
                      </div>
                      
                      {/* Address info with enhanced styling */}
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100/50'}`}>
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                          {flow.from && 'From'}
                          {flow.to && 'To'}
                          {flow.contract && 'Contract'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Wallet className="w-4 h-4 opacity-60" />
                          <span className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {flow.from || flow.to || flow.contract}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timestamp with enhanced styling */}
                    <div className="text-right space-y-2">
                      <span className={`inline-flex items-center space-x-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Circle className="w-2 h-2 fill-current" />
                        <span>{flow.timestamp}</span>
                      </span>
                      <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {flow.hash}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  {isHovered && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.primary} opacity-5 rounded-2xl`} />
                  )}
                </div>
              </div>
              
              {/* Flow animation indicator */}
              <div className={`w-8 h-px bg-gradient-to-r ${colors.primary} animate-pulse opacity-60`} />
            </div>
          );
        })}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${
          isDarkMode ? 'from-purple-500 to-blue-500' : 'from-purple-400 to-blue-400'
        } animate-pulse`} />
      </div>
      
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
        <div className={`w-full h-full rounded-full bg-gradient-to-tr ${
          isDarkMode ? 'from-green-500 to-teal-500' : 'from-green-400 to-teal-400'
        } animate-pulse`} style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

export default TransactionFlowDiagram;
