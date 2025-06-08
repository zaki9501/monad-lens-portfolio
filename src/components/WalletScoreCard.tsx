
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Activity, Users, Calendar, Zap, Target, Star, AlertTriangle, CheckCircle, Palette, Info } from "lucide-react";
import { getAccountTransactions, getAccountActivities } from "@/lib/blockvision";
import ReputationArtGenerator from "./ReputationArtGenerator";

interface WalletScoreProps {
  walletAddress: string;
  isDarkMode?: boolean;
  isLoreMode?: boolean;
}

interface ScoreMetrics {
  totalTransactions: number;
  totalVolume: number;
  gasSpent: number;
  contractsInteracted: number;
  uniqueContracts: number;
  activeDays: number;
  averageGasPrice: number;
  transactionFrequency: number;
  firstTransactionAge: number;
  diversityScore: number;
}

interface ScoreBreakdown {
  activity: number;
  volume: number;
  consistency: number;
  diversity: number;
  longevity: number;
  gasEfficiency: number;
}

const WalletScoreCard = ({ walletAddress, isDarkMode = true, isLoreMode = false }: WalletScoreProps) => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<ScoreMetrics | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [scoreGrade, setScoreGrade] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showArtGenerator, setShowArtGenerator] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    analyzeWallet();
  }, [walletAddress]);

  const fetchAllTransactions = async (address: string, maxLimit = 1000) => {
    console.log('Fetching all transactions for comprehensive analysis...');
    
    // Fetch larger batches to get more complete data
    const [txData, activityData] = await Promise.all([
      getAccountTransactions(address, maxLimit),
      getAccountActivities(address, maxLimit)
    ]);

    console.log('Raw transaction data:', txData);
    console.log('Raw activity data:', activityData);

    const transactions = txData?.result?.data || [];
    const activities = activityData?.result?.data || [];
    
    // Get total count from API response if available
    const totalFromTxApi = txData?.result?.total || transactions.length;
    const totalFromActivityApi = activityData?.result?.total || activities.length;
    
    console.log(`API reported totals - Transactions: ${totalFromTxApi}, Activities: ${totalFromActivityApi}`);
    console.log(`Fetched - Transactions: ${transactions.length}, Activities: ${activities.length}`);

    return { transactions, activities, totalFromTxApi, totalFromActivityApi };
  };

  const analyzeWallet = async () => {
    setLoading(true);
    setError('');
    setIsEmpty(false);
    try {
      console.log('Starting comprehensive wallet analysis for:', walletAddress);
      
      const { transactions, activities, totalFromTxApi } = await fetchAllTransactions(walletAddress, 1000);

      // Check if wallet is completely empty
      const hasAnyActivity = transactions.length > 0 || activities.length > 0 || totalFromTxApi > 0;
      
      if (!hasAnyActivity) {
        console.log('Wallet has no activity on Monad chain');
        setIsEmpty(true);
        setMetrics(null);
        setScoreBreakdown(null);
        setOverallScore(0);
        setScoreGrade('N/A');
        return;
      }

      // Calculate metrics with the fetched data
      const calculatedMetrics = calculateMetrics(transactions, activities, totalFromTxApi);
      console.log('Calculated metrics:', calculatedMetrics);
      
      const breakdown = calculateScoreBreakdown(calculatedMetrics);
      console.log('Score breakdown:', breakdown);
      
      const score = calculateOverallScore(breakdown);
      console.log('Overall score:', score);

      setMetrics(calculatedMetrics);
      setScoreBreakdown(breakdown);
      setOverallScore(score);
      setScoreGrade(getScoreGrade(score));
    } catch (error) {
      console.error('Error analyzing wallet:', error);
      setError('Failed to analyze wallet data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (transactions: any[], activities: any[], apiTotalTx: number): ScoreMetrics => {
    // Use API total if available, otherwise use fetched count
    const totalTransactions = Math.max(apiTotalTx, transactions.length + activities.length);
    console.log(`Total transactions: ${totalTransactions} (API: ${apiTotalTx}, Fetched: ${transactions.length + activities.length})`);
    
    // Combine all transactions for analysis
    const allTxs = [...transactions, ...activities];
    console.log('Processing', allTxs.length, 'transactions for detailed analysis');
    
    // Volume calculation - improved handling
    let totalVolume = 0;
    
    allTxs.forEach(tx => {
      // For regular transactions
      if (tx.value && tx.value !== "0") {
        const valueInEth = Number(tx.value) / 1e18;
        totalVolume += valueInEth;
        console.log(`Transaction value: ${valueInEth} MON`);
      }
      
      // For activities with token movements
      if (tx.addTokens && Array.isArray(tx.addTokens)) {
        tx.addTokens.forEach((token: any) => {
          if (token.amount && token.symbol === 'MON') {
            totalVolume += Number(token.amount);
            console.log(`Activity token amount: ${token.amount} MON`);
          }
        });
      }
    });

    console.log(`Total volume calculated: ${totalVolume} MON`);

    // Gas spent calculation - FIXED conversion
    let gasSpent = 0;
    
    allTxs.forEach(tx => {
      if (tx.transactionFee) {
        // Check if transactionFee is already in MON format (activities) or in wei
        const feeValue = Number(tx.transactionFee);
        
        // If the fee is a very large number (> 1e15), it's likely in wei and needs conversion
        if (feeValue > 1e15) {
          const feeInMon = feeValue / 1e18;
          gasSpent += feeInMon;
          console.log(`Converting large transaction fee from wei: ${feeValue} wei = ${feeInMon} MON`);
        } else {
          // Already in MON format
          gasSpent += feeValue;
          console.log(`Transaction fee already in MON: ${feeValue} MON`);
        }
      } else if (tx.gasUsed && tx.gasPrice) {
        // For raw transactions, calculate from gasUsed * gasPrice and convert wei to MON
        const feeInWei = Number(tx.gasUsed) * Number(tx.gasPrice);
        const feeInMon = feeInWei / 1e18;
        gasSpent += feeInMon;
        console.log(`Calculated gas fee: ${tx.gasUsed} * ${tx.gasPrice} = ${feeInWei} wei = ${feeInMon} MON`);
      }
    });

    console.log(`Total gas spent (corrected): ${gasSpent} MON`);

    // Contract interactions - improved detection
    const contractAddresses = new Set<string>();
    let contractsInteracted = 0;
    
    allTxs.forEach(tx => {
      // Enhanced contract detection
      const isContractTx = tx.isContract || 
                          tx.contractAddress ||
                          (tx.to && tx.to !== walletAddress && tx.to !== '' && tx.to !== '0x0000000000000000000000000000000000000000') ||
                          (tx.transactionAddress && tx.transactionAddress !== walletAddress) ||
                          tx.methodID || tx.methodName;
      
      if (isContractTx) {
        contractsInteracted++;
        const contractAddr = tx.contractAddress || tx.transactionAddress || tx.to;
        if (contractAddr && contractAddr !== '' && contractAddr !== '0x0000000000000000000000000000000000000000') {
          contractAddresses.add(contractAddr.toLowerCase());
        }
      }
    });

    const uniqueContracts = contractAddresses.size;
    console.log(`Contracts: ${contractsInteracted} interactions, ${uniqueContracts} unique`);

    // Active days calculation
    const dates = new Set<string>();
    allTxs.forEach(tx => {
      if (tx.timestamp) {
        // Handle both timestamp formats
        const timestamp = typeof tx.timestamp === 'number' && tx.timestamp > 1e12 
          ? tx.timestamp 
          : tx.timestamp * 1000;
        const date = new Date(timestamp).toDateString();
        dates.add(date);
      }
    });
    const activeDays = dates.size;

    // Time-based metrics
    const timestamps = allTxs
      .map(tx => tx.timestamp)
      .filter(ts => ts)
      .map(ts => typeof ts === 'number' && ts > 1e12 ? ts / 1000 : ts)
      .sort((a, b) => a - b);
    
    const firstTransactionAge = timestamps.length > 0 
      ? Math.max(1, (Date.now() / 1000 - timestamps[0]) / 86400)
      : 1;

    const transactionFrequency = totalTransactions / firstTransactionAge;

    // Average gas price
    const gasTransactions = allTxs.filter(tx => tx.gasPrice && Number(tx.gasPrice) > 0);
    const averageGasPrice = gasTransactions.length > 0 
      ? gasTransactions.reduce((sum, tx) => sum + Number(tx.gasPrice), 0) / gasTransactions.length / 1e9
      : 0;

    // Diversity score
    const interactionTypes = new Set<string>();
    allTxs.forEach(tx => {
      if (tx.methodName && tx.methodName !== '') interactionTypes.add(tx.methodName);
      if (tx.txName && tx.txName !== '') interactionTypes.add(tx.txName);
      if (tx.methodID && tx.methodID !== '') interactionTypes.add(tx.methodID);
    });
    const diversityScore = interactionTypes.size;

    const result = {
      totalTransactions,
      totalVolume,
      gasSpent,
      contractsInteracted,
      uniqueContracts,
      activeDays,
      averageGasPrice,
      transactionFrequency,
      firstTransactionAge,
      diversityScore
    };

    console.log('Final metrics:', result);
    return result;
  };

  const calculateScoreBreakdown = (metrics: ScoreMetrics): ScoreBreakdown => {
    // Activity Score (0-100) - Based on transaction count and frequency
    const activityScore = Math.min(100, 
      Math.min(50, metrics.totalTransactions * 0.1) + 
      Math.min(50, metrics.transactionFrequency * 20)
    );

    // Volume Score (0-100) - Based on total volume moved
    const volumeScore = Math.min(100, Math.log10(Math.max(1, metrics.totalVolume)) * 20);

    // Consistency Score (0-100) - Based on active days and frequency
    const consistencyScore = Math.min(100, 
      Math.min(60, metrics.activeDays * 2) + 
      Math.min(40, metrics.transactionFrequency * 30)
    );

    // Diversity Score (0-100) - Based on unique contracts and interaction types
    const diversityScore = Math.min(100, 
      Math.min(70, metrics.uniqueContracts * 2) + 
      Math.min(30, metrics.diversityScore * 3)
    );

    // Longevity Score (0-100) - Based on account age
    const longevityScore = Math.min(100, Math.log10(Math.max(1, metrics.firstTransactionAge)) * 25);

    // Gas Efficiency Score (0-100) - Lower gas per transaction is better
    const avgGasPerTx = metrics.totalTransactions > 0 ? metrics.gasSpent / metrics.totalTransactions : 0;
    const gasEfficiencyScore = Math.max(0, Math.min(100, 100 - (avgGasPerTx * 50)));

    return {
      activity: Math.max(0, activityScore),
      volume: Math.max(0, volumeScore),
      consistency: Math.max(0, consistencyScore),
      diversity: Math.max(0, diversityScore),
      longevity: Math.max(0, longevityScore),
      gasEfficiency: Math.max(0, gasEfficiencyScore)
    };
  };

  const calculateOverallScore = (breakdown: ScoreBreakdown): number => {
    const weights = {
      activity: 0.25,
      volume: 0.15,
      consistency: 0.20,
      diversity: 0.15,
      longevity: 0.15,
      gasEfficiency: 0.10
    };

    return Math.round(
      breakdown.activity * weights.activity +
      breakdown.volume * weights.volume +
      breakdown.consistency * weights.consistency +
      breakdown.diversity * weights.diversity +
      breakdown.longevity * weights.longevity +
      breakdown.gasEfficiency * weights.gasEfficiency
    );
  };

  const getScoreGrade = (score: number): string => {
    if (score >= 90) return 'S+';
    if (score >= 80) return 'S';
    if (score >= 70) return 'A+';
    if (score >= 60) return 'A';
    if (score >= 50) return 'B+';
    if (score >= 40) return 'B';
    if (score >= 30) return 'C+';
    if (score >= 20) return 'C';
    if (score >= 10) return 'D';
    return 'N/A';
  };

  const getSybilRisk = (score: number): { level: string; color: string; icon: React.ReactNode } => {
    if (score === 0) return { 
      level: 'Unknown', 
      color: 'text-gray-400', 
      icon: <Info className="w-4 h-4" />
    };
    if (score >= 70) return { 
      level: 'Very Low', 
      color: 'text-green-400', 
      icon: <CheckCircle className="w-4 h-4" />
    };
    if (score >= 50) return { 
      level: 'Low', 
      color: 'text-blue-400', 
      icon: <Shield className="w-4 h-4" />
    };
    if (score >= 30) return { 
      level: 'Medium', 
      color: 'text-yellow-400', 
      icon: <AlertTriangle className="w-4 h-4" />
    };
    return { 
      level: 'High', 
      color: 'text-red-400', 
      icon: <AlertTriangle className="w-4 h-4" />
    };
  };

  const sybilRisk = getSybilRisk(overallScore);

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className={`${
        isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
      } border-2`}>
        <CardHeader>
          <CardTitle className={`flex items-center justify-between ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className="flex items-center space-x-2">
              <Target className="w-6 h-6 text-purple-400" />
              <span>{isLoreMode ? 'Mind Authenticity Score' : 'Wallet Reputation Score'}</span>
            </div>
            {!loading && !error && !isEmpty && metrics && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArtGenerator(!showArtGenerator)}
                className={`${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700/50' 
                    : 'border-gray-300 bg-white/80 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Palette className="w-4 h-4 mr-2" />
                {showArtGenerator ? 'Hide Art' : 'Generate Art'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {isLoreMode ? 'Analyzing consciousness patterns...' : 'Analyzing comprehensive wallet data...'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
              <button 
                onClick={analyzeWallet}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Retry Analysis
              </button>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-8">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <h3 className="text-xl font-semibold">
                  {isLoreMode ? 'Mind Not Found' : 'No Activity Detected'}
                </h3>
                <p className="max-w-md mx-auto">
                  {isLoreMode 
                    ? 'This consciousness has not yet materialized on the Monad blockchain. The mind remains dormant, waiting for its first digital awakening.'
                    : 'This wallet has no transaction history on the Monad testnet. Start interacting with the blockchain to build your reputation score!'
                  }
                </p>
                <div className={`text-6xl font-bold text-gray-400 mt-4`}>
                  --
                </div>
                <p className="text-sm">
                  {isLoreMode ? 'Dormant State' : 'No Score Available'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score Display */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className={`text-6xl font-bold ${
                    overallScore >= 70 ? 'text-green-400' :
                    overallScore >= 50 ? 'text-blue-400' :
                    overallScore >= 30 ? 'text-yellow-400' : 
                    overallScore >= 10 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {overallScore}
                  </div>
                  <div className={`text-2xl font-bold absolute -top-2 -right-8 ${
                    overallScore >= 70 ? 'text-green-400' :
                    overallScore >= 50 ? 'text-blue-400' :
                    overallScore >= 30 ? 'text-yellow-400' : 
                    overallScore >= 10 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {scoreGrade}
                  </div>
                </div>
                <p className={`text-lg mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isLoreMode ? 'Authenticity Grade' : 'Reputation Grade'}
                </p>
                
                {/* Sybil Risk Indicator */}
                <div className="flex items-center justify-center space-x-2 mt-4">
                  {sybilRisk.icon}
                  <span className={`font-semibold ${sybilRisk.color}`}>
                    Sybil Risk: {sybilRisk.level}
                  </span>
                </div>
              </div>

              {/* Score Breakdown */}
              {scoreBreakdown && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(scoreBreakdown).map(([key, value]) => (
                    <div key={key} className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium capitalize ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`text-sm font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {Math.round(value)}
                        </span>
                      </div>
                      <Progress 
                        value={value} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Detailed Metrics */}
              {metrics && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className={`text-center p-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <Activity className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metrics.totalTransactions}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Transactions
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-400" />
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metrics.totalVolume.toFixed(3)}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Volume (MON)
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <Users className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metrics.uniqueContracts}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Unique Contracts
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metrics.activeDays}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Active Days
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metrics.gasSpent.toFixed(4)}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Gas Spent (MON)
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <Activity className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metrics.transactionFrequency.toFixed(2)}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Frequency/Day
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <Star className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metrics.diversityScore}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Diversity Score
                    </div>
                  </div>

                  <div className={`text-center p-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  }`}>
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(metrics.firstTransactionAge)}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Account Age (Days)
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Art Generator - Only show for wallets with activity */}
      {showArtGenerator && !loading && !error && !isEmpty && metrics && scoreBreakdown && (
        <ReputationArtGenerator
          walletAddress={walletAddress}
          overallScore={overallScore}
          metrics={metrics}
          scoreBreakdown={scoreBreakdown}
          isDarkMode={isDarkMode}
          isLoreMode={isLoreMode}
        />
      )}
    </div>
  );
};

export default WalletScoreCard;
