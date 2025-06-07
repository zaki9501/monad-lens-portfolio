
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Zap, Target, TrendingUp, Clock } from "lucide-react";

const BADGE_ICONS = {
  "Early Farmer": { icon: Clock, color: "text-green-400", bg: "bg-green-500/10" },
  "Heavy Swapper": { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
  "Liquidity Provider": { icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
  "One-Time User": { icon: Target, color: "text-gray-400", bg: "bg-gray-500/10" },
  "Protocol Veteran": { icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  "Gas Optimizer": { icon: Award, color: "text-red-400", bg: "bg-red-500/10" }
};

const DAppEngagementBadges = ({ badges }) => {
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DAppEngagementBadges;
