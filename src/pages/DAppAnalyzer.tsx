import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity, Target, ArrowLeft, Search, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DAppInteractionStats from "@/components/DAppInteractionStats";
import DAppInteractionTimeline from "@/components/DAppInteractionTimeline";

const AMBIENT_DAPP = {
  id: 'ambient',
  name: 'Ambient',
  description: 'Concentrated Liquidity DEX',
  category: 'DEX',
  contracts: []
};

const GRAPHQL_ENDPOINT = 'https://indexer.dev.hyperindex.xyz/298979c/v1/graphql';

const DAppAnalyzer = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const fetchAmbientData = async (address: string) => {
    console.log('🔍 Fetching data for address:', address);
    
    // First, let's get the schema to understand available fields
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            fields {
              name
              type {
                name
              }
            }
          }
        }
      }
    `;

    // Updated queries without problematic fields - using simpler approach
    const swapsQuery = `
      query GetSwaps {
        Ambiant_CrocSwap(limit: 100) {
          baseFlow
          quoteFlow
          txHash
          logIndex
          base
          quote
          poolIdx
          isBuy
          inBaseQty
          qty
          limitPrice
          minOut
          reserveFlags
          tip
        }
      }
    `;

    const microSwapsQuery = `
      query GetMicroSwaps {
        Ambiant_CrocMicroSwap(limit: 100) {
          baseFlow
          quoteFlow
          txHash
          logIndex
          base
          quote
          poolIdx
          bidTick
          askTick
          inBaseQty
          qty
          limitPrice
          minOut
          reserveFlags
        }
      }
    `;

    const ambientMintsQuery = `
      query GetAmbientMints {
        Ambiant_CrocMicroMintAmbient(limit: 100) {
          baseFlow
          quoteFlow
          txHash
          logIndex
          base
          quote
          poolIdx
          bidTick
          askTick
          liq
        }
      }
    `;

    const rangeMintsQuery = `
      query GetRangeMints {
        Ambiant_CrocMicroMintRange(limit: 100) {
          baseFlow
          quoteFlow
          txHash
          logIndex
          base
          quote
          poolIdx
          bidTick
          askTick
          liq
        }
      }
    `;

    const ambientBurnsQuery = `
      query GetAmbientBurns {
        Ambiant_CrocMicroBurnAmbient(limit: 100) {
          baseFlow
          quoteFlow
          txHash
          logIndex
          base
          quote
          poolIdx
          bidTick
          askTick
          liq
        }
      }
    `;

    const rangeBurnsQuery = `
      query GetRangeBurns {
        Ambiant_CrocMicroBurnRange(limit: 100) {
          baseFlow
          quoteFlow
          txHash
          logIndex
          base
          quote
          poolIdx
          bidTick
          askTick
          liq
        }
      }
    `;

    try {
      console.log('🔧 Running schema introspection...');
      const introspectionResponse = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: introspectionQuery })
      });
      const introspectionData = await introspectionResponse.json();
      console.log('📋 Schema introspection result:', introspectionData);

      // Execute all Ambient queries
      const [swapsResponse, microSwapsResponse, ambientMintsResponse, rangeMintsResponse, ambientBurnsResponse, rangeBurnsResponse] = await Promise.all([
        fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: swapsQuery })
        }),
        fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: microSwapsQuery })
        }),
        fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: ambientMintsQuery })
        }),
        fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: rangeMintsQuery })
        }),
        fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: ambientBurnsQuery })
        }),
        fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: rangeBurnsQuery })
        })
      ]);

      const [swapsData, microSwapsData, ambientMintsData, rangeMintsData, ambientBurnsData, rangeBurnsData] = await Promise.all([
        swapsResponse.json(),
        microSwapsResponse.json(),
        ambientMintsResponse.json(),
        rangeMintsResponse.json(),
        ambientBurnsResponse.json(),
        rangeBurnsResponse.json()
      ]);

      console.log('📊 Raw API responses:');
      console.log('Swaps:', swapsData);
      console.log('MicroSwaps:', microSwapsData);
      console.log('Ambient mints:', ambientMintsData);
      console.log('Range mints:', rangeMintsData);
      console.log('Ambient burns:', ambientBurnsData);
      console.log('Range burns:', rangeBurnsData);

      // Check for errors
      const responses = [swapsData, microSwapsData, ambientMintsData, rangeMintsData, ambientBurnsData, rangeBurnsData];
      const errors = responses.filter(response => response.errors);
      
      if (errors.length > 0) {
        console.error('❌ GraphQL errors detected:', errors);
        toast({
          title: "Query errors detected",
          description: "Some GraphQL queries failed. Check console for details.",
          variant: "destructive",
        });
      }

      // Extract data arrays and log their lengths
      const swaps = swapsData?.data?.Ambiant_CrocSwap || [];
      const microSwaps = microSwapsData?.data?.Ambiant_CrocMicroSwap || [];
      const ambientMints = ambientMintsData?.data?.Ambiant_CrocMicroMintAmbient || [];
      const rangeMints = rangeMintsData?.data?.Ambiant_CrocMicroMintRange || [];
      const ambientBurns = ambientBurnsData?.data?.Ambiant_CrocMicroBurnAmbient || [];
      const rangeBurns = rangeBurnsData?.data?.Ambiant_CrocMicroBurnRange || [];

      console.log('📈 Data lengths from API:');
      console.log(`Swaps: ${swaps.length}`);
      console.log(`MicroSwaps: ${microSwaps.length}`);
      console.log(`Ambient mints: ${ambientMints.length}`);
      console.log(`Range mints: ${rangeMints.length}`);
      console.log(`Ambient burns: ${ambientBurns.length}`);
      console.log(`Range burns: ${rangeBurns.length}`);

      // Log sample records to understand structure
      if (swaps.length > 0) {
        console.log('📝 Sample swap record:', swaps[0]);
        console.log('📝 Swap record keys:', Object.keys(swaps[0]));
      }
      if (microSwaps.length > 0) {
        console.log('📝 Sample microswap record:', microSwaps[0]);
      }

      // Since we can't filter by user in the query, we'll need to use Blockvision API 
      // to get user transaction hashes and match them with Ambient data
      console.log('🔍 Fetching user transaction hashes from Blockvision...');
      
      // Get user's transaction history from Blockvision
      const blockvisionResponse = await fetch(`https://api.blockvision.org/v2/monad/account/transactions?address=${address}&limit=1000`, {
        headers: {
          'accept': 'application/json',
          'x-api-key': '2uhrrAO44lB7NE8OUezY9Lm8dW8'
        }
      });
      
      if (!blockvisionResponse.ok) {
        throw new Error(`Blockvision API error: ${blockvisionResponse.status}`);
      }
      
      const blockvisionData = await blockvisionResponse.json();
      const userTransactions = blockvisionData?.result?.data || [];
      const userTxHashes = userTransactions.map(tx => tx.hash.toLowerCase());
      
      console.log('👥 User transaction hashes from Blockvision:', userTxHashes.slice(0, 10));
      console.log('🔢 Total user transactions:', userTxHashes.length);

      // Filter Ambient data by user transaction hashes
      const filterByUserTx = (data) => {
        if (!Array.isArray(data)) return [];
        const filtered = data.filter(item => 
          item.txHash && userTxHashes.includes(item.txHash.toLowerCase())
        );
        return filtered;
      };

      const userSwaps = filterByUserTx(swaps);
      const userMicroSwaps = filterByUserTx(microSwaps);
      const userAmbientMints = filterByUserTx(ambientMints);
      const userRangeMints = filterByUserTx(rangeMints);
      const userAmbientBurns = filterByUserTx(ambientBurns);
      const userRangeBurns = filterByUserTx(rangeBurns);

      console.log('🎯 User-specific Ambient data:');
      console.log(`User swaps: ${userSwaps.length}`);
      console.log(`User microSwaps: ${userMicroSwaps.length}`);
      console.log(`User ambient mints: ${userAmbientMints.length}`);
      console.log(`User range mints: ${userRangeMints.length}`);
      console.log(`User ambient burns: ${userAmbientBurns.length}`);
      console.log(`User range burns: ${userRangeBurns.length}`);

      // Log some sample user transactions for debugging
      if (userSwaps.length > 0) {
        console.log('✅ Found user swap:', userSwaps[0]);
      }
      if (userMicroSwaps.length > 0) {
        console.log('✅ Found user microswap:', userMicroSwaps[0]);
      }

      return {
        swaps: userSwaps,
        microSwaps: userMicroSwaps,
        ambientMints: userAmbientMints,
        rangeMints: userRangeMints,
        ambientBurns: userAmbientBurns,
        rangeBurns: userRangeBurns,
        raw: {
          swapsData,
          microSwapsData,
          ambientMintsData,
          rangeMintsData,
          ambientBurnsData,
          rangeBurnsData,
          introspectionData
        }
      };
    } catch (error) {
      console.error('💥 Error fetching Ambient data:', error);
      throw error;
    }
  };

  const processAmbientData = (rawData: any) => {
    // For demonstration, let's create sample data if no data was found
    const allTransactions = [
      ...(Array.isArray(rawData.swaps) ? rawData.swaps.map(tx => ({ ...tx, type: 'swap' })) : []),
      ...(Array.isArray(rawData.microSwaps) ? rawData.microSwaps.map(tx => ({ ...tx, type: 'microSwap' })) : []),
      ...(Array.isArray(rawData.ambientMints) ? rawData.ambientMints.map(tx => ({ ...tx, type: 'ambientMint' })) : []),
      ...(Array.isArray(rawData.rangeMints) ? rawData.rangeMints.map(tx => ({ ...tx, type: 'rangeMint' })) : []),
      ...(Array.isArray(rawData.ambientBurns) ? rawData.ambientBurns.map(tx => ({ ...tx, type: 'ambientBurn' })) : []),
      ...(Array.isArray(rawData.rangeBurns) ? rawData.rangeBurns.map(tx => ({ ...tx, type: 'rangeBurn' })) : [])
    ];

    console.log('All transactions:', allTransactions);

    // If we have no transactions, use sample data for demonstration
    if (allTransactions.length === 0) {
      // For now, we'll just return empty data
      // We could add sample data here for demo purposes
      toast({
        title: "No Ambient activity found",
        description: "We couldn't find any Ambient activity for this wallet address.",
        variant: "default",
      });
    }

    // Sort by time (descending - newest first)
    allTransactions.sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return b.time - a.time;
    });

    // Calculate function calls distribution
    const functionCalls = [
      { name: 'Swaps', count: (Array.isArray(rawData.swaps) ? rawData.swaps.length : 0) + 
                             (Array.isArray(rawData.microSwaps) ? rawData.microSwaps.length : 0) },
      { name: 'Ambient Mints', count: Array.isArray(rawData.ambientMints) ? rawData.ambientMints.length : 0 },
      { name: 'Range Mints', count: Array.isArray(rawData.rangeMints) ? rawData.rangeMints.length : 0 },
      { name: 'Ambient Burns', count: Array.isArray(rawData.ambientBurns) ? rawData.ambientBurns.length : 0 },
      { name: 'Range Burns', count: Array.isArray(rawData.rangeBurns) ? rawData.rangeBurns.length : 0 }
    ].filter(item => item.count > 0);

    // Calculate volume (simplified - sum of absolute baseFlow and quoteFlow)
    const totalVolume = allTransactions.reduce((sum, tx) => {
      if (tx.baseFlow && tx.quoteFlow) {
        return sum + Math.abs(parseFloat(tx.baseFlow)) + Math.abs(parseFloat(tx.quoteFlow));
      }
      return sum;
    }, 0);

    // Create timeline data
    const timelineMap = new Map();
    allTransactions.forEach(tx => {
      if (!tx.time) return;
      const date = new Date(tx.time * 1000).toDateString();
      timelineMap.set(date, (timelineMap.get(date) || 0) + 1);
    });

    const timeline = Array.from(timelineMap.entries())
      .map(([date, interactions]) => ({
        date: new Date(date),
        interactions,
        type: interactions > 5 ? 'heavy_use' : interactions > 2 ? 'regular_use' : 'recent_use'
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const firstInteraction = allTransactions.length > 0 && allTransactions[allTransactions.length - 1].time
      ? new Date(allTransactions[allTransactions.length - 1].time * 1000)
      : new Date();
    
    const lastInteraction = allTransactions.length > 0 && allTransactions[0].time
      ? new Date(allTransactions[0].time * 1000)
      : new Date();

    // Extract unique tokens (simplified - could be improved with actual token mapping)
    const tokensUsed = ['ETH', 'USDC']; // Placeholder - could extract from actual transaction data

    return {
      dapp: AMBIENT_DAPP,
      wallet: walletAddress,
      totalInteractions: allTransactions.length,
      totalVolume: totalVolume.toFixed(2),
      firstInteraction,
      lastInteraction,
      functionCalls,
      timeline,
      tokensUsed,
      raw: rawData.raw
    };
  };

  const handleAnalyze = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet address required",
        description: "Please enter a wallet address to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      // Validate the wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        throw new Error("Invalid wallet address format. Please enter a valid Ethereum address.");
      }

      const rawData = await fetchAmbientData(walletAddress);
      const processedData = processAmbientData(rawData);
      setAnalysisData(processedData);
      
      // Show success toast
      if (processedData.totalInteractions > 0) {
        toast({
          title: "Analysis Complete",
          description: `Found ${processedData.totalInteractions} interactions for ${walletAddress}`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch Ambient data. Please check the wallet address and try again.";
      setError(errorMessage);
      console.error('Analysis error:', err);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
                  Ambient
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
                Analyze Ambient Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-medium mb-1">Error</h4>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleAnalyze}
                disabled={!walletAddress || isAnalyzing}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isAnalyzing ? 'Analyzing Ambient Activity...' : 'Analyze Ambient Activity'}
              </Button>
            </CardContent>
          </Card>

          {/* Ambient Protocol Info */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">About Ambient Protocol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/10">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{AMBIENT_DAPP.name}</h3>
                  <Badge variant="outline" className="text-xs border-green-500 text-green-300">
                    {AMBIENT_DAPP.category}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm">{AMBIENT_DAPP.description}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Tracking: Swaps, Micro Swaps, Ambient/Range Mints & Burns
                </p>
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
                      <div className="text-2xl font-bold text-green-400">{analysisData.totalVolume}</div>
                      <div className="text-gray-400 text-sm">Total Volume</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-400">
                        {Math.floor((Date.now() - analysisData.firstInteraction.getTime()) / (1000 * 60 * 60 * 24))}d
                      </div>
                      <div className="text-gray-400 text-sm">Days Active</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-400">
                        {Math.floor((Date.now() - analysisData.lastInteraction.getTime()) / (1000 * 60 * 60 * 24))}d
                      </div>
                      <div className="text-gray-400 text-sm">Days Since Last</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              {analysisData.totalInteractions > 0 && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <DAppInteractionStats data={analysisData} />
                  <DAppInteractionTimeline data={analysisData} />
                </div>
              )}

              {/* No Data Message */}
              {analysisData.totalInteractions === 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-semibold mb-2">No Activity Found</h3>
                    <p className="text-gray-400">
                      This wallet address has no recorded activity on Ambient Protocol.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DAppAnalyzer;
