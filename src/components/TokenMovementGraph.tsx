
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts";
import { TrendingUp, TrendingDown, ArrowRight, ArrowLeft, Repeat, Wallet, Building2 } from "lucide-react";
import { JsonRpcProvider, formatEther } from "ethers";

interface TokenMovementGraphProps {
  walletAddress: string;
  isDarkMode?: boolean;
  isLoreMode?: boolean;
}

interface TokenFlow {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  fromType: 'wallet' | 'exchange' | 'contract';
  toType: 'wallet' | 'exchange' | 'contract';
  animated: boolean;
}

const TokenMovementGraph = ({ walletAddress, isDarkMode = true, isLoreMode = false }: TokenMovementGraphProps) => {
  const [data, setData] = useState<any[]>([]);
  const [tokenFlows, setTokenFlows] = useState<TokenFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [activeFlow, setActiveFlow] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) return;

    const fetchTokenMovements = async () => {
      setLoading(true);
      try {
        const provider = new JsonRpcProvider("https://testnet1.monad.xyz");
        const latestBlock = await provider.getBlockNumber();
        const movements = [];
        const flows: TokenFlow[] = [];
        
        // Simulate token movement data for the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          // Generate multiple transactions per day
          const dailyTxs = Math.floor(Math.random() * 5) + 1;
          let dailyBalance = Math.random() * 1000 + 500;
          
          for (let j = 0; j < dailyTxs; j++) {
            const txType = Math.random() > 0.5 ? 'buy' : 'sell';
            const amount = Math.random() * 100 + 10;
            
            if (txType === 'buy') {
              dailyBalance += amount;
              flows.push({
                id: `${i}-${j}`,
                type: 'buy',
                from: '0xExchange' + Math.floor(Math.random() * 3),
                to: walletAddress,
                amount,
                timestamp: date.getTime() + (j * 3600000),
                fromType: 'exchange',
                toType: 'wallet',
                animated: false
              });
            } else {
              dailyBalance -= amount;
              flows.push({
                id: `${i}-${j}`,
                type: 'sell',
                from: walletAddress,
                to: '0xExchange' + Math.floor(Math.random() * 3),
                amount,
                timestamp: date.getTime() + (j * 3600000),
                fromType: 'wallet',
                toType: 'exchange',
                animated: false
              });
            }
          }
          
          movements.push({
            date: date.toLocaleDateString(),
            balance: dailyBalance,
            change: (Math.random() - 0.5) * 100,
            flows: dailyTxs
          });
        }
        
        setData(movements);
        setTokenFlows(flows);
        
        // Calculate trend
        if (movements.length >= 2) {
          const firstBalance = movements[0].balance;
          const lastBalance = movements[movements.length - 1].balance;
          if (lastBalance > firstBalance * 1.05) {
            setTrend('up');
          } else if (lastBalance < firstBalance * 0.95) {
            setTrend('down');
          } else {
            setTrend('neutral');
          }
        }
      } catch (error) {
        console.error("Error fetching token movements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenMovements();
  }, [walletAddress]);

  // Animate token flows
  useEffect(() => {
    if (tokenFlows.length === 0) return;

    const interval = setInterval(() => {
      setTokenFlows(prev => {
        const updated = [...prev];
        const randomIndex = Math.floor(Math.random() * updated.length);
        updated[randomIndex] = { ...updated[randomIndex], animated: true };
        
        setTimeout(() => {
          setTokenFlows(current => 
            current.map(flow => 
              flow.id === updated[randomIndex].id 
                ? { ...flow, animated: false }
                : flow
            )
          );
        }, 2000);
        
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [tokenFlows.length]);

  const formatBalance = (value: number) => {
    try {
      return formatEther(Math.floor(value * 1e18).toString());
    } catch {
      return value.toFixed(2);
    }
  };

  const getFlowColor = (type: string) => {
    switch (type) {
      case 'buy': return '#10B981'; // Green
      case 'sell': return '#EF4444'; // Red
      default: return '#3B82F6'; // Blue
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'wallet': return Wallet;
      case 'exchange': return Building2;
      case 'contract': return Repeat;
      default: return Wallet;
    }
  };

  const renderTokenFlowVisualization = () => (
    <div className="relative h-80 overflow-hidden">
      {/* Background grid */}
      <div className={`absolute inset-0 opacity-20 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDarkMode ? "#374151" : "#E5E7EB"} strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Token flow paths */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          {/* Gradients for different transaction types */}
          <linearGradient id="buyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="sellGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#F87171" stopOpacity="0.4"/>
          </linearGradient>
          
          {/* Animated flow effects */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Render flow paths */}
        {tokenFlows.slice(-10).map((flow, index) => {
          const startX = flow.type === 'buy' ? 50 : 250;
          const endX = flow.type === 'buy' ? 250 : 450;
          const y = 80 + (index * 25);
          const pathId = `flow-${flow.id}`;
          
          return (
            <g key={flow.id}>
              {/* Flow path */}
              <path
                d={`M ${startX} ${y} Q ${(startX + endX) / 2} ${y - 30} ${endX} ${y}`}
                fill="none"
                stroke={getFlowColor(flow.type)}
                strokeWidth="3"
                strokeDasharray={flow.animated ? "5,5" : "none"}
                filter={flow.animated ? "url(#glow)" : "none"}
                opacity={flow.animated ? 1 : 0.6}
                className={`transition-all duration-500 ${flow.animated ? 'animate-pulse' : ''}`}
              />
              
              {/* Animated token */}
              {flow.animated && (
                <circle
                  r="4"
                  fill={getFlowColor(flow.type)}
                  filter="url(#glow)"
                  className="animate-token-flow"
                  style={{
                    animationDuration: '2s',
                    animationTimingFunction: 'ease-in-out'
                  }}
                >
                  <animateMotion
                    dur="2s"
                    repeatCount="1"
                    path={`M ${startX} ${y} Q ${(startX + endX) / 2} ${y - 30} ${endX} ${y}`}
                  />
                </circle>
              )}
              
              {/* Arrow indicator */}
              <polygon
                points={flow.type === 'buy' ? 
                  `${endX-10},${y-5} ${endX},${y} ${endX-10},${y+5}` :
                  `${endX+10},${y-5} ${endX},${y} ${endX+10},${y+5}`
                }
                fill={getFlowColor(flow.type)}
                opacity={flow.animated ? 1 : 0.4}
              />
            </g>
          );
        })}
      </svg>

      {/* Entity nodes */}
      <div className="absolute inset-0 flex items-center justify-between px-8">
        {/* Exchanges/Sources */}
        <div className="flex flex-col space-y-4">
          <div className={`p-4 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-white'} shadow-lg border-2 border-green-500`}>
            <Building2 className="w-8 h-8 text-green-500" />
          </div>
          <div className={`text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isLoreMode ? 'Source Realm' : 'Exchanges'}
          </div>
        </div>

        {/* User Wallet */}
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-6 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-white'} shadow-xl border-4 border-purple-500 relative`}>
            <Wallet className="w-12 h-12 text-purple-500" />
            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-ping opacity-30"></div>
          </div>
          <div className={`text-center text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {isLoreMode ? 'Your Essence Core' : 'Your Wallet'}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        </div>

        {/* Destinations */}
        <div className="flex flex-col space-y-4">
          <div className={`p-4 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-white'} shadow-lg border-2 border-red-500`}>
            <Building2 className="w-8 h-8 text-red-500" />
          </div>
          <div className={`text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isLoreMode ? 'Destination Void' : 'Markets'}
          </div>
        </div>
      </div>

      {/* Flow legend */}
      <div className="absolute bottom-4 left-4 flex space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-green-500 rounded"></div>
          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isLoreMode ? 'Essence Inflow' : 'Token Buy'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-red-500 rounded"></div>
          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isLoreMode ? 'Essence Outflow' : 'Token Sell'}
          </span>
        </div>
      </div>

      {/* Flow statistics */}
      <div className="absolute top-4 right-4">
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            Active Flows
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {tokenFlows.filter(f => f.animated).length}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'}`}>
      <CardHeader>
        <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
          {trend === 'up' ? (
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          ) : trend === 'down' ? (
            <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
          ) : (
            <Repeat className="w-5 h-5 mr-2 text-blue-500" />
          )}
          {isLoreMode ? 'Token Essence Flow Visualization' : 'Token Movement Flow'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isLoreMode ? 'Mapping essence pathways...' : 'Analyzing token flows...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Token Flow Visualization */}
            {renderTokenFlowVisualization()}
            
            {/* Balance Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} />
                  <XAxis dataKey="date" stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                  <YAxis stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} tickFormatter={(value) => `${formatBalance(value)} MON`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      color: isDarkMode ? '#F9FAFB' : '#111827'
                    }}
                    formatter={(value: number) => [`${formatBalance(value)} MON`, isLoreMode ? 'Essence Level' : 'Balance']}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke={trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#3B82F6'}
                    strokeWidth={2}
                    dot={{ fill: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenMovementGraph;
