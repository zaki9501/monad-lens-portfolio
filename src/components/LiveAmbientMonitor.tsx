
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, Zap, ArrowUpDown, Play, Pause, TrendingUp } from "lucide-react";

interface LiveAmbientMonitorProps {
  isDarkMode?: boolean;
}

interface AmbientTransaction {
  id: string;
  type: 'swap' | 'mint' | 'burn';
  baseFlow: string;
  quoteFlow: string;
  txHash: string;
  timestamp: Date;
  poolIdx: string;
}

const LiveAmbientMonitor: React.FC<LiveAmbientMonitorProps> = ({ isDarkMode = true }) => {
  const [isActive, setIsActive] = useState(false);
  const [transactions, setTransactions] = useState<AmbientTransaction[]>([]);
  const [pulseData, setPulseData] = useState<number[]>([]);
  const [activityCount, setActivityCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const GRAPHQL_ENDPOINT = 'https://indexer.dev.hyperindex.xyz/298979c/v1/graphql';

  // Fetch latest Ambient transactions
  const fetchLatestAmbientActivity = async () => {
    console.log('🔴 Starting to fetch latest Ambient activity...');
    setFetchError(null);
    
    // Simplified queries to get basic data first
    const swapsQuery = `
      query GetLatestSwaps {
        Ambiant_CrocSwap(limit: 20, order_by: {id: desc}) {
          id
          baseFlow
          quoteFlow
          txHash
          poolIdx
        }
      }
    `;

    const microSwapsQuery = `
      query GetLatestMicroSwaps {
        Ambiant_CrocMicroSwap(limit: 20, order_by: {id: desc}) {
          id
          baseFlow
          quoteFlow
          txHash
          poolIdx
        }
      }
    `;

    const mintsQuery = `
      query GetLatestMints {
        Ambiant_CrocMicroMintAmbient(limit: 10, order_by: {id: desc}) {
          id
          baseFlow
          quoteFlow
          txHash
          poolIdx
        }
      }
    `;

    try {
      console.log('🔍 Executing GraphQL queries...');
      
      const [swapsResponse, microSwapsResponse, mintsResponse] = await Promise.all([
        fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: swapsQuery })
        }),
        fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: microSwapsQuery })
        }),
        fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: mintsQuery })
        })
      ]);

      console.log('📡 Response statuses:', {
        swaps: swapsResponse.status,
        microSwaps: microSwapsResponse.status,
        mints: mintsResponse.status
      });

      if (!swapsResponse.ok || !microSwapsResponse.ok || !mintsResponse.ok) {
        throw new Error(`HTTP error! Swaps: ${swapsResponse.status}, MicroSwaps: ${microSwapsResponse.status}, Mints: ${mintsResponse.status}`);
      }

      const [swapsData, microSwapsData, mintsData] = await Promise.all([
        swapsResponse.json(),
        microSwapsResponse.json(),
        mintsResponse.json()
      ]);

      console.log('📊 Raw GraphQL responses:', {
        swapsData,
        microSwapsData,
        mintsData
      });

      // Check for GraphQL errors
      if (swapsData.errors) {
        console.error('❌ Swaps query errors:', swapsData.errors);
      }
      if (microSwapsData.errors) {
        console.error('❌ MicroSwaps query errors:', microSwapsData.errors);
      }
      if (mintsData.errors) {
        console.error('❌ Mints query errors:', mintsData.errors);
      }

      const swaps = (swapsData?.data?.Ambiant_CrocSwap || []).map((tx: any, index: number) => ({
        id: tx.id || `swap-${Date.now()}-${index}`,
        type: 'swap' as const,
        baseFlow: tx.baseFlow || '0',
        quoteFlow: tx.quoteFlow || '0',
        txHash: tx.txHash || 'unknown',
        timestamp: new Date(),
        poolIdx: tx.poolIdx || 'unknown'
      }));

      const microSwaps = (microSwapsData?.data?.Ambiant_CrocMicroSwap || []).map((tx: any, index: number) => ({
        id: tx.id || `microswap-${Date.now()}-${index}`,
        type: 'swap' as const,
        baseFlow: tx.baseFlow || '0',
        quoteFlow: tx.quoteFlow || '0',
        txHash: tx.txHash || 'unknown',
        timestamp: new Date(),
        poolIdx: tx.poolIdx || 'unknown'
      }));

      const mints = (mintsData?.data?.Ambiant_CrocMicroMintAmbient || []).map((tx: any, index: number) => ({
        id: tx.id || `mint-${Date.now()}-${index}`,
        type: 'mint' as const,
        baseFlow: tx.baseFlow || '0',
        quoteFlow: tx.quoteFlow || '0',
        txHash: tx.txHash || 'unknown',
        timestamp: new Date(),
        poolIdx: tx.poolIdx || 'unknown'
      }));

      console.log('🔢 Processed data counts:', {
        swaps: swaps.length,
        microSwaps: microSwaps.length,
        mints: mints.length
      });

      const allTxs = [...swaps, ...microSwaps, ...mints]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);

      console.log('📈 Final transactions array:', allTxs);

      setTransactions(allTxs);
      setActivityCount(allTxs.length);
      setLastFetchTime(new Date());
      
      // Update pulse data
      const newPulseValue = allTxs.length > 0 ? Math.random() * 80 + 20 : 10;
      setPulseData(prev => [...prev.slice(-99), newPulseValue]);

      console.log('✅ Live Ambient activity updated:', allTxs.length, 'transactions');
      
      if (allTxs.length === 0) {
        console.log('⚠️ No transactions found in any category');
        setFetchError('No recent transactions found');
      }
      
    } catch (error) {
      console.error('💥 Error fetching live Ambient activity:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Start/stop monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      console.log('🟢 Starting live monitoring...');
      fetchLatestAmbientActivity(); // Initial fetch
      interval = setInterval(() => {
        console.log('🔄 Periodic fetch triggered...');
        fetchLatestAmbientActivity();
      }, 10000); // Every 10 seconds for more frequent updates
    } else {
      console.log('🔴 Stopping live monitoring...');
    }

    return () => {
      if (interval) {
        console.log('🧹 Cleaning up interval...');
        clearInterval(interval);
      }
    };
  }, [isActive]);

  // Draw pulse visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = isDarkMode ? '#1f2937' : '#e5e7eb';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw pulse line
      if (pulseData.length > 1) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#10b981';

        ctx.beginPath();
        pulseData.forEach((value, index) => {
          const x = (index / pulseData.length) * canvas.width;
          const y = canvas.height - (value / 100) * canvas.height;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pulseData, isDarkMode]);

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    if (Math.abs(num) < 0.001) return '< 0.001';
    return Math.abs(num).toFixed(3);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'swap':
        return <ArrowUpDown className="w-4 h-4 text-blue-400" />;
      case 'mint':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'burn':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Zap className="w-5 h-5 text-green-400" />
              <span>Live Ambient Monitor</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="live-monitor" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {isActive ? 'Live' : 'Paused'}
                </Label>
                <Switch
                  id="live-monitor"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
              <Badge variant={isActive ? "default" : "secondary"} className="bg-green-500/20 text-green-400 border-green-500/50">
                {isActive ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                {activityCount} Active
              </Badge>
            </div>
          </div>
          {lastFetchTime && (
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Last updated: {lastFetchTime.toLocaleTimeString()}
            </div>
          )}
          {fetchError && (
            <div className="text-xs text-red-400">
              Error: {fetchError}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Activity Pulse Visualization */}
          <div className="relative mb-6">
            <canvas
              ref={canvasRef}
              width={800}
              height={150}
              className="w-full h-24 border rounded"
              style={{
                background: isDarkMode ? '#0f172a' : '#f8fafc'
              }}
            />
            <div className="absolute top-2 right-2">
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Protocol Activity
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Transaction Feed */}
      <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Live Transaction Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isActive ? 'Monitoring for live activity...' : 'Start monitoring to see live transactions'}
                </p>
                {fetchError && (
                  <p className="text-red-400 text-sm mt-2">
                    {fetchError}
                  </p>
                )}
              </div>
            ) : (
              transactions.map((tx, index) => (
                <div
                  key={tx.id}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600 hover:border-slate-500' 
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: Math.max(0.4, 1 - index * 0.05)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pool {tx.poolIdx} • {tx.txHash.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                        {formatAmount(tx.baseFlow)}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatAmount(tx.quoteFlow)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveAmbientMonitor;
