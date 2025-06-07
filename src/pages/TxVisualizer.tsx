
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Brain, Zap, Activity, ArrowRight, Eye } from "lucide-react";
import WalletAvatar from "@/components/WalletAvatar";
import TransactionTimeline from "@/components/TransactionTimeline";
import TransactionFlowDiagram from "@/components/TransactionFlowDiagram";
import TokenMovementGraph from "@/components/TokenMovementGraph";
import ScanningAnimation from "@/components/ScanningAnimation";

const TxVisualizer = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [transactionData, setTransactionData] = useState(null);
  const [visualizationMode, setVisualizationMode] = useState('timeline');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoreMode, setIsLoreMode] = useState(false);

  const handleGenerateVisualization = async () => {
    if (!walletAddress) return;
    
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate blockchain scanning from block 0 to latest
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setScanProgress(i);
    }
    
    // Mock transaction data - in real implementation, this would come from blockchain
    const mockData = {
      totalTransactions: 47,
      sentTxs: 23,
      receivedTxs: 19,
      contractInteractions: 5,
      totalGasSpent: "0.025",
      dateRange: { from: "2024-01-15", to: "2024-06-07" },
      transactions: [
        {
          hash: "0x1234567890abcdef",
          type: "send",
          from: walletAddress,
          to: "0xabcdef1234567890",
          amount: "150.0",
          token: "MON",
          timestamp: new Date("2024-06-06T10:30:00"),
          gasUsed: "21000",
          blockNumber: 1234567,
          methodName: "transfer"
        },
        // More mock transactions...
      ]
    };
    
    setTransactionData(mockData);
    setIsScanning(false);
  };

  const visualizationModes = [
    { id: 'timeline', label: 'Timeline Chart', icon: Activity },
    { id: 'flow', label: 'Flow Diagram', icon: ArrowRight },
    { id: 'tokens', label: 'Token Movement', icon: Zap }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Brain className={`w-12 h-12 mr-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} animate-pulse`} />
            <h1 className={`text-5xl font-bold ${
              isLoreMode 
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent'
                : isDarkMode 
                  ? 'text-white' 
                  : 'text-gray-900'
            }`}>
              {isLoreMode ? 'Mind Trail Viewer' : 'Monad Mindscope'}
            </h1>
          </div>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            {isLoreMode 
              ? 'Unveil the hidden paths of consciousness through the blockchain' 
              : 'Visualize complete transaction history from block 0 to latest'
            }
          </p>
          
          {/* Mode Toggles */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant={isDarkMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="animate-scale-in"
            >
              {isDarkMode ? '🌙' : '☀️'} {isDarkMode ? 'Dark' : 'Light'}
            </Button>
            <Button
              variant={isLoreMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLoreMode(!isLoreMode)}
              className="animate-scale-in"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isLoreMode ? 'Lore Mode' : 'Standard'}
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className={`max-w-2xl mx-auto mb-8 animate-slide-in-right ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
        }`}>
          <CardHeader>
            <CardTitle className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {isLoreMode ? 'Enter the Mind Address' : 'Enter Wallet Address'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="0x... (Monad Testnet address)"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className={`flex-1 font-mono ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-gray-50 border-gray-300'
                }`}
              />
              <Button 
                onClick={handleGenerateVisualization}
                disabled={!walletAddress || isScanning}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoreMode ? 'Trace Mind' : 'Generate Visualization'}
              </Button>
            </div>
            
            {walletAddress && (
              <div className="flex items-center justify-center space-x-3 animate-fade-in">
                <WalletAvatar address={walletAddress} />
                <span className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scanning Animation */}
        {isScanning && (
          <ScanningAnimation 
            progress={scanProgress} 
            isDarkMode={isDarkMode}
            isLoreMode={isLoreMode}
          />
        )}

        {/* Results Section */}
        {transactionData && !isScanning && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { label: 'Total TXs', value: transactionData.totalTransactions, icon: Activity },
                { label: 'Sent', value: transactionData.sentTxs, icon: ArrowRight },
                { label: 'Received', value: transactionData.receivedTxs, icon: ArrowRight },
                { label: 'Gas Spent', value: `${transactionData.totalGasSpent} MON`, icon: Zap }
              ].map((stat, index) => (
                <Card key={index} className={`${
                  isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
                } hover-scale`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.label}
                        </p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stat.value}
                        </p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Visualization Mode Selector */}
            <div className="flex justify-center space-x-2">
              {visualizationModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant={visualizationMode === mode.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisualizationMode(mode.id)}
                  className="animate-scale-in"
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>

            {/* Visualization Content */}
            <Card className={`${
              isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
            } animate-fade-in`}>
              <CardContent className="p-6">
                {visualizationMode === 'timeline' && (
                  <TransactionTimeline 
                    data={transactionData} 
                    isDarkMode={isDarkMode}
                    isLoreMode={isLoreMode}
                  />
                )}
                {visualizationMode === 'flow' && (
                  <TransactionFlowDiagram 
                    data={transactionData} 
                    isDarkMode={isDarkMode}
                    isLoreMode={isLoreMode}
                  />
                )}
                {visualizationMode === 'tokens' && (
                  <TokenMovementGraph 
                    data={transactionData} 
                    isDarkMode={isDarkMode}
                    isLoreMode={isLoreMode}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Section */}
        {!transactionData && !isScanning && (
          <div className="mt-16 grid gap-8 md:grid-cols-3 animate-fade-in">
            {[
              {
                title: isLoreMode ? "Mind Mapping" : "Complete History",
                description: isLoreMode 
                  ? "Map every thought and intention from genesis to present"
                  : "Scan all blocks from 0 to latest for complete transaction history",
                icon: Brain
              },
              {
                title: isLoreMode ? "Flow Consciousness" : "Visual Analytics", 
                description: isLoreMode
                  ? "Visualize the flow of digital consciousness through time"
                  : "Beautiful charts, timelines, and flow diagrams",
                icon: Activity
              },
              {
                title: isLoreMode ? "Token Essence" : "Token Tracking",
                description: isLoreMode
                  ? "Track the essence of digital assets through their journey"
                  : "Follow token movements and contract interactions",
                icon: Zap
              }
            ].map((feature, index) => (
              <Card key={index} className={`${
                isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
              } hover-scale`}>
                <CardHeader>
                  <div className={`w-12 h-12 ${
                    isDarkMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gradient-to-r from-purple-400 to-blue-400'
                  } rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TxVisualizer;
