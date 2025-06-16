
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, TrendingUp, Activity, Coins, Wallet, Brain, Info } from "lucide-react";

interface WalletScoreCardProps {
  walletAddress: string;
  connectedWallet: string;
  isOwner: boolean;
  isDarkMode: boolean;
  isLoreMode: boolean;
  onWalletConnect: () => void;
}

const fetchStakingData = async (address: string, apiKey: string) => {
  try {
    // Fetch staking positions from the portfolio API
    const url = `https://api.blockvision.org/v2/monad/account/portfolio?address=${address}`;
    const res = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey,
      },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    
    // Look for staking positions in the portfolio
    const stakingAmount = data?.result?.liquidStakingDerivatives?.reduce((total: number, lsd: any) => {
      return total + (Number(lsd.balance) || 0);
    }, 0) || 0;
    
    console.log('Staking data fetched:', { stakingAmount, data: data?.result?.liquidStakingDerivatives });
    return stakingAmount;
  } catch (error) {
    console.error('Failed to fetch staking data:', error);
    return 0;
  }
};

const fetchWalletActivities = async (address: string, apiKey: string) => {
  try {
    const url = `https://api.blockvision.org/v2/monad/account/activities?address=${address}&limit=100`;
    const res = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey,
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch wallet activities:', error);
    return null;
  }
};

const WalletScoreCard = ({ 
  walletAddress, 
  connectedWallet, 
  isOwner, 
  isDarkMode, 
  isLoreMode, 
  onWalletConnect 
}: WalletScoreCardProps) => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    uniqueContracts: 0,
    avgGasPrice: 0,
    totalVolume: 0,
    stakingAmount: 0,
    riskScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateStats = async () => {
      if (!walletAddress) return;
      
      setIsLoading(true);
      const apiKey = import.meta.env.VITE_BLOCKVISION_API_KEY;
      
      try {
        // Fetch both activities and staking data
        const [activitiesData, stakingAmount] = await Promise.all([
          fetchWalletActivities(walletAddress, apiKey),
          fetchStakingData(walletAddress, apiKey)
        ]);

        if (activitiesData?.result?.data) {
          const activities = activitiesData.result.data;
          
          // Calculate stats from activities
          const totalTransactions = activities.length;
          const uniqueContracts = new Set(
            activities
              .filter((tx: any) => tx.to && tx.to !== walletAddress.toLowerCase())
              .map((tx: any) => tx.to.toLowerCase())
          ).size;
          
          const totalGas = activities
            .filter((tx: any) => tx.transactionFee)
            .reduce((sum: number, tx: any) => sum + Number(tx.transactionFee), 0);
          const avgGasPrice = totalTransactions > 0 ? totalGas / totalTransactions : 0;
          
          const totalVolume = activities.reduce((sum: number, tx: any) => {
            const addTokens = tx.addTokens || [];
            const removeTokens = tx.removeTokens || [];
            const tokenVolume = [...addTokens, ...removeTokens]
              .reduce((tokenSum: number, token: any) => tokenSum + Number(token.amount || 0), 0);
            return sum + tokenVolume;
          }, 0);

          // Calculate risk score based on various factors
          const contractInteractions = activities.filter((tx: any) => tx.to && tx.to !== walletAddress.toLowerCase()).length;
          const avgTxValue = totalVolume / totalTransactions;
          const gasEfficiency = avgGasPrice > 0 ? 1 / avgGasPrice : 1;
          
          const riskScore = Math.min(100, Math.max(0, 
            (contractInteractions / totalTransactions * 30) + 
            (Math.min(avgTxValue / 100, 1) * 40) + 
            (gasEfficiency * 30)
          ));

          setStats({
            totalTransactions,
            uniqueContracts,
            avgGasPrice,
            totalVolume,
            stakingAmount,
            riskScore
          });

          console.log('Calculated stats:', {
            totalTransactions,
            uniqueContracts,
            avgGasPrice,
            totalVolume,
            stakingAmount,
            riskScore
          });
        }
      } catch (error) {
        console.error('Failed to calculate wallet stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateStats();
  }, [walletAddress]);

  const statItems = [
    {
      label: isLoreMode ? 'Mind Traces' : 'Total Transactions',
      value: stats.totalTransactions.toLocaleString(),
      icon: Activity,
      color: 'text-blue-400',
      tooltip: 'Total number of transactions made by this wallet across all time'
    },
    {
      label: isLoreMode ? 'Bridge Nodes' : 'Unique Contracts',
      value: stats.uniqueContracts.toLocaleString(),
      icon: Brain,
      color: 'text-purple-400',
      tooltip: 'Number of unique smart contracts this wallet has interacted with'
    },
    {
      label: isLoreMode ? 'Energy Cost' : 'Avg Gas Price',
      value: `${stats.avgGasPrice.toFixed(4)} MON`,
      icon: TrendingUp,
      color: 'text-orange-400',
      tooltip: 'Average transaction fee paid per transaction in MON'
    },
    {
      label: isLoreMode ? 'Flow Volume' : 'Total Volume',
      value: `${stats.totalVolume.toFixed(2)} MON`,
      icon: Coins,
      color: 'text-green-400',
      tooltip: 'Total value of all tokens that have flowed through this wallet'
    },
    {
      label: isLoreMode ? 'Staked Energy' : 'Staking Amount',
      value: `${stats.stakingAmount.toFixed(4)} MON`,
      icon: Shield,
      color: 'text-indigo-400',
      tooltip: 'Total amount of MON currently staked in liquid staking derivatives'
    },
    {
      label: isLoreMode ? 'Mind Score' : 'Risk Score',
      value: `${stats.riskScore.toFixed(1)}/100`,
      icon: Shield,
      color: stats.riskScore > 70 ? 'text-green-400' : stats.riskScore > 40 ? 'text-yellow-400' : 'text-red-400',
      tooltip: 'Wallet activity score based on contract interactions, transaction value, and gas efficiency'
    }
  ];

  if (!walletAddress) {
    return (
      <div className="text-center space-y-4">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
        }`}>
          <Wallet className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isLoreMode ? 'Connect Your Mind' : 'Connect Your Wallet'}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isLoreMode 
              ? 'Link your consciousness to view mind metrics'
              : 'Connect your wallet to view detailed analytics'
            }
          </p>
          <Button onClick={onWalletConnect} className="mt-4">
            {isLoreMode ? 'Link Mind' : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isLoreMode ? 'Mind Analytics' : 'Wallet Analytics'}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isOwner 
              ? (isLoreMode ? 'Your mind consciousness metrics' : 'Your wallet performance metrics')
              : (isLoreMode ? 'External mind analysis' : 'Wallet analysis')
            }
          </p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className={`h-4 rounded ${isDarkMode ? 'bg-slate-600' : 'bg-gray-300'}`} />
                    <div className={`h-6 rounded ${isDarkMode ? 'bg-slate-600' : 'bg-gray-300'}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {statItems.map((stat, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Card className={`${
                    isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50' : 'bg-white/80 border-gray-200 hover:bg-gray-50/80'
                  } transition-all duration-200 cursor-help hover:scale-105`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <Info className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                          {stat.label}
                        </p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stat.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{stat.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {isLoreMode 
            ? 'Mind metrics calculated from blockchain consciousness patterns'
            : 'Statistics calculated from on-chain transaction data'
          }
        </div>
      </div>
    </TooltipProvider>
  );
};

export default WalletScoreCard;
