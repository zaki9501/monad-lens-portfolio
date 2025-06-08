
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { JsonRpcProvider, formatEther } from "ethers";

interface TokenMovementGraphProps {
  walletAddress: string;
}

const TokenMovementGraph = ({ walletAddress }: TokenMovementGraphProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    if (!walletAddress) return;

    const fetchTokenMovements = async () => {
      setLoading(true);
      try {
        // Using JsonRpcProvider instead of ethers.providers
        const provider = new JsonRpcProvider("https://testnet1.monad.xyz");
        
        // Get recent blocks for simulation
        const latestBlock = await provider.getBlockNumber();
        const movements = [];
        
        // Simulate token movement data for the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          // Simulate some token balance changes
          const balance = Math.random() * 1000 + 500;
          movements.push({
            date: date.toLocaleDateString(),
            balance: balance,
            change: (Math.random() - 0.5) * 100,
          });
        }
        
        setData(movements);
        
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

  const formatBalance = (value: number) => {
    // Using formatEther directly instead of ethers.utils.formatEther
    try {
      return formatEther(Math.floor(value * 1e18).toString());
    } catch {
      return value.toFixed(2);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          {trend === 'up' ? (
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          ) : trend === 'down' ? (
            <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
          ) : (
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          )}
          Token Movement (7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">Loading token movements...</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${formatBalance(value)} MON`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number) => [`${formatBalance(value)} MON`, 'Balance']}
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
        )}
      </CardContent>
    </Card>
  );
};

export default TokenMovementGraph;
