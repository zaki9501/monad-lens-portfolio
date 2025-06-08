
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, Zap, ArrowUp, ArrowDown, Brain, Code, Radio, TrendingUp } from "lucide-react";

interface LiveTransactionLoggerProps {
  isDarkMode: boolean;
  isLoreMode: boolean;
  walletAddress: string;
}

const LiveTransactionLogger: React.FC<LiveTransactionLoggerProps> = ({ isDarkMode, isLoreMode, walletAddress }) => {
  const [pulseData, setPulseData] = useState<number[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [heartbeatActive, setHeartbeatActive] = useState(false);
  const [proMode, setProMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Activity heatmap data (24 hours)
  const [activityHeatmap, setActivityHeatmap] = useState<number[]>(
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 10))
  );

  // Generate mock real-time transactions
  useEffect(() => {
    if (!walletAddress) return;
    let interval: NodeJS.Timeout;
    let lastSeenTx = null;

    const fetchLatestTxs = async () => {
      const apiKey = import.meta.env.VITE_BLOCKVISION_API_KEY;
      const url = `https://api.blockvision.org/v2/monad/account/activities?address=${walletAddress}&limit=10`;
      
      try {
        const res = await fetch(url, {
          headers: {
            'accept': 'application/json',
            'x-api-key': apiKey,
          },
        });
        if (!res.ok) return;
        
        const data = await res.json();
        const apiTxs = data?.result?.data || [];
        
        if (apiTxs.length && apiTxs[0].hash !== lastSeenTx) {
          // Transform API data to display format
          const transformedTxs = apiTxs.map((tx: any) => ({
            id: tx.hash,
            hash: tx.hash,
            type: tx.type || 'Transaction',
            direction: tx.from?.toLowerCase() === walletAddress.toLowerCase() ? 'outgoing' : 'incoming',
            amount: tx.transactionFee || '0',
            token: 'MON',
            timestamp: new Date(tx.timestamp * 1000), // Convert Unix timestamp to Date
            blockNumber: tx.blockNumber
          }));
          
          setTransactions(transformedTxs);
          setPulseData(prev => [...prev.slice(-199), Math.random() * 100 + 20]);
          setHeartbeatActive(true);
          setTimeout(() => setHeartbeatActive(false), 500);
          lastSeenTx = apiTxs[0].hash;
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    interval = setInterval(fetchLatestTxs, 3000); // Poll every 3 seconds
    fetchLatestTxs();

    return () => clearInterval(interval);
  }, [walletAddress]);

  // Draw EKG-style pulse line
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = proMode 
        ? (isDarkMode ? '#1f2937' : '#e5e7eb')
        : (isDarkMode ? '#1e293b' : '#f1f5f9');
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
        ctx.strokeStyle = proMode
          ? (isDarkMode ? '#10b981' : '#059669')
          : (heartbeatActive ? '#ef4444' : '#22c55e');
        ctx.lineWidth = proMode ? 3 : 2;
        ctx.shadowBlur = proMode ? 0 : 10;
        ctx.shadowColor = ctx.strokeStyle;

        ctx.beginPath();
        pulseData.forEach((value, index) => {
          const x = (index / pulseData.length) * canvas.width;
          const y = canvas.height - (value / 120) * canvas.height;
          
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
  }, [pulseData, heartbeatActive, proMode, isDarkMode]);

  const currentTheme = proMode
    ? (isDarkMode ? 'bg-black border-green-500/20' : 'bg-white border-gray-300')
    : (isDarkMode ? 'bg-slate-900/80 border-red-500/20' : 'bg-slate-50 border-blue-300');

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <Brain className={`w-4 h-4 ${proMode ? 'text-gray-400' : 'text-purple-400'}`} />
          <Label htmlFor="lore-mode" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            {isLoreMode ? 'Lore Mode' : 'Standard'}
          </Label>
        </div>
        <Switch
          id="pro-mode"
          checked={proMode}
          onCheckedChange={setProMode}
        />
        <div className="flex items-center space-x-2">
          <Code className={`w-4 h-4 ${proMode ? 'text-green-400' : 'text-gray-400'}`} />
          <Label htmlFor="pro-mode" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            Pro Mode
          </Label>
        </div>
      </div>

      {/* Main Pulse Monitor */}
      <Card className={`${currentTheme} ${proMode ? 'border-2' : 'border'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center space-x-2 ${
              proMode 
                ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                : (isDarkMode ? 'text-red-400' : 'text-red-600')
            }`}>
              {proMode ? <TrendingUp className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              <span className={proMode ? 'font-mono' : ''}>
                {proMode 
                  ? 'TX_MONITOR_ACTIVE'
                  : isLoreMode 
                    ? 'Mind Pulse Monitor' 
                    : 'Transaction Pulse'
                }
              </span>
              {heartbeatActive && !proMode && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </CardTitle>
            <Badge variant={isActive ? "default" : "secondary"} className={
              proMode 
                ? 'font-mono bg-green-500/20 text-green-400 border-green-500/50'
                : ''
            }>
              <Radio className="w-3 h-3 mr-1" />
              {proMode ? 'LIVE' : 'ACTIVE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* EKG Canvas */}
          <div className="relative mb-6">
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className="w-full h-32 border rounded"
              style={{
                background: proMode 
                  ? (isDarkMode ? '#000000' : '#ffffff')
                  : (isDarkMode ? '#0f172a' : '#f8fafc')
              }}
            />
            {!proMode && (
              <div className="absolute top-2 right-2">
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isLoreMode ? 'Neural Activity' : 'TX Volume'}
                </div>
              </div>
            )}
          </div>

          {/* Live Transaction Feed */}
          <div className="space-y-3">
            <h4 className={`text-sm font-medium ${
              proMode 
                ? (isDarkMode ? 'text-green-400 font-mono' : 'text-green-600 font-mono')
                : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
            }`}>
              {proMode ? 'RECENT_TRANSACTIONS:' : isLoreMode ? 'Recent Mind Events' : 'Live Transaction Feed'}
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions.map((tx, index) => (
                <div
                  key={tx.id}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    proMode
                      ? (isDarkMode 
                          ? 'bg-gray-900 border-green-500/30 hover:border-green-500/50' 
                          : 'bg-gray-50 border-gray-300 hover:border-gray-400')
                      : (isDarkMode 
                          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' 
                          : 'bg-white border-gray-200 hover:border-gray-300')
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: Math.max(0.3, 1 - index * 0.1)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {tx.direction === 'incoming' ? (
                        <ArrowDown className={`w-4 h-4 ${
                          proMode ? 'text-green-400' : 'text-green-500'
                        }`} />
                      ) : (
                        <ArrowUp className={`w-4 h-4 ${
                          proMode ? 'text-red-400' : 'text-red-500'
                        }`} />
                      )}
                      <div>
                        <div className={`text-sm font-medium ${
                          proMode 
                            ? (isDarkMode ? 'text-green-300 font-mono' : 'text-green-700 font-mono')
                            : (isDarkMode ? 'text-white' : 'text-gray-900')
                        }`}>
                          {proMode ? tx.type.toUpperCase().replace(' ', '_') : tx.type}
                        </div>
                        <div className={`text-xs ${
                          proMode 
                            ? (isDarkMode ? 'text-gray-400 font-mono' : 'text-gray-600 font-mono')
                            : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                        }`}>
                          {proMode ? tx.hash.slice(0, 10) + '...' : (tx.timestamp instanceof Date ? tx.timestamp.toLocaleTimeString() : 'Unknown time')}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right ${proMode ? 'font-mono' : ''}`}>
                      <div className={`text-sm font-bold ${
                        proMode 
                          ? (isDarkMode ? 'text-green-300' : 'text-green-700')
                          : (isDarkMode ? 'text-white' : 'text-gray-900')
                      }`}>
                        {tx.amount} {tx.token}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card className={currentTheme}>
        <CardHeader>
          <CardTitle className={`text-sm ${
            proMode 
              ? (isDarkMode ? 'text-green-400 font-mono' : 'text-green-600 font-mono')
              : (isDarkMode ? 'text-white' : 'text-gray-900')
          }`}>
            {proMode ? 'ACTIVITY_HEATMAP_24H:' : isLoreMode ? 'Neural Activity by Hour' : '24-Hour Activity Heatmap'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
            {activityHeatmap.map((activity, hour) => (
              <div
                key={hour}
                className={`h-8 rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-110 ${
                  proMode
                    ? activity > 15 
                      ? 'bg-green-500 text-black'
                      : activity > 10
                        ? 'bg-green-400 text-black'
                        : activity > 5
                          ? 'bg-green-300 text-black'
                          : 'bg-green-100 text-gray-600'
                    : activity > 15 
                      ? 'bg-red-500 text-white'
                      : activity > 10
                        ? 'bg-orange-500 text-white'
                        : activity > 5
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-200 text-gray-600'
                }`}
                title={`${hour}:00 - ${activity} transactions`}
              >
                {proMode ? activity : hour}
              </div>
            ))}
          </div>
          <div className={`text-xs mt-2 text-center ${
            proMode 
              ? (isDarkMode ? 'text-gray-400 font-mono' : 'text-gray-600 font-mono')
              : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
          }`}>
            {proMode ? 'HOUR_00_TO_23' : 'Hours: 00:00 to 23:00'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveTransactionLogger;
