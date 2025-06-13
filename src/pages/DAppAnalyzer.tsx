
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Target, Zap, Clock, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import WalletAvatar from "@/components/WalletAvatar";
import DAppInteractionTimeline from "@/components/DAppInteractionTimeline";
import DAppInteractionStats from "@/components/DAppInteractionStats";
import DAppEngagementBadges from "@/components/DAppEngagementBadges";

const MONAD_DAPPS = [
  { id: 'uniswap', name: 'Uniswap V3', emoji: '🦄', contractAddress: '0x1234...', category: 'DEX' },
  { id: 'aave', name: 'Aave Protocol', emoji: '👻', contractAddress: '0x5678...', category: 'Lending' },
  { id: 'compound', name: 'Compound', emoji: '🏛️', contractAddress: '0x9abc...', category: 'Lending' },
  { id: 'sushiswap', name: 'SushiSwap', emoji: '🍣', contractAddress: '0xdef0...', category: 'DEX' },
  { id: 'yearn', name: 'Yearn Finance', emoji: '💰', contractAddress: '0x1357...', category: 'Yield' },
  { id: 'curve', name: 'Curve Finance', emoji: '🌊', contractAddress: '0x2468...', category: 'DEX' },
  { id: 'opensea', name: 'OpenSea', emoji: '🌊', contractAddress: '0x3691...', category: 'NFT' },
  { id: 'ens', name: 'ENS Registry', emoji: '📛', contractAddress: '0x4820...', category: 'Identity' }
];

const DAppAnalyzer = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedDApp, setSelectedDApp] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [interactionData, setInteractionData] = useState(null);

  const handleAnalyze = async () => {
    if (!walletAddress || !selectedDApp) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate blockchain scanning for dApp interactions
    for (let i = 0; i <= 100; i += 3) {
      await new Promise(resolve => setTimeout(resolve, 40));
      setAnalysisProgress(i);
    }
    
    const selectedDAppData = MONAD_DAPPS.find(dapp => dapp.id === selectedDApp);
    
    // Mock interaction data
    const mockData = {
      dApp: selectedDAppData,
      wallet: walletAddress,
      totalInteractions: 47,
      totalGasSpent: "2.4 MON",
      firstInteraction: "2024-01-15",
      lastInteraction: "2024-06-07",
      functionCalls: [
        { name: "swap", count: 23, gasUsed: "1.2 MON" },
        { name: "addLiquidity", count: 12, gasUsed: "0.8 MON" },
        { name: "removeLiquidity", count: 8, gasUsed: "0.3 MON" },
        { name: "approve", count: 4, gasUsed: "0.1 MON" }
      ],
      tokensUsed: ["MON", "USDC", "WETH", "DAI"],
      timeline: [
        { date: "2024-01-15", interactions: 5, type: "first_use" },
        { date: "2024-02-01", interactions: 12, type: "heavy_use" },
        { date: "2024-03-15", interactions: 8, type: "regular_use" },
        { date: "2024-04-20", interactions: 15, type: "heavy_use" },
        { date: "2024-06-07", interactions: 7, type: "recent_use" }
      ],
      badges: ["Early Farmer", "Heavy Swapper", "Liquidity Provider"]
    };
    
    setInteractionData(mockData);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">dApp Analyzer</h1>
              </Link>
              <Badge variant="outline" className="border-purple-500 text-purple-300">
                Monad Testnet
              </Badge>
            </div>
            <Link to="/">
              <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10">
                ← Back to Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Target className="w-12 h-12 mr-4 text-purple-400 animate-pulse" />
            <h1 className="text-5xl font-bold text-white">dApp Interaction Analyzer</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Analyze complete interaction history between any wallet and Monad dApps
          </p>
        </div>

        {/* Analysis Setup */}
        <Card className="max-w-4xl mx-auto mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Configure Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Wallet Address</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="0x... (Monad Testnet address)"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="flex-1 font-mono bg-slate-700 border-slate-600 text-white"
                />
                {walletAddress && (
                  <div className="flex items-center space-x-2">
                    <WalletAvatar address={walletAddress} />
                  </div>
                )}
              </div>
            </div>

            {/* dApp Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Select dApp</label>
              <Select value={selectedDApp} onValueChange={setSelectedDApp}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Choose a Monad dApp to analyze" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {MONAD_DAPPS.map((dapp) => (
                    <SelectItem key={dapp.id} value={dapp.id} className="text-white hover:bg-slate-600">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{dapp.emoji}</span>
                        <div>
                          <div className="font-medium">{dapp.name}</div>
                          <div className="text-xs text-gray-400">{dapp.category}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={!walletAddress || !selectedDApp || isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              <Search className="w-5 h-5 mr-2" />
              {isAnalyzing ? `Analyzing... ${analysisProgress}%` : 'Generate dApp Analysis'}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card className="max-w-2xl mx-auto mb-8 bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-spin">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Scanning Blockchain</h3>
                <p className="text-gray-400">Filtering transactions for {MONAD_DAPPS.find(d => d.id === selectedDApp)?.name}...</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{analysisProgress}% complete</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {interactionData && !isAnalyzing && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Interactions</p>
                      <p className="text-2xl font-bold text-white">{interactionData.totalInteractions}</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Gas Spent</p>
                      <p className="text-2xl font-bold text-white">{interactionData.totalGasSpent}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">First Interaction</p>
                      <p className="text-2xl font-bold text-white">{interactionData.firstInteraction}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Badges Earned</p>
                      <p className="text-2xl font-bold text-white">{interactionData.badges.length}</p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis Components */}
            <div className="grid gap-8 lg:grid-cols-2">
              <DAppInteractionStats data={interactionData} />
              <DAppEngagementBadges badges={interactionData.badges} />
            </div>

            <DAppInteractionTimeline data={interactionData} />
          </div>
        )}

        {/* Available dApps Preview */}
        {!interactionData && !isAnalyzing && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Available Monad dApps</h3>
            <div className="grid gap-4 md:grid-cols-4">
              {MONAD_DAPPS.map((dapp) => (
                <Card key={dapp.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{dapp.emoji}</div>
                    <h4 className="font-semibold text-white">{dapp.name}</h4>
                    <Badge variant="outline" className="mt-2 border-purple-400 text-purple-300">
                      {dapp.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DAppAnalyzer;
