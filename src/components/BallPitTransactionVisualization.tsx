
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Send, Download, Code, Zap } from "lucide-react";
import Ballpit from './Ballpit';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'contract';
  amount: number;
  timestamp: Date;
  hash: string;
  from?: string;
  to?: string;
  gasUsed: number;
  color: string;
}

interface BallPitTransactionVisualizationProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const BallPitTransactionVisualization: React.FC<BallPitTransactionVisualizationProps> = ({
  data,
  isDarkMode,
  isLoreMode
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const transactions = useMemo(() => {
    if (!data?.result?.data) return [];
    
    const activities = data.result.data;
    const txs: Transaction[] = [];
    
    activities.forEach((activity: any) => {
      let type: 'send' | 'receive' | 'contract' = 'contract';
      let amount = Number(activity.transactionFee || 0);
      let color = '#8b5cf6';
      
      if (activity.from) {
        type = 'send';
        color = '#ef4444';
      } else if (activity.addTokens?.length > 0) {
        type = 'receive';
        color = '#10b981';
        amount = activity.addTokens.reduce((sum: number, token: any) => sum + Number(token.amount || 0), 0);
      }
      
      txs.push({
        id: activity.hash,
        type,
        amount,
        timestamp: new Date(activity.timestamp),
        hash: activity.hash,
        from: activity.from,
        to: activity.to,
        gasUsed: Number(activity.transactionFee || 0),
        color
      });
    });
    
    return txs;
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send': return <Send className="w-4 h-4" />;
      case 'receive': return <Download className="w-4 h-4" />;
      case 'contract': return <Code className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    if (isLoreMode) {
      switch (type) {
        case 'send': return 'Mind Send';
        case 'receive': return 'Mind Receive';
        case 'contract': return 'Mind Bridge';
        default: return 'Memory';
      }
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Generate colors for ball pit based on transaction types
  const ballColors = useMemo(() => {
    const colors: number[] = [];
    const typeColors = {
      send: 0xef4444,
      receive: 0x10b981,
      contract: 0x8b5cf6
    };

    transactions.forEach((tx) => {
      colors.push(typeColors[tx.type] || 0x8b5cf6);
    });

    // Fill with default colors if we have fewer transactions than balls
    while (colors.length < 200) {
      colors.push(0x8b5cf6);
    }

    return colors;
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      {/* Ball Pit Container */}
      <div className="absolute inset-0">
        <div style={{position: 'relative', overflow: 'hidden', minHeight: '500px', maxHeight: '500px', width: '100%'}}>
          <Ballpit
            count={Math.min(transactions.length, 200)}
            gravity={0.7}
            friction={0.8}
            wallBounce={0.95}
            followCursor={true}
            colors={ballColors}
            className={`w-full h-full ${isDarkMode ? 'opacity-90' : 'opacity-95'}`}
          />
        </div>
      </div>

      {/* Ball Pit Label Overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} bg-black/20 backdrop-blur-sm rounded px-3 py-1`}>
          {isLoreMode ? "Mind Ball Pit" : "Transaction Ball Pit"}
        </h3>
      </div>

      {/* Transaction Details Panel */}
      {selectedTransaction && (
        <div className="absolute top-4 left-4 max-w-sm z-20">
          <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} animate-scale-in`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedTransaction.color }}
                  >
                    {getTypeIcon(selectedTransaction.type)}
                  </div>
                  <div>
                    <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getTypeLabel(selectedTransaction.type)}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedTransaction.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount:</span>
                  <p className={`font-mono font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedTransaction.amount} MON
                  </p>
                </div>
                <div>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gas Used:</span>
                  <p className={`font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedTransaction.gasUsed}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hash:</span>
                  <p className={`font-mono text-xs break-all ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedTransaction.hash}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex justify-center space-x-6 bg-black/20 backdrop-blur-sm rounded-lg p-3">
          {[
            { type: 'send', color: '#ef4444', label: isLoreMode ? 'Mind Send' : 'Sent' },
            { type: 'receive', color: '#10b981', label: isLoreMode ? 'Mind Receive' : 'Received' },
            { type: 'contract', color: '#8b5cf6', label: isLoreMode ? 'Mind Bridge' : 'Contract' }
          ].map((item) => (
            <div key={item.type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} bg-black/20 backdrop-blur-sm rounded px-3 py-1`}>
          Move your cursor to interact with balls • Each ball represents a transaction
        </div>
      </div>
    </div>
  );
};

export default BallPitTransactionVisualization;
