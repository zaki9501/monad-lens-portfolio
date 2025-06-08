
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

  useEffect(() => {
    if (!walletAddress) return;
    analyzeWallet();
  }, [walletAddress]);

  const analyzeWallet = async () => {
    setLoading(true);
    try {
      // Fetch transaction data
      const [txData, activityData] = await Promise.all([
        getAccountTransactions(walletAddress, 100),
        getAccountActivities(walletAddress, 100)
      ]);

      const transactions = txData?.result?.data || [];
      const activities = activityData?.result?.data || [];

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(transactions, activities);
      const breakdown = calculateScoreBreakdown(calculatedMetrics);
      const score = calculateOverallScore(breakdown);

      setMetrics(calculatedMetrics);
      setScoreBreakdown(breakdown);
      setOverallScore(score);
      setScoreGrade(getScoreGrade(score));
    } catch (error) {
      console.error('Error analyzing wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (transactions: any[], activities: any[]): ScoreMetrics => {
    const allTxs = [...transactions, ...activities];
    
    // Basic counts
    const totalTransactions = allTxs.length;
    
    // Volume calculation
    const totalVolume = allTxs.reduce((sum, tx) => {
      return sum + (Number(tx.value || 0) / 1e18);
    }, 0);

    // Gas spent
    const gasSpent = allTxs.reduce((sum, tx) => {
      return sum + Number(tx.transactionFee || tx.gasUsed || 0);
    }, 0);

    // Contract interactions
    const contractAddresses = new Set();
    let contractsInteracted = 0;
    
    allTxs.forEach(tx => {
      if (tx.to && tx.to !== walletAddress && tx.input && tx.input !== '0x') {
        contractsInteracted++;
        contractAddresses.add(tx.to);
      }
    });

    const uniqueContracts = contractAddresses.size;

    // Active days
    const dates = new Set();
    allTxs.forEach(tx => {
      if (tx.timestamp) {
        const date = new Date(tx.timestamp * 1000).toDateString();
        dates.add(date);
      }
    });
    const activeDays = dates.size;

    // Average gas price
    const gasTransactions = allTxs.filter(tx => tx.gasPrice && Number(tx.gasPrice) > 0);
    const averageGasPrice = gasTransactions.length > 0 
      ? gasTransactions.reduce((sum, tx) => sum + Number(tx.gasPrice), 0) / gasTransactions.length
      : 0;

    // Transaction frequency (txs per day)
    const oldestTx = allTxs.reduce((oldest, tx) => {
      return tx.timestamp < oldest.timestamp ? tx : oldest;
    }, allTxs[0]);
    
    const daysSinceFirst = oldestTx?.timestamp 
      ? Math.max(1, (Date.now() / 1000 - oldestTx.timestamp) / 86400)
      : 1;
    
    const transactionFrequency = totalTransactions / daysSinceFirst;
    const firstTransactionAge = daysSinceFirst;

    // Diversity score (different types of interactions)
    const interactionTypes = new Set();
    allTxs.forEach(tx => {
      if (tx.methodName) interactionTypes.add(tx.methodName);
      if (tx.type) interactionTypes.add(tx.type);
    });
    const diversityScore = interactionTypes.size;

    return {
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
  };

  const calculateScoreBreakdown = (metrics: ScoreMetrics): ScoreBreakdown => {
    // Activity Score (0-100) - Based on transaction count and frequency
    const activityScore = Math.min(100, 
      (metrics.totalTransactions * 2) + 
      (metrics.transactionFrequency * 10)
    );

    // Volume Score (0-100) - Based on total volume moved
    const volumeScore = Math.min(100, metrics.totalVolume * 10);

    // Consistency Score (0-100) - Based on active days and frequency
    const consistencyScore = Math.min(100, 
      (metrics.activeDays * 3) + 
      (metrics.transactionFrequency * 20)
    );

    // Diversity Score (0-100) - Based on unique contracts and interaction types
    const diversityScore = Math.min(100, 
      (metrics.uniqueContracts * 5) + 
      (metrics.diversityScore * 3)
    );

    // Longevity Score (0-100) - Based on account age
    const longevityScore = Math.min(100, metrics.firstTransactionAge * 2);

    // Gas Efficiency Score (0-100) - Based on reasonable gas usage
    const gasEfficiencyScore = metrics.totalTransactions > 0 
      ? Math.min(100, 100 - (metrics.gasSpent / metrics.totalTransactions / 1000))
      : 0;

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
                      {metrics.totalVolume.toFixed(2)} MON
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Volume
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
