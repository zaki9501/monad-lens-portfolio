
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowUpRight, ArrowDownLeft, Repeat, Plus } from "lucide-react";

interface RecentActivityProps {
  walletAddress: string;
}

const RecentActivity = ({ walletAddress }: RecentActivityProps) => {
  const activities = [
    {
      type: "swap",
      icon: Repeat,
      title: "Swapped MON → USDC",
      amount: "1,250 MON",
      value: "$125.30",
      time: "2 minutes ago",
      status: "completed",
      color: "text-purple-400"
    },
    {
      type: "receive",
      icon: ArrowDownLeft,
      title: "Received MON",
      amount: "500 MON",
      value: "$50.00",
      time: "1 hour ago",
      status: "completed",
      color: "text-green-400"
    },
    {
      type: "stake",
      icon: Plus,
      title: "Staked MON",
      amount: "2,000 MON",
      value: "$200.00",
      time: "3 hours ago",
      status: "completed",
      color: "text-blue-400"
    },
    {
      type: "send",
      icon: ArrowUpRight,
      title: "Sent USDC",
      amount: "75 USDC",
      value: "$75.00",
      time: "1 day ago",
      status: "completed",
      color: "text-orange-400"
    }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Recent Activity
          </div>
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            {activities.length} transactions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 rounded-lg bg-white/5 border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{activity.title}</h4>
                    <div className="text-right">
                      <p className="text-white font-medium">{activity.amount}</p>
                      <p className="text-gray-400 text-sm">{activity.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        activity.status === 'completed' 
                          ? 'border-green-500 text-green-400' 
                          : 'border-yellow-500 text-yellow-400'
                      }`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
