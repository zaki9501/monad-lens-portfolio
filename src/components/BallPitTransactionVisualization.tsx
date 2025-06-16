import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Send, Download, Code, Zap } from "lucide-react";
import Ballpit from './Ballpit';
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const transactions = useMemo(() => {
    if (!data?.result?.data) return [];
    
    const activities = data.result.data;
    const txs: Transaction[] = [];
    
    // Process transactions with proper type detection
    activities.forEach((activity: any, index: number) => {
      let type: 'send' | 'receive' | 'contract' = 'contract';
      let amount = Number(activity.transactionFee || 0);
      let color = '#8b5cf6'; // Purple for contract
      
      // Check if it's a send transaction (wallet is the sender)
      if (activity.from && activity.from.toLowerCase()) {
        // If the transaction has recipients (to field or removeTokens), it's a send
        if (activity.to || (activity.removeTokens && activity.removeTokens.length > 0)) {
          type = 'send';
          color = '#ef4444'; // Red for send
          // Calculate sent amount from removeTokens
          if (activity.removeTokens && activity.removeTokens.length > 0) {
            amount = activity.removeTokens.reduce((sum: number, token: any) => sum + Number(token.amount || 0), 0);
          }
        } else {
          // Transaction from wallet but no clear recipient - likely contract interaction
          type = 'contract';
          color = '#8b5cf6'; // Purple for contract
        }
      }
      
      // Check if it's a receive transaction (wallet receives tokens)
      if (activity.addTokens && activity.addTokens.length > 0) {
        // Check if any token is being added to the wallet
        const hasIncomingTokens = activity.addTokens.some((token: any) => token.amount && Number(token.amount) > 0);
        if (hasIncomingTokens) {
          type = 'receive';
          color = '#10b981'; // Green for receive
          amount = activity.addTokens.reduce((sum: number, token: any) => sum + Number(token.amount || 0), 0);
        }
      }
      
      // If it's a contract interaction without clear send/receive, keep as contract
      if (activity.type && (activity.type.includes('contract') || activity.type.includes('call'))) {
        type = 'contract';
        color = '#8b5cf6'; // Purple for contract
      }
      
      txs.push({
        id: activity.hash || `tx-${index}`,
        type,
        amount,
        timestamp: new Date(activity.timestamp),
        hash: activity.hash || `hash-${index}`,
        from: activity.from,
        to: activity.to,
        gasUsed: Number(activity.transactionFee || 0),
        color
      });
    });

    console.log(`Processed ${txs.length} transactions:`, {
      send: txs.filter(t => t.type === 'send').length,
      receive: txs.filter(t => t.type === 'receive').length,
      contract: txs.filter(t => t.type === 'contract').length,
      breakdown: txs.map(t => ({ type: t.type, hash: t.hash.slice(0, 8) }))
    });
    
    return txs;
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBallClick = (ballIndex: number) => {
    console.log('Ball clicked, index:', ballIndex, 'Total transactions:', transactions.length);
    if (ballIndex >= 0 && ballIndex < transactions.length) {
      const transaction = transactions[ballIndex];
      setSelectedTransaction(transaction);
      console.log('Selected transaction:', transaction);
    } else {
      console.log('Ball index out of range - this should not happen');
    }
  };

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

  // Generate colors for ball pit based on ACTUAL transaction types
  const ballColors = useMemo(() => {
    const colors: number[] = [];
    const typeColors = {
      send: 0xef4444,      // Red
      receive: 0x10b981,   // Green
      contract: 0x8b5cf6   // Purple
    };

    transactions.forEach((tx) => {
      colors.push(typeColors[tx.type] || 0x8b5cf6);
    });

    console.log('Ball colors generated:', colors.length, 'transactions:', transactions.length, {
      send: colors.filter(c => c === typeColors.send).length,
      receive: colors.filter(c => c === typeColors.receive).length,
      contract: colors.filter(c => c === typeColors.contract).length
    });

    return colors;
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="h-72 sm:h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show message if no transactions
  if (transactions.length === 0) {
    return (
      <div className="h-72 sm:h-96 flex items-center justify-center">
        <div className={`text-center px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-base sm:text-lg mb-2">No transactions found</p>
          <p className="text-sm">This wallet has no transaction history to visualize</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${isMobile ? 'h-[400px]' : 'h-[600px]'}`}>
      {/* Ball Pit Container */}
      <div className="absolute inset-0">
        <div style={{
          position: 'relative', 
          overflow: 'hidden', 
          minHeight: isMobile ? '350px' : '500px', 
          maxHeight: isMobile ? '350px' : '500px', 
          width: '100%'
        }}>
          <Ballpit
            count={transactions.length}
            gravity={1.8}
            friction={0.8}
            wallBounce={0.95}
            followCursor={false}
            colors={ballColors}
            onBallClick={handleBallClick}
            className={`w-full h-full ${isDarkMode ? 'opacity-90' : 'opacity-95'}`}
          />
        </div>
      </div>

      {/* Ball Pit Label Overlay */}
      <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-10 px-2">
        <h3 className={`text-sm sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} bg-black/20 backdrop-blur-sm rounded px-2 sm:px-3 py-1 text-center`}>
          {isLoreMode ? "Mind Ball Pit" : "Transaction Ball Pit"} ({transactions.length} balls)
        </h3>
      </div>

      {/* Transaction Details Panel */}
      {selectedTransaction && (
        <div className={`absolute ${isMobile ? 'top-12 left-2 right-2' : 'top-4 left-4'} ${isMobile ? 'max-w-none' : 'max-w-sm'} z-20`}>
          <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} animate-scale-in`}>
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedTransaction.color }}
                  >
                    {getTypeIcon(selectedTransaction.type)}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getTypeLabel(selectedTransaction.type)}
                    </h4>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
              
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-4'} text-sm`}>
                <div>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount:</span>
                  <p className={`font-mono font-bold text-xs sm:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedTransaction.amount.toFixed(4)} MON
                  </p>
                </div>
                <div>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gas Used:</span>
                  <p className={`font-mono text-xs sm:text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedTransaction.gasUsed.toFixed(4)}
                  </p>
                </div>
                <div className={`${isMobile ? 'col-span-1' : 'col-span-2'}`}>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hash:</span>
                  <p className={`font-mono text-xs break-all ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {isMobile ? selectedTransaction.hash.slice(0, 20) + '...' : selectedTransaction.hash}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className={`absolute ${isMobile ? 'bottom-12' : 'bottom-16'} left-1/2 transform -translate-x-1/2 z-10 px-2`}>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-center space-x-6'} bg-black/20 backdrop-blur-sm rounded-lg p-3`}>
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
              <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className={`absolute ${isMobile ? 'bottom-2' : 'bottom-4'} left-1/2 transform -translate-x-1/2 z-10 px-2`}>
        <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} bg-black/20 backdrop-blur-sm rounded px-3 py-1`}>
          {isMobile ? 'Tap balls for details' : 'Click on any ball to see transaction details • 1 ball = 1 real transaction'}
        </div>
      </div>
    </div>
  );
};

export default BallPitTransactionVisualization;
