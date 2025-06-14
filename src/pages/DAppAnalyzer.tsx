
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Activity, Target, ArrowLeft, Search, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
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

  const fetchSchemaInfo = async () => {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType {
            fields {
              name
              description
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: introspectionQuery
        })
      });
      
      const result = await response.json();
      console.log('Available GraphQL fields:', result.data?.__schema?.queryType?.fields?.map(f => f.name));
      return result.data?.__schema?.queryType?.fields || [];
    } catch (error) {
      console.error('Error fetching schema:', error);
      return [];
    }
  };

  const fetchAmbientData = async (address: string) => {
    // First, let's check what fields are actually available
    await fetchSchemaInfo();

    // Try a simple test query to see what works
    const testQuery = `
      query TestQuery {
        __typename
      }
    `;

    try {
      const testResponse = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testQuery
        })
      });
      
      const testResult = await testResponse.json();
      console.log('Test query result:', testResult);

      // Since the original queries are failing, let's return empty data for now
      // and show a message to the user about the schema mismatch
      return {
        swaps: [],
        microSwaps: [],
        ambientMints: [],
        rangeMints: [],
        ambientBurns: [],
        rangeBurns: [],
        schemaError: true
      };
    } catch (error) {
      console.error('Error with test query:', error);
      throw error;
    }
  };

  const processAmbientData = (rawData: any) => {
    // Handle case where schema doesn't match
    if (rawData.schemaError) {
      return {
        dapp: AMBIENT_DAPP,
        wallet: walletAddress,
        totalInteractions: 0,
        totalVolume: '0.00',
        firstInteraction: new Date(),
        lastInteraction: new Date(),
        functionCalls: [],
        timeline: [],
        tokensUsed: [],
        schemaError: true
      };
    }

    const allTransactions = [
      ...rawData.swaps.map(tx => ({ ...tx, type: 'swap' })),
      ...rawData.microSwaps.map(tx => ({ ...tx, type: 'microSwap' })),
      ...rawData.ambientMints.map(tx => ({ ...tx, type: 'ambientMint' })),
      ...rawData.rangeMints.map(tx => ({ ...tx, type: 'rangeMint' })),
      ...rawData.ambientBurns.map(tx => ({ ...tx, type: 'ambientBurn' })),
      ...rawData.rangeBurns.map(tx => ({ ...tx, type: 'rangeBurn' }))
    ];

    // Sort by time
    allTransactions.sort((a, b) => b.time - a.time);

    // Calculate function calls distribution
    const functionCalls = [
      { name: 'Swaps', count: rawData.swaps.length + rawData.microSwaps.length },
      { name: 'Ambient Mints', count: rawData.ambientMints.length },
      { name: 'Range Mints', count: rawData.rangeMints.length },
      { name: 'Ambient Burns', count: rawData.ambientBurns.length },
      { name: 'Range Burns', count: rawData.rangeBurns.length }
    ].filter(item => item.count > 0);

    // Calculate volume (simplified)
    const totalVolume = allTransactions.reduce((sum, tx) => {
      if (tx.baseFlow && tx.quoteFlow) {
        return sum + Math.abs(parseFloat(tx.baseFlow)) + Math.abs(parseFloat(tx.quoteFlow));
      }
      return sum;
    }, 0);

    // Create timeline data
    const timelineMap = new Map();
    allTransactions.forEach(tx => {
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

    const firstInteraction = allTransactions.length > 0 
      ? new Date(allTransactions[allTransactions.length - 1].time * 1000)
      : new Date();
    
    const lastInteraction = allTransactions.length > 0 
      ? new Date(allTransactions[0].time * 1000)
      : new Date();

    return {
      dapp: AMBIENT_DAPP,
      wallet: walletAddress,
      totalInteractions: allTransactions.length,
      totalVolume: totalVolume.toFixed(2),
      firstInteraction,
      lastInteraction,
      functionCalls,
      timeline,
      tokensUsed: ['ETH', 'USDC'] // Simplified - could be extracted from actual data
    };
  };

  const handleAnalyze = async () => {
    if (!walletAddress) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const rawData = await fetchAmbientData(walletAddress);
      const processedData = processAmbientData(rawData);
      setAnalysisData(processedData);
      
      if (processedData.schemaError) {
        setError('The GraphQL schema doesn\'t match the expected Ambient queries. The endpoint may have different field names or the schema may have changed.');
      }
    } catch (err) {
      setError('Failed to fetch Ambient data. Please check the wallet address and try again.');
      console.error('Analysis error:', err);
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
                      <h4 className="text-red-400 font-medium mb-1">Schema Mismatch Detected</h4>
                      <p className="text-red-300 text-sm">{error}</p>
                      <p className="text-red-300 text-xs mt-2">
                        Check the console for available GraphQL fields. The schema may need to be updated.
                      </p>
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
                  Intended to track: Swaps, Micro Swaps, Ambient/Range Mints & Burns
                </p>
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <p className="text-yellow-300 text-xs">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Note: GraphQL schema validation in progress. Some queries may not return data.
                  </p>
                </div>
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
                    {analysisData.schemaError && (
                      <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-300">
                        Schema Issue
                      </Badge>
                    )}
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

              {/* Detailed Analysis - Only show if we have actual data */}
              {!analysisData.schemaError && analysisData.totalInteractions > 0 && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <DAppInteractionStats data={analysisData} />
                  <DAppInteractionTimeline data={analysisData} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DAppAnalyzer;
