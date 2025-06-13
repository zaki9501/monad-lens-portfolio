
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Zap, Target, TrendingUp, Clock } from "lucide-react";
import { getAccountTransactions, getAccountActivities } from "@/lib/blockvision";

const BADGE_ICONS = {
  "Early Farmer": { icon: Clock, color: "text-green-400", bg: "bg-green-500/10" },
  "Heavy Swapper": { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
  "Liquidity Provider": { icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
  "One-Time User": { icon: Target, color: "text-gray-400", bg: "bg-gray-500/10" },
  "Protocol Veteran": { icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  "Gas Optimizer": { icon: Award, color: "text-red-400", bg: "bg-red-500/10" }
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
        const [txData, activityData] = await Promise.all([
          getAccountTransactions(walletAddress, 1000),
          getAccountActivities(walletAddress, 1000)
        ]);

        const transactions = txData?.result?.data || [];
        const activities = activityData?.result?.data || [];
        const allTxs = [...transactions, ...activities];
        
        const earnedBadges: string[] = [];
        
        // Calculate metrics for badge determination
        const totalTx = Math.max(txData?.result?.total || 0, allTxs.length);
        const contractInteractions = allTxs.filter(tx => 
          tx.contractAddress || tx.to !== walletAddress
        ).length;
        const gasSpent = allTxs.reduce((sum, tx) => 
          sum + (Number(tx.transactionFee) || 0), 0
        );
        const avgGasPerTx = totalTx > 0 ? gasSpent / totalTx : 0;
        
        // Determine account age in days
        const timestamps = allTxs.map(tx => tx.timestamp).filter(Boolean)
          .map(ts => typeof ts === 'number' && ts > 1e12 ? ts / 1000 : ts)
          .sort((a, b) => a - b);
        const accountAge = timestamps.length > 0 ? 
          (Date.now() / 1000 - timestamps[0]) / 86400 : 0;

        // Badge logic based on real metrics
        if (accountAge > 30) {
          earnedBadges.push("Early Farmer");
        }
        
        if (totalTx > 50) {
          earnedBadges.push("Heavy Swapper");
        }
        
        if (contractInteractions > 10) {
          earnedBadges.push("Liquidity Provider");
        }
        
        if (totalTx === 1) {
          earnedBadges.push("One-Time User");
        }
        
        if (accountAge > 60 && totalTx > 100) {
          earnedBadges.push("Protocol Veteran");
        }
        
        if (avgGasPerTx < 0.001 && totalTx > 10) {
          earnedBadges.push("Gas Optimizer");
        }

        setBadges(earnedBadges);
      } catch (error) {
        console.error('Error analyzing badges:', error);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    analyzeBadges();
  }, [walletAddress]);

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-300">Analyzing engagement patterns...</p>
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
          Engagement Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {badges.map((badge, index) => {
          const badgeConfig = BADGE_ICONS[badge] || BADGE_ICONS["Protocol Veteran"];
          const IconComponent = badgeConfig.icon;
          
          return (
            <div 
              key={index} 
              className={`flex items-center space-x-3 p-3 rounded-lg ${badgeConfig.bg} border border-slate-600`}
            >
              <div className={`w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center`}>
                <IconComponent className={`w-5 h-5 ${badgeConfig.color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-white">{badge}</h4>
                <p className="text-sm text-gray-400">
                  {badge === "Early Farmer" && "One of the first users of this dApp"}
                  {badge === "Heavy Swapper" && "Frequently trades on this protocol"}
                  {badge === "Liquidity Provider" && "Provides liquidity to pools"}
                  {badge === "One-Time User" && "Used this dApp only once"}
                  {badge === "Protocol Veteran" && "Long-term user with consistent activity"}
                  {badge === "Gas Optimizer" && "Efficient gas usage patterns"}
                </p>
              </div>
            </div>
          );
        })}
        
        {badges.length === 0 && (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No engagement badges earned yet</p>
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
