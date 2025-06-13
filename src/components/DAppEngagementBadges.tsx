import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Crown, Star, Flame, Shield, Coins, Activity, TrendingUp } from "lucide-react";

interface DAppEngagementBadgesProps {
  walletAddress: string;
  transactionData?: any;
  tokenData?: any;
  nftData?: any;
}

const DAppEngagementBadges = ({ walletAddress, transactionData, tokenData, nftData }: DAppEngagementBadgesProps) => {
  // Calculate badges based on real data
  const calculateBadges = () => {
    const earnedBadges = [];
    
    // Transaction-based badges
    const txCount = transactionData?.result?.total || transactionData?.result?.data?.length || 0;
    if (txCount >= 100) earnedBadges.push({ name: "Active Trader", icon: Activity, color: "bg-blue-500", description: "Made 100+ transactions" });
    if (txCount >= 500) earnedBadges.push({ name: "Power User", icon: Zap, color: "bg-yellow-500", description: "Made 500+ transactions" });
    if (txCount >= 1000) earnedBadges.push({ name: "Whale", icon: Crown, color: "bg-purple-500", description: "Made 1000+ transactions" });
    
    // Token-based badges
    const tokenCount = tokenData?.result?.data?.length || 0;
    if (tokenCount >= 5) earnedBadges.push({ name: "Diversified", icon: Target, color: "bg-green-500", description: "Holds 5+ different tokens" });
    if (tokenCount >= 10) earnedBadges.push({ name: "Portfolio Master", icon: Trophy, color: "bg-gold-500", description: "Holds 10+ different tokens" });
    
    // NFT-based badges
    const nftCount = nftData?.result?.data?.length || 0;
    if (nftCount >= 1) earnedBadges.push({ name: "Collector", icon: Star, color: "bg-pink-500", description: "Owns NFTs" });
    if (nftCount >= 5) earnedBadges.push({ name: "Art Enthusiast", icon: Flame, color: "bg-red-500", description: "Owns 5+ NFTs" });
    
    // Hard-to-earn badges
    if (txCount >= 50 && tokenCount >= 3) {
      earnedBadges.push({ name: "DeFi Explorer", icon: Shield, color: "bg-cyan-500", description: "Active in DeFi ecosystem" });
    }
    
    if (txCount >= 100 && nftCount >= 1) {
      earnedBadges.push({ name: "Complete Trader", icon: Coins, color: "bg-orange-500", description: "Active in both tokens and NFTs" });
    }

    return earnedBadges;
  };

  const badges = calculateBadges();

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Achievement Badges ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <p className="text-gray-400">Start trading to earn badges!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <div key={index} className="flex flex-col items-center space-y-2 p-4 bg-slate-700/30 rounded-lg">
                  <div className={`w-12 h-12 ${badge.color} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-sm text-center">{badge.name}</h3>
                  <p className="text-gray-400 text-xs text-center">{badge.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DAppEngagementBadges;
