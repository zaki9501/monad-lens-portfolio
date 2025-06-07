import React, { useState, useMemo, useEffect } from 'react';
import { Wallet, Brain, Zap, Eye, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ethers } from "ethers";
import { Multicall } from "ethereum-multicall";

interface TokenMovementGraphProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

interface OrbitingToken {
  id: string;
  name: string;
  symbol: string;
  type: 'native' | 'erc20' | 'nft';
  frequency: number;
  value: number;
  angle: number;
  orbitRadius: number;
  size: number;
  color: string;
  balanceHistory: { timestamp: string; balance: number }[];
  liveBalance?: number;
}

const TokenMovementGraph = ({ data, isDarkMode, isLoreMode }: TokenMovementGraphProps) => {
  const [selectedToken, setSelectedToken] = useState<OrbitingToken | null>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const [orbitingTokens, setOrbitingTokens] = useState<OrbitingToken[]>([]);

  // Aggregate real token movement from data
  useEffect(() => {
    const walletAddress = data?.walletAddress?.toLowerCase() || '';
    const activities = Array.isArray(data?.result?.data) ? data.result.data : [];
    const tokenMap: Record<string, OrbitingToken> = {};
    activities.forEach(tx => {
      (tx.addTokens || []).forEach(t => {
        const key = t.contractAddress;
        if (!tokenMap[key]) {
          tokenMap[key] = {
            id: key,
            name: t.symbol,
            symbol: t.symbol,
            type: t.contractAddress === '0x0000000000000000000000000000000000000000' ? 'native' : 'erc20',
            frequency: 0,
            value: 0,
            angle: Math.random() * 360,
            orbitRadius: 80 + Math.random() * 80,
            size: 12,
            color: t.contractAddress === '0x0000000000000000000000000000000000000000' ? '#fbbf24' : '#3b82f6',
            balanceHistory: []
          };
        }
        tokenMap[key].frequency++;
        tokenMap[key].value += Number(t.amount || 0);
      });
    });
    setOrbitingTokens(Object.values(tokenMap));
  }, [data]);

  // Fetch live balances using Multicall3
  useEffect(() => {
    const fetchBalances = async () => {
      if (!orbitingTokens.length || !data?.walletAddress) return;
      const provider = new ethers.providers.JsonRpcProvider("YOUR_MONAD_RPC_URL");
      const multicall = new Multicall({
        ethersProvider: provider,
        tryAggregate: true,
        multicallCustomContractAddress: "0xcA11bde05977b3631167028862bE2a173976CA11"
      });
      const erc20Abi = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      const callContexts = orbitingTokens
        .filter(t => t.type === "erc20")
        .map(token => ({
          reference: token.symbol,
          contractAddress: token.id,
          abi: erc20Abi,
          calls: [
            { reference: "balanceOf", methodName: "balanceOf", methodParameters: [data.walletAddress] },
            { reference: "decimals", methodName: "decimals", methodParameters: [] }
          ]
        }));
      let results = { results: {} };
      if (callContexts.length) {
        results = await multicall.call(callContexts);
      }
      // Native balance
      let nativeBalance = 0;
      try {
        nativeBalance = Number(ethers.utils.formatEther(await provider.getBalance(data.walletAddress)));
      } catch {}
      setOrbitingTokens(tokens => tokens.map(token => {
        if (token.type === 'native') {
          return { ...token, liveBalance: nativeBalance };
        }
        const res = results.results[token.symbol];
        if (res) {
          const bal = res.callsReturnContext.find(c => c.reference === "balanceOf")?.returnValues?.[0] || 0;
          const dec = res.callsReturnContext.find(c => c.reference === "decimals")?.returnValues?.[0] || 18;
          return { ...token, liveBalance: Number(bal) / 10 ** Number(dec) };
        }
        return token;
      }));
    };
    fetchBalances();
    // eslint-disable-next-line
  }, [orbitingTokens.length, data?.walletAddress]);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTime(prev => prev + 0.02);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getTokenPosition = (token: OrbitingToken) => {
    const speed = 1 / (token.frequency / 10);
    const currentAngle = (token.angle + animationTime * speed) * (Math.PI / 180);
    return {
      x: 200 + token.orbitRadius * Math.cos(currentAngle),
      y: 200 + token.orbitRadius * Math.sin(currentAngle)
    };
  };

  const getTokenIcon = (type: string) => {
    switch (type) {
      case 'native': return '⚡';
      case 'erc20': return '🔵';
      case 'nft': return '🎨';
      default: return '●';
    }
  };

  return (
    <div className="h-96 relative">
      <h3 className={`text-xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {isLoreMode ? 'Mind Balance Orbit' : 'Token Balance Orbit'}
      </h3>

      <div className="flex h-full">
        {/* Orbit Visualization */}
        <div className="flex-1 relative">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 400 400" 
            style={{ 
              background: isDarkMode 
                ? 'radial-gradient(circle at center, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.4) 70%)' 
                : 'radial-gradient(circle at center, rgba(248, 250, 252, 0.8) 0%, rgba(226, 232, 240, 0.4) 70%)'
            }}
          >
            {/* Background Stars/Dots */}
            {Array.from({ length: 20 }).map((_, i) => (
              <circle
                key={i}
                cx={50 + (i * 17) % 300}
                cy={50 + (i * 23) % 300}
                r="1"
                fill={isDarkMode ? '#64748b' : '#cbd5e1'}
                opacity="0.3"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.5;0.1"
                  dur={`${2 + i * 0.1}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}

            {/* Orbit Rings */}
            {orbitingTokens.map((token) => (
              <circle
                key={`orbit-${token.id}`}
                cx="200"
                cy="200"
                r={token.orbitRadius}
                fill="none"
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.3"
              />
            ))}

            {/* Central Wallet */}
            <g>
              <circle
                cx="200"
                cy="200"
                r="30"
                fill={`url(#centralGradient)`}
                className="drop-shadow-lg"
              />
              <circle
                cx="200"
                cy="200"
                r="35"
                fill="none"
                stroke={isDarkMode ? '#8b5cf6' : '#7c3aed'}
                strokeWidth="2"
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  values="35;40;35"
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0.8;0.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Central Icon */}
              <foreignObject x="185" y="185" width="30" height="30">
                <div className="w-full h-full flex items-center justify-center text-white text-lg">
                  {isLoreMode ? <Brain className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                </div>
              </foreignObject>
            </g>

            {/* Orbiting Tokens */}
            {orbitingTokens.map((token) => {
              const position = getTokenPosition(token);
              return (
                <g key={token.id}>
                  {/* Token Orbit Trail */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={token.size + 3}
                    fill={token.color}
                    opacity="0.1"
                  />
                  
                  {/* Token */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={token.size}
                    fill={token.color}
                    className="cursor-pointer transition-all duration-200 hover:brightness-110"
                    onClick={() => setSelectedToken(token)}
                    style={{
                      filter: selectedToken?.id === token.id ? 'drop-shadow(0 0 10px currentColor)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  >
                    <animate
                      attributeName="r"
                      values={`${token.size};${token.size + 2};${token.size}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Token Label */}
                  <foreignObject
                    x={position.x - 20}
                    y={position.y + token.size + 5}
                    width="40"
                    height="20"
                  >
                    <div className={`text-xs text-center font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {token.symbol}
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            {/* Gradients */}
            <defs>
              <radialGradient id="centralGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor={isDarkMode ? '#8b5cf6' : '#7c3aed'} />
                <stop offset="100%" stopColor={isDarkMode ? '#6366f1' : '#6366f1'} />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Token Details Panel */}
        <div className={`w-80 ml-6 p-4 rounded-lg ${
          isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/80 border border-gray-200'
        }`}>
          {selectedToken ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: selectedToken.color }}
                >
                  {getTokenIcon(selectedToken.type)}
                </div>
                <div>
                  <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedToken.name}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedToken.symbol} • {selectedToken.frequency} interactions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Value
                  </p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${selectedToken.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Frequency
                  </p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedToken.frequency}
                  </p>
                </div>
              </div>

              <div>
                <h5 className={`font-medium mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {isLoreMode ? 'Energy Flow Over Time' : 'Balance History'}
                </h5>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedToken.balanceHistory}>
                      <XAxis 
                        dataKey="timestamp" 
                        stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                        fontSize={10}
                      />
                      <YAxis 
                        stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                        fontSize={10}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke={selectedToken.color}
                        strokeWidth={2}
                        dot={{ fill: selectedToken.color, strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 4, stroke: selectedToken.color, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                <Eye className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isLoreMode 
                    ? 'Click on any orbiting essence to explore its energy patterns' 
                    : 'Click on any orbiting token to view its balance history'
                  }
                </p>
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
                <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isLoreMode ? 'Energy Types' : 'Token Types'}
                </h5>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {isLoreMode ? 'Core Energy (Native)' : 'Native Tokens'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {isLoreMode ? 'Structured Thoughts (ERC20)' : 'ERC20 Tokens'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {isLoreMode ? 'Unique Artifacts (NFTs)' : 'NFT Collections'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenMovementGraph;
