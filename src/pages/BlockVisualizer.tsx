
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Zap, Activity, TrendingUp, Users } from "lucide-react";
import LiveBlockFeed from "../components/pulse/LiveBlockFeed";
import TransactionStream from "../components/pulse/TransactionStream";
import ChartsSection from "../components/pulse/ChartsSection";
import ValidatorLeaderboard from "../components/pulse/ValidatorLeaderboard";
import AddressLookup from "../components/pulse/AddressLookup";

// Mock data fetching function (replace with actual Monad API)
const fetchLatestBlock = async () => {
  const response = await fetch('https://testnet-rpc.monad.xyz/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['latest', true],
      id: 1
    })
  });
  
  if (!response.ok) throw new Error('Failed to fetch block');
  const data = await response.json();
  return data.result;
};

const BlockVisualizer = () => {
  const [currentBlock, setCurrentBlock] = useState<any>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const block = await fetchLatestBlock();
        setCurrentBlock(block);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch block data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAddressSearch = () => {
    if (searchAddress.trim()) {
      setSelectedAddress(searchAddress.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-purple-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Monad Pulse
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live
              </div>
            </div>
            
            {/* Address Search */}
            <div className="flex gap-2 max-w-md w-full md:w-auto">
              <Input
                placeholder="Search address (0x...)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
              />
              <Button 
                onClick={handleAddressSearch}
                variant="secondary"
                size="icon"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="validators" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Validators
            </TabsTrigger>
            <TabsTrigger value="address" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Address
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Live Block Feed - Takes up 2 columns */}
              <div className="xl:col-span-2">
                <LiveBlockFeed currentBlock={currentBlock} isLoading={isLoading} />
              </div>
              
              {/* Transaction Stream - Takes up 1 column */}
              <div className="xl:col-span-1">
                <TransactionStream currentBlock={currentBlock} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <ChartsSection />
          </TabsContent>

          <TabsContent value="validators">
            <ValidatorLeaderboard />
          </TabsContent>

          <TabsContent value="address">
            <AddressLookup selectedAddress={selectedAddress} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BlockVisualizer;
