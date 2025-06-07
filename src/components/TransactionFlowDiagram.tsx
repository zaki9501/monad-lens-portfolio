
import React from 'react';
import { ArrowRight, ArrowDown, Repeat, Brain } from 'lucide-react';

interface TransactionFlowDiagramProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const TransactionFlowDiagram = ({ data, isDarkMode, isLoreMode }: TransactionFlowDiagramProps) => {
  // Mock flow data
  const flowData = [
    {
      type: 'received',
      from: '0xabc...def',
      amount: '500 MON',
      timestamp: '2h ago'
    },
    {
      type: 'sent',
      to: '0x123...456',
      amount: '150 MON', 
      timestamp: '5h ago'
    },
    {
      type: 'contract',
      contract: '0x789...abc',
      method: 'swap',
      timestamp: '1d ago'
    }
  ];

  const getIcon = (type: string) => {
    if (isLoreMode) {
      return <Brain className="w-5 h-5" />;
    }
    switch (type) {
      case 'sent': return <ArrowRight className="w-5 h-5" />;
      case 'received': return <ArrowDown className="w-5 h-5" />;
      case 'contract': return <Repeat className="w-5 h-5" />;
      default: return <ArrowRight className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'sent': return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'received': return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'contract': return isDarkMode ? 'text-purple-400' : 'text-purple-600';
      default: return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <div className="h-96">
      <h3 className={`text-xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {isLoreMode ? 'Mind Flow Patterns' : 'Transaction Flow'}
      </h3>
      
      <div className="flex flex-col items-center space-y-6">
        {flowData.map((flow, index) => (
          <div key={index} className="flex items-center space-x-4 w-full max-w-2xl animate-fade-in">
            <div className={`p-3 rounded-full ${
              isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
            } ${getColor(flow.type)}`}>
              {getIcon(flow.type)}
            </div>
            
            <div className="flex-1">
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
              } border-l-4 ${
                flow.type === 'sent' ? 'border-red-500' :
                flow.type === 'received' ? 'border-green-500' :
                'border-purple-500'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {isLoreMode ? (
                        flow.type === 'sent' ? 'Energy Projection' :
                        flow.type === 'received' ? 'Energy Absorption' :
                        'Mind Bridge Activation'
                      ) : (
                        flow.type === 'sent' ? 'Sent' :
                        flow.type === 'received' ? 'Received' :
                        'Contract Call'
                      )}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {flow.amount || flow.method || 'Interaction'}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {flow.from && `From: ${flow.from}`}
                      {flow.to && `To: ${flow.to}`}
                      {flow.contract && `Contract: ${flow.contract}`}
                    </p>
                  </div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {flow.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionFlowDiagram;
