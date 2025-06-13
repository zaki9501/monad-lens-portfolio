
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Zap, Target, TrendingUp, Clock, Shield, Crown, Gem, Image, PiggyBank, Coins } from "lucide-react";
import { getAccountTransactions, getAccountActivities, getAccountNFTs, getAccountTokens } from "@/lib/blockvision";

const BADGE_ICONS = {
  // Time-based badges
  "Early Farmer": { icon: Clock, color: "text-green-400", bg: "bg-green-500/10" },
  "Veteran Trader": { icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  "Diamond Hands": { icon: Gem, color: "text-blue-400", bg: "bg-blue-500/10" },
  
  // Activity badges
  "Heavy Swapper": { icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10" },
  "Gas Optimizer": { icon: Award, color: "text-red-400", bg: "bg-red-500/10" },
  "Transaction King": { icon: Crown, color: "text-orange-400", bg: "bg-orange-500/10" },
  
  // DeFi badges
  "Liquidity Provider": { icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  "Yield Farmer": { icon: PiggyBank, color: "text-green-400", bg: "bg-green-500/10" },
  "Staking Master": { icon: Coins, color: "text-amber-400", bg: "bg-amber-500/10" },
  
  // NFT badges
  "NFT Collector": { icon: Image, color: "text-pink-400", bg: "bg-pink-500/10" },
  "NFT Whale": { icon: Crown, color: "text-purple-400", bg: "bg-purple-500/10" },
  "Art Enthusiast": { icon: Star, color: "text-rose-400", bg: "bg-rose-500/10" },
  
  // Rare badges
  "Protocol Pioneer": { icon: Shield, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  "Monad OG": { icon: Crown, color: "text-gold-400", bg: "bg-yellow-500/10" },
  "One-Time User": { icon: Target, color: "text-gray-400", bg: "bg-gray-500/10" }
};

interface DAppEngagementBadgesProps {
  walletAddress: string;
}

const DAppEngagementBadges = ({ walletAddress }: DAppEngagementBadgesProps) => {
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    
    const analyzeBadges = async () => {
      setLoading(true);
      try {
        console.log("Analyzing comprehensive badges for wallet:", walletAddress);
        
        const [txData, activityData, nftData, tokenData] = await Promise.all([
          getAccountTransactions(walletAddress, 1000),
          getAccountActivities(walletAddress, 1000),
          getAccountNFTs(walletAddress, 1),
          getAccountTokens(walletAddress)
        ]);

        const transactions = txData?.result?.data || [];
        const activities = activityData?.result?.data || [];
        const nfts = nftData?.result?.data || [];
        const tokens = tokenData?.result?.data || [];
        
        const allTxs = [...transactions, ...activities];
        const earnedBadges: string[] = [];
        
        // Calculate comprehensive metrics
        const totalTx = Math.max(txData?.result?.total || 0, allTxs.length);
        const contractInteractions = allTxs.filter(tx => 
          tx.contractAddress || tx.to !== walletAddress
        ).length;
        
        const gasSpent = allTxs.reduce((sum, tx) => 
          sum + (Number(tx.transactionFee) || 0), 0
        );
        const avgGasPerTx = totalTx > 0 ? gasSpent / totalTx : 0;
        
        const totalVolume = allTxs.reduce((sum, tx) => {
          if (tx.value && tx.value !== "0") {
            return sum + (Number(tx.value) / 1e18);
          }
          return sum;
        }, 0);

        const uniqueContracts = new Set(
          allTxs.map(tx => tx.contractAddress || tx.to).filter(Boolean)
        ).size;
        
        // Calculate account age
        const timestamps = allTxs.map(tx => tx.timestamp).filter(Boolean)
          .map(ts => typeof ts === 'number' && ts > 1e12 ? ts / 1000 : ts)
          .sort((a, b) => a - b);
        const accountAge = timestamps.length > 0 ? 
          (Date.now() / 1000 - timestamps[0]) / 86400 : 0;

        const activeDays = new Set(
          allTxs.map(tx => {
            if (tx.timestamp) {
              const timestamp = typeof tx.timestamp === 'number' && tx.timestamp > 1e12 ? 
                tx.timestamp : tx.timestamp * 1000;
              return new Date(timestamp).toDateString();
            }
            return null;
          }).filter(Boolean)
        ).size;

        // Check for staking/lending tokens
        const stakingTokens = tokens.filter(token => 
          token.symbol?.includes('sM') || 
          token.symbol?.includes('apr') || 
          token.symbol?.includes('gM') || 
          token.symbol?.includes('sh') ||
          token.symbol?.includes('cvn') ||
          token.symbol?.includes('ib') ||
          token.symbol?.includes('za')
        );

        console.log("Wallet metrics:", {
          totalTx,
          contractInteractions,
          uniqueContracts,
          gasSpent,
          totalVolume,
          accountAge,
          activeDays,
          nftCount: nfts.length,
          stakingTokensCount: stakingTokens.length
        });

        // Time-based badges
        if (accountAge > 60) {
          earnedBadges.push("Early Farmer");
        }
        
        if (accountAge > 120 && totalTx > 200) {
          earnedBadges.push("Veteran Trader");
        }

        if (accountAge > 180 && totalVolume > 50) {
          earnedBadges.push("Diamond Hands");
        }

        // Activity badges
        if (totalTx > 100) {
          earnedBadges.push("Heavy Swapper");
        }
        
        if (totalTx > 500) {
          earnedBadges.push("Transaction King");
        }
        
        if (avgGasPerTx < 0.001 && totalTx > 20) {
          earnedBadges.push("Gas Optimizer");
        }

        // DeFi badges
        if (uniqueContracts >= 10) {
          earnedBadges.push("Liquidity Provider");
        }

        if (stakingTokens.length >= 2) {
          earnedBadges.push("Yield Farmer");
        }

        if (stakingTokens.length >= 5) {
          earnedBadges.push("Staking Master");
        }

        // NFT badges
        if (nfts.length >= 1) {
          earnedBadges.push("NFT Collector");
        }

        if (nfts.length >= 10) {
          earnedBadges.push("Art Enthusiast");
        }

        if (nfts.length >= 50) {
          earnedBadges.push("NFT Whale");
        }

        // Rare badges
        if (accountAge > 90 && uniqueContracts >= 15 && totalTx > 300) {
          earnedBadges.push("Protocol Pioneer");
        }

        if (accountAge > 150 && totalTx > 1000 && totalVolume > 100) {
          earnedBadges.push("Monad OG");
        }
        
        if (totalTx === 1) {
          earnedBadges.push("One-Time User");
        }

        console.log("Earned badges:", earnedBadges);
        setBadges(earnedBadges);
      } catch (error) {
        console.error('Error analyzing comprehensive badges:', error);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    analyzeBadges();
  }, [walletAddress]);

  const getBadgeDescription = (badge: string) => {
    const descriptions = {
      "Early Farmer": "One of the first users on Monad Testnet",
      "Veteran Trader": "Long-term trader with consistent activity",
      "Diamond Hands": "Held positions through market volatility",
      "Heavy Swapper": "Frequently trades on protocols",
      "Transaction King": "Completed 500+ transactions",
      "Gas Optimizer": "Efficient gas usage patterns",
      "Liquidity Provider": "Provides liquidity to multiple pools",
      "Yield Farmer": "Active in multiple staking protocols",
      "Staking Master": "Master of liquid staking derivatives",
      "NFT Collector": "Owns NFTs on Monad",
      "Art Enthusiast": "Serious NFT collector",
      "NFT Whale": "Major NFT holder",
      "Protocol Pioneer": "Early adopter of multiple protocols",
      "Monad OG": "Original Monad ecosystem participant",
      "One-Time User": "Used this dApp only once"
    };
    return descriptions[badge] || "Achievement unlocked";
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-300">Analyzing comprehensive engagement patterns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-400" />
          Achievement Badges ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {badges.map((badge, index) => {
          const badgeConfig = BADGE_ICONS[badge] || BADGE_ICONS["Protocol Pioneer"];
          const IconComponent = badgeConfig.icon;
          
          return (
            <div 
              key={index} 
              className={`flex items-center space-x-3 p-4 rounded-lg ${badgeConfig.bg} border border-slate-600 hover:border-slate-500 transition-colors`}
            >
              <div className={`w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center`}>
                <IconComponent className={`w-6 h-6 ${badgeConfig.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{badge}</h4>
                <p className="text-sm text-gray-400">
                  {getBadgeDescription(badge)}
                </p>
              </div>
            </div>
          );
        })}
        
        {badges.length === 0 && (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No achievement badges earned yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Start interacting with dApps to earn badges!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DAppEngagementBadges;
