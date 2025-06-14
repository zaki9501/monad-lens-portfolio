
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Zap } from "lucide-react";

const MarketOverview = () => {
  const marketData = [
    {
      symbol: "MON",
      name: "Monad",
      price: "$0.125",
      change: "+15.2%",
      changeValue: "+$0.016",
      isPositive: true,
      volume: "$2.4M"
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      price: "$1.00",
      change: "-0.02%",
      changeValue: "-$0.0002",
      isPositive: false,
      volume: "$45.2M"
    },
    {
      symbol: "gMON",
      name: "Governance MON",
      price: "$0.145",
      change: "+8.7%",
      changeValue: "+$0.012",
      isPositive: true,
      volume: "$890K"
    },
    {
      symbol: "sMON",
      name: "Staked MON",
      price: "$0.130",
      change: "+12.1%",
      changeValue: "+$0.014",
      isPositive: true,
      volume: "$1.2M"
    }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
            Market Overview
          </div>
          <Badge variant="outline" className="border-green-500 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketData.map((token, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-slate-600 hover:border-slate-500 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{token.symbol[0]}</span>
                </div>
                <div>
                  <h4 className="font-medium text-white">{token.symbol}</h4>
                  <p className="text-gray-400 text-sm">{token.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-white font-medium">{token.price}</p>
                <div className="flex items-center space-x-1">
                  {token.isPositive ? (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-sm ${token.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {token.change}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-gray-400 text-sm">Volume</p>
                <p className="text-white text-sm font-medium">{token.volume}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <h5 className="text-blue-400 font-medium">Market Insight</h5>
          </div>
          <p className="text-gray-300 text-sm">
            Monad ecosystem tokens are showing strong bullish momentum with increased trading volume across all major pairs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
