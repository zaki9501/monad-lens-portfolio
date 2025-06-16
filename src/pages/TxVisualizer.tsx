import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Brain, Zap, Activity, ArrowRight, Eye, Radio, ArrowLeft, Shield, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import WalletAvatar from "@/components/WalletAvatar";
import TransactionTimeline from "@/components/TransactionTimeline";
import TokenMovementGraph from "@/components/TokenMovementGraph";
import LiveTransactionLogger from "@/components/LiveTransactionLogger";
import WalletScoreCard from "@/components/WalletScoreCard";
import ScanningAnimation from "@/components/ScanningAnimation";
import AnalysisResults from "@/components/AnalysisResults";

const fetchAccountActivities = async (address, apiKey, limit = 130) => {
  const url = `https://api.blockvision.org/v2/monad/account/activities?address=${address}&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'x-api-key': apiKey,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch activities');
  return res.json();
};

const fetchTotalTransactions = async (address, apiKey) => {
  const url = `https://api.blockvision.org/v2/monad/account/transactions?address=${address}&limit=1&ascendingOrder=false`;
  const res = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'x-api-key': apiKey,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.result?.total || null;
};

const TxVisualizer = () => {
  const navigate = useNavigate();
  const { login, ready, authenticated, user } = usePrivy();
  
  const [walletAddress, setWalletAddress] = useState('');
  const [connectedWallet, setConnectedWallet] = useState('');
  const [showConnectedWalletPrompt, setShowConnectedWalletPrompt] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [transactionData, setTransactionData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [visualizationMode, setVisualizationMode] = useState('timeline');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoreMode, setIsLoreMode] = useState(false);
  const [totalTxCount, setTotalTxCount] = useState(null);

  // Get connected wallet from Privy
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      setConnectedWallet(user.wallet.address);
      // Show prompt only if no wallet address is set and user just connected
      if (!walletAddress) {
        setShowConnectedWalletPrompt(true);
      }
      console.log('Connected wallet:', user.wallet.address);
    } else {
      setConnectedWallet('');
      setShowConnectedWalletPrompt(false);
    }
  }, [authenticated, user, walletAddress]);

  const handleBackClick = () => {
    console.log('Back button clicked');
    navigate('/');
  };

  const handleWalletConnect = async () => {
    if (!ready) return;
    try {
      await login();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleVisualizeConnectedWallet = () => {
    setWalletAddress(connectedWallet);
    setShowConnectedWalletPrompt(false);
    // Auto-generate visualization for connected wallet
    setTimeout(() => {
      handleGenerateVisualization(connectedWallet);
    }, 100);
  };

  const isWalletOwner = () => {
    if (!connectedWallet || !walletAddress) return false;
    return connectedWallet.toLowerCase() === walletAddress.toLowerCase();
  };

  const handleGenerateVisualization = async (addressToUse = walletAddress) => {
    if (!addressToUse) return;
    setIsScanning(true);
    setScanProgress(0);

    try {
      // Simulate scan progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 20));
        setScanProgress(i);
      }
      const apiKey = import.meta.env.VITE_BLOCKVISION_API_KEY;
      const data = await fetchAccountActivities(addressToUse, apiKey, 130);
      setTransactionData(data);
      setAnalysisData(null);

      const activities = data?.result?.data || [];
      const totalTransactions = activities.length;
      const sentTxs = activities.filter(tx => tx.from?.toLowerCase() === addressToUse.toLowerCase()).length;
      const receivedTxs = activities.filter(
        tx => Array.isArray(tx.addTokens) && tx.addTokens.some(token => token.to?.toLowerCase() === addressToUse.toLowerCase())
      ).length;
      const totalGasSpent = activities
        .filter(tx => tx.transactionFee)
        .reduce((sum, tx) => sum + Number(tx.transactionFee), 0);
    } catch (e) {
      setTransactionData(null);
      setAnalysisData(null);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const getTotalTxCount = async () => {
      if (!walletAddress) return;
      const apiKey = import.meta.env.VITE_BLOCKVISION_API_KEY;
      const total = await fetchTotalTransactions(walletAddress, apiKey);
      setTotalTxCount(total);
    };
    getTotalTxCount();
  }, [walletAddress]);

  const visualizationModes = [
    { id: 'timeline', label: 'Timeline Chart', icon: Activity },
    { id: 'tokens', label: 'Token Movement', icon: Zap },
    { id: 'score', label: 'Wallet Stats', icon: Shield },
    { id: 'live', label: 'Live Monitor', icon: Radio }
  ];

  // Calculate stats from transactionData
  const activities = transactionData?.result?.data || [];
  const sentTxs = activities.filter(tx => tx.from?.toLowerCase() === walletAddress.toLowerCase()).length;
  const receivedTxs = activities.filter(
    tx => Array.isArray(tx.addTokens) && tx.addTokens.some(token => token.to?.toLowerCase() === walletAddress.toLowerCase())
  ).length;
  const totalGasSpent = activities
    .filter(tx => tx.transactionFee)
    .reduce((sum, tx) => sum + Number(tx.transactionFee), 0);
  const totalTransactions = totalTxCount !== null ? totalTxCount : activities.length;

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Wallet Connection */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackClick}
            className={`${
              isDarkMode 
                ? 'border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700/50' 
                : 'border-gray-300 bg-white/80 text-gray-900 hover:bg-gray-50'
            } animate-fade-in`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Wallet Connection Status */}
          <div className="flex items-center space-x-4">
            {authenticated && connectedWallet ? (
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/80 border border-gray-200'
              }`}>
                <WalletAvatar address={connectedWallet} />
                <div className="text-sm">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Connected
                  </div>
                  <div className={`font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleWalletConnect}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={!ready}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

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

        {/* Connected Wallet Prompt */}
        {showConnectedWalletPrompt && connectedWallet && (
          <Card className={`max-w-2xl mx-auto mb-6 animate-slide-in-down border-2 ${
            isDarkMode ? 'bg-purple-900/30 border-purple-500/50' : 'bg-purple-50 border-purple-300'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Wallet className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Wallet Connected!
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Would you like to visualize your connected wallet?
                    </p>
                    <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConnectedWalletPrompt(false)}
                    className={isDarkMode ? 'border-slate-600 text-gray-300' : 'border-gray-300'}
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={handleVisualizeConnectedWallet}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualize
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                onClick={() => handleGenerateVisualization()}
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
                {connectedWallet && walletAddress && (
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    isWalletOwner() 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}>
                    {isWalletOwner() ? 'Owner' : 'Viewer'}
                  </div>
                )}
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

        {/* Analysis Results */}
        {analysisData && !isScanning && (
          <AnalysisResults 
            isDarkMode={isDarkMode}
            isLoreMode={isLoreMode}
            analysisData={analysisData}
          />
        )}

        {/* Results Section */}
        {transactionData && !isScanning && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { label: 'Total TXs', value: totalTransactions, icon: Activity },
                { label: 'Sent', value: sentTxs, icon: ArrowRight },
                { label: 'Received', value: receivedTxs, icon: ArrowRight },
                { label: 'Gas Spent', value: `${totalGasSpent} MON`, icon: Zap }
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
                {visualizationMode === 'tokens' && (
                  <TokenMovementGraph 
                    walletAddress={walletAddress}
                    isDarkMode={isDarkMode}
                    isLoreMode={isLoreMode}
                  />
                )}
                {visualizationMode === 'score' && (
                  <WalletScoreCard 
                    walletAddress={walletAddress}
                    connectedWallet={connectedWallet}
                    isOwner={isWalletOwner()}
                    isDarkMode={isDarkMode}
                    isLoreMode={isLoreMode}
                    onWalletConnect={handleWalletConnect}
                  />
                )}
                {visualizationMode === 'live' && (
                  <LiveTransactionLogger 
                    isDarkMode={isDarkMode}
                    isLoreMode={isLoreMode}
                    walletAddress={walletAddress}
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
