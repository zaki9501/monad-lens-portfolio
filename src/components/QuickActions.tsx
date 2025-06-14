
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowUpDown, Plus, Zap, TrendingUp, Shield } from "lucide-react";

interface QuickActionsProps {
  walletAddress: string;
}

const QuickActions = ({ walletAddress }: QuickActionsProps) => {
  const actions = [
    {
      icon: Send,
      label: "Send",
      description: "Transfer tokens",
      color: "from-blue-500 to-cyan-500",
      action: () => console.log("Send action")
    },
    {
      icon: ArrowUpDown,
      label: "Swap",
      description: "Exchange tokens",
      color: "from-purple-500 to-pink-500",
      action: () => console.log("Swap action")
    },
    {
      icon: Plus,
      label: "Add Liquidity",
      description: "Provide LP tokens",
      color: "from-green-500 to-emerald-500",
      action: () => console.log("Add liquidity")
    },
    {
      icon: Zap,
      label: "Stake",
      description: "Earn rewards",
      color: "from-orange-500 to-red-500",
      action: () => console.log("Stake action")
    },
    {
      icon: TrendingUp,
      label: "Lend",
      description: "Earn interest",
      color: "from-indigo-500 to-blue-500",
      action: () => console.log("Lend action")
    },
    {
      icon: Shield,
      label: "Insure",
      description: "Protect assets",
      color: "from-teal-500 to-cyan-500",
      action: () => console.log("Insure action")
    }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/5 hover:bg-white/10 border border-slate-600 hover:border-slate-500 transition-all duration-200"
                onClick={action.action}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-medium">{action.label}</p>
                  <p className="text-gray-400 text-xs">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
