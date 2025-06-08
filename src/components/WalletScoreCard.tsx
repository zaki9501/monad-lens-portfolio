
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, Activity, Users, Calendar, Zap, Target, Star, AlertTriangle, CheckCircle } from "lucide-react";
import { getAccountTransactions, getAccountActivities } from "@/lib/blockvision";

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

  useEffect(() => {
    if (!walletAddress) return;
    analyzeWallet();
  }, [walletAddress]);

  const analyzeWallet = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Starting wallet analysis for:', walletAddress);
      
      // Fetch transaction data with larger limits
      const [txData, activityData] = await Promise.all([
        getAccountTransactions(walletAddress, 100),
        getAccountActivities(walletAddress, 100)
      ]);

      console.log('Transaction data:', txData);
      console.log('Activity data:', activityData);

      const transactions = txData?.result?.data || [];
      const activities = activityData?.result?.data || [];

      console.log(`Found ${transactions.length} transactions and ${activities.length} activities`);

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(transactions, activities);
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

  const calculateMetrics = (transactions: any[], activities: any[]): ScoreMetrics => {
    // Combine all transactions for comprehensive analysis
    const allTxs = [...transactions, ...activities];
    console.log('Processing', allTxs.length, 'total transactions');
    
    // Basic counts
    const totalTransactions = allTxs.length;
    
    // Volume calculation - handle both regular transactions and activities
    const totalVolume = allTxs.reduce((sum, tx) => {
      let txValue = 0;
      
      // For regular transactions
      if (tx.value && tx.value !== "0") {
        txValue = Number(tx.value) / 1e18; // Convert wei to MON
      }
      
      // For activities with token movements
      if (tx.addTokens && Array.isArray(tx.addTokens)) {
        tx.addTokens.forEach((token: any) => {
          if (token.amount && token.symbol === 'MON') {
            txValue += Number(token.amount);
          }
        });
      }
      
      return sum + txValue;
    }, 0);

    // Gas spent calculation - fixed conversion
    const gasSpent = allTxs.reduce((sum, tx) => {
      let gasUsed = 0;
      
      if (tx.transactionFee) {
        // transactionFee is already in MON format for activities
        gasUsed = Number(tx.transactionFee);
      } else if (tx.gasUsed && tx.gasPrice) {
        // For raw transactions, calculate from gasUsed * gasPrice and convert wei to MON
        gasUsed = (Number(tx.gasUsed) * Number(tx.gasPrice)) / 1e18;
      }
      
      return sum + gasUsed;
    }, 0);

    // Contract interactions - improved detection
    const contractAddresses = new Set<string>();
    let contractsInteracted = 0;
    
    allTxs.forEach(tx => {
      // Check if it's a contract interaction
      const isContractTx = tx.isContract || 
                          tx.contractAddress ||
                          (tx.to && tx.to !== walletAddress && tx.to !== '' && tx.to !== '0x0000000000000000000000000000000000000000') ||
                          (tx.transactionAddress && tx.transactionAddress !== walletAddress);
      
      if (isContractTx) {
        contractsInteracted++;
        const contractAddr = tx.contractAddress || tx.transactionAddress || tx.to;
        if (contractAddr && contractAddr !== '' && contractAddr !== '0x0000000000000000000000000000000000000000') {
          contractAddresses.add(contractAddr.toLowerCase());
        }
      }
    });

    const uniqueContracts = contractAddresses.size;

    // Active days calculation - improved timestamp handling
    const dates = new Set<string>();
    allTxs.forEach(tx => {
      if (tx.timestamp) {
        // Handle both timestamp formats (seconds and milliseconds)
        const timestamp = typeof tx.timestamp === 'number' && tx.timestamp > 1e12 
          ? tx.timestamp 
          : tx.timestamp * 1000;
        const date = new Date(timestamp).toDateString();
        dates.add(date);
      }
    });
    const activeDays = dates.size;

    // Calculate time-based metrics
    const timestamps = allTxs
      .map(tx => tx.timestamp)
      .filter(ts => ts)
      .map(ts => typeof ts === 'number' && ts > 1e12 ? ts / 1000 : ts)
      .sort((a, b) => a - b);
    
    const firstTransactionAge = timestamps.length > 0 
      ? Math.max(1, (Date.now() / 1000 - timestamps[0]) / 86400) // Days since first transaction
      : 1;

    const transactionFrequency = totalTransactions / firstTransactionAge; // Transactions per day

    // Average gas price (for transactions that have gasPrice)
    const gasTransactions = allTxs.filter(tx => tx.gasPrice && Number(tx.gasPrice) > 0);
    const averageGasPrice = gasTransactions.length > 0 
      ? gasTransactions.reduce((sum, tx) => sum + Number(tx.gasPrice), 0) / gasTransactions.length / 1e9 // Convert to Gwei
      : 0;

    // Diversity score - different types of interactions
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
      Math.min(50, metrics.totalTransactions * 2) + 
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
      Math.min(70, metrics.uniqueContracts * 10) + 
      Math.min(30, metrics.diversityScore * 5)
    );

    // Longevity Score (0-100) - Based on account age
    const longevityScore = Math.min(100, Math.log10(Math.max(1, metrics.firstTransactionAge)) * 25);

    // Gas Efficiency Score (0-100) - Lower gas per transaction is better
    const avgGasPerTx = metrics.totalTransactions > 0 ? metrics.gasSpent / metrics.totalTransactions : 0;
    const gasEfficiencyScore = Math.max(0, Math.min(100, 100 - (avgGasPerTx * 1000)));

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
    return 'D';
  };

  const getSybilRisk = (score: number): { level: string; color: string; icon: React.ReactNode } => {
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
          <CardTitle className={`flex items-center space-x-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Target className="w-6 h-6 text-purple-400" />
            <span>{isLoreMode ? 'Mind Authenticity Score' : 'Wallet Reputation Score'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {isLoreMode ? 'Analyzing consciousness patterns...' : 'Analyzing wallet activity...'}
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
          ) : (
            <div className="space-y-6">
              {/* Overall Score Display */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className={`text-6xl font-bold ${
                    overallScore >= 70 ? 'text-green-400' :
                    overallScore >= 50 ? 'text-blue-400' :
                    overallScore >= 30 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {overallScore}
                  </div>
                  <div className={`text-2xl font-bold absolute -top-2 -right-8 ${
                    overallScore >= 70 ? 'text-green-400' :
                    overallScore >= 50 ? 'text-blue-400' :
                    overallScore >= 30 ? 'text-yellow-400' : 'text-red-400'
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
    </div>
  );
};

export default WalletScoreCard;
