
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Zap, Brain } from "lucide-react";

interface ScanningAnimationProps {
  progress: number;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

const ScanningAnimation = ({ progress, isDarkMode, isLoreMode }: ScanningAnimationProps) => {
  const currentBlock = Math.floor((progress / 100) * 2456789);

  return (
    <Card className={`max-w-2xl mx-auto mb-8 animate-pulse ${
      isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
    }`}>
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-6">
          {isLoreMode ? (
            <Brain className={`w-16 h-16 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} animate-spin`} />
          ) : (
            <Activity className={`w-16 h-16 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} animate-bounce`} />
          )}
        </div>
        
        <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {isLoreMode ? 'Traversing Mind Paths...' : 'Scanning Blockchain...'}
        </h3>
        
        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {isLoreMode 
            ? `Exploring consciousness layer ${currentBlock.toLocaleString()}`
            : `Analyzing block ${currentBlock.toLocaleString()} of 2,456,789`
          }
        </p>
        
        <Progress value={progress} className="mb-4" />
        
        <div className="flex justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <Zap className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {isLoreMode ? 'Mind Traces Found' : 'Transactions Found'}: {Math.floor(progress * 0.47)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScanningAnimation;
