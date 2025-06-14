
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, Target, ArrowLeft, Search, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import DAppInteractionStats from "@/components/DAppInteractionStats";
import DAppInteractionTimeline from "@/components/DAppInteractionTimeline";

const AVAILABLE_DAPPS = [
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'Decentralized Exchange',
    category: 'DEX',
    contracts: ['0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', '0xE592427A0AEce92De3Edee1F18E0157C05861564']
  },
  {
    id: 'aave',
    name: 'Aave',
    description: 'Lending Protocol',
    category: 'Lending',
    contracts: ['0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2']
  },
  {
    id: 'compound',
    name: 'Compound',
    description: 'Lending & Borrowing',
    category: 'Lending',
    contracts: ['0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', '0xc3e5607cd4ca0d5ac9427e1d8ec4f9af2075d02f']
  },
  {
    id: 'opensea',
    name: 'OpenSea',
    description: 'NFT Marketplace',
    category: 'NFT',
    contracts: ['0x00000000006c3852cbEf3e08E8dF289169EdE581', '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e']
  },
  {
    id: 'sushiswap',
    name: 'SushiSwap',
    description: 'DEX & DeFi Platform',
    category: 'DEX',
    contracts: ['0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506']
  }
];

const DAppAnalyzer = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedDApp, setSelectedDApp] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalyze = async () => {
    if (!walletAddress || !selectedDApp) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis - in real app, this would call an API
    setTimeout(() => {
      const mockData = {
        dapp: AVAILABLE_DAPPS.find(d => d.id === selectedDApp),
        wallet: walletAddress,
        totalInteractions: Math.floor(Math.random() * 100) + 10,
        totalVolume: (Math.random() * 10000).toFixed(2),
        firstInteraction: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastInteraction: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        functionCalls: [
          { name: 'swap', count: Math.floor(Math.random() * 50) + 5 },
          { name: 'addLiquidity', count: Math.floor(Math.random() * 20) + 2 },
          { name: 'removeLiquidity', count: Math.floor(Math.random() * 15) + 1 },
          { name: 'approve', count: Math.floor(Math.random() * 30) + 3 }
        ],
        timeline: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          interactions: Math.floor(Math.random() * 10),
          type: i < 5 ? 'recent_use' : i < 10 ? 'regular_use' : i > 25 ? 'first_use' : 'heavy_use'
        })).reverse(),
        tokensUsed: ['ETH', 'USDC', 'WBTC', 'USDT', 'DAI']
      };
      
      setAnalysisData(mockData);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">DApp Analyzer</h1>
                <Badge variant="outline" className="border-green-500 text-green-300">
                  Beta
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Analysis Form */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-400" />
                Analyze DApp Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="wallet" className="text-white">Wallet Address</Label>
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dapp" className="text-white">Select DApp</Label>
                  <Select value={selectedDApp} onValueChange={setSelectedDApp}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a DApp to analyze" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {AVAILABLE_DAPPS.map((dapp) => (
                        <SelectItem key={dapp.id} value={dapp.id} className="text-white hover:bg-slate-600">
                          <div className="flex items-center space-x-2">
                            <span>{dapp.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {dapp.category}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={!walletAddress || !selectedDApp || isAnalyzing}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Activity'}
              </Button>
            </CardContent>
          </Card>

          {/* Available DApps */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Available DApps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_DAPPS.map((dapp) => (
                  <div
                    key={dapp.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedDApp === dapp.id
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedDApp(dapp.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{dapp.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {dapp.category}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{dapp.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisData && (
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">{analysisData.totalInteractions}</div>
                      <div className="text-gray-400 text-sm">Total Interactions</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">${analysisData.totalVolume}</div>
                      <div className="text-gray-400 text-sm">Total Volume</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-400">
                        {Math.floor((Date.now() - analysisData.firstInteraction) / (1000 * 60 * 60 * 24))}d
                      </div>
                      <div className="text-gray-400 text-sm">Days Active</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-400">
                        {Math.floor((Date.now() - analysisData.lastInteraction) / (1000 * 60 * 60 * 24))}d
                      </div>
                      <div className="text-gray-400 text-sm">Days Since Last</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <div className="grid lg:grid-cols-2 gap-6">
                <DAppInteractionStats data={analysisData} />
                <DAppInteractionTimeline data={analysisData} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DAppAnalyzer;
