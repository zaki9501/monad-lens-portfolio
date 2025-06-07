
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, Zap, Database, TrendingUp } from "lucide-react";

interface AnalysisResultsProps {
  isDarkMode: boolean;
  isLoreMode: boolean;
  analysisData: {
    totalBlocks: number;
    totalTransactions: number;
    elapsedTime: number;
    blocksPerSecond: number;
    transactionsPerSecond: number;
  };
}

const AnalysisResults = ({ isDarkMode, isLoreMode, analysisData }: AnalysisResultsProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const metrics = [
    {
      label: isLoreMode ? 'Mind Layers Explored' : 'Total Blocks Processed',
      value: analysisData.totalBlocks,
      icon: Database,
      color: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      bgColor: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
    },
    {
      label: isLoreMode ? 'Thought Patterns Found' : 'Total Transactions Processed',
      value: analysisData.totalTransactions,
      icon: Activity,
      color: isDarkMode ? 'text-green-400' : 'text-green-600',
      bgColor: isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
    },
    {
      label: isLoreMode ? 'Mind Scan Duration' : 'Elapsed Time (seconds)',
      value: analysisData.elapsedTime,
      icon: Clock,
      color: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      bgColor: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      suffix: 's'
    },
    {
      label: isLoreMode ? 'Layers per Second' : 'Blocks per Second',
      value: analysisData.blocksPerSecond,
      icon: TrendingUp,
      color: isDarkMode ? 'text-orange-400' : 'text-orange-600',
      bgColor: isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50'
    },
    {
      label: isLoreMode ? 'Thoughts per Second' : 'Transactions per Second',
      value: analysisData.transactionsPerSecond,
      icon: Zap,
      color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
      bgColor: isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'
    }
  ];

  return (
    <Card className={`mb-8 animate-fade-in ${
      isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
    }`}>
      <CardHeader>
        <CardTitle className={`text-center text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {isLoreMode ? 'Mind Scan Analysis' : 'Blockchain Analysis Results'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {metrics.map((metric, index) => (
            <div key={index} className={`${metric.bgColor} rounded-lg p-4 hover-scale`}>
              <div className="flex items-center justify-between mb-3">
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
                <div className="text-right">
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(metric.value)}{metric.suffix || ''}
                  </p>
                </div>
              </div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {metric.label}
              </p>
              
              {/* Visual progress bar for some metrics */}
              {(index === 0 || index === 1) && (
                <div className="mt-3">
                  <Progress 
                    value={index === 0 ? 100 : (metric.value / 100) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Performance Summary */}
        <div className={`mt-6 p-4 rounded-lg ${
          isDarkMode ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20' : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
        }`}>
          <div className="flex items-center justify-center space-x-6 text-center">
            <div>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isLoreMode ? 'Mind Processing Efficiency' : 'Scan Performance'}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {isLoreMode 
                  ? `Processed ${formatNumber(analysisData.totalBlocks)} consciousness layers in ${analysisData.elapsedTime}s`
                  : `Processed ${formatNumber(analysisData.totalBlocks)} blocks in ${analysisData.elapsedTime} seconds`
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
