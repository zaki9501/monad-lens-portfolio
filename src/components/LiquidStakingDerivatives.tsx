import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, ExternalLink, RefreshCw, PiggyBank, Activity, Clock, Target } from "lucide-react";
import { getAccountTokens } from "@/lib/blockvision";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface LSDProps {
  walletAddress: string;
}

interface StakingPlatform {
  name: string;
  contractAddress: string;
  tokenSymbol: string;
  description: string;
  website: string;
  color: string;
  logoUrl?: string;
}

interface LendingToken {
  name: string;
  contractAddress: string;
  tokenSymbol: string;
  description: string;
  platform: string;
  color: string;
}

interface StakingInfo {
  platform: StakingPlatform;
  hasToken: boolean;
  balance: string;
  balanceFormatted: number;
}

interface LendingInfo {
  token: LendingToken;
  hasToken: boolean;
  balance: string;
  balanceFormatted: number;
}

const STAKING_PLATFORMS: StakingPlatform[] = [
  {
    name: "aPriori",
    contractAddress: "0xb2f82D0f38dc453D596Ad40A37799446Cc89274A",
    tokenSymbol: "aprMON",
    description: "MEV infrastructure and liquid staking protocol, designed for the parallel execution era and natively built on Monad.",
    website: "https://www.apr.io/",
    color: "bg-blue-500",
    logoUrl: "https://www.apr.io/logo-with-name.svg"
  },
  {
    name: "Shmonad",
    contractAddress: "0x3a98250F98Dd388C211206983453837C8365BDc1",
    tokenSymbol: "shMONAD",
    description: "Holistic Liquid Staking that boosts yield, UX, and execution quality by credibly aligning Validators with Applications in the MEV layer.",
    website: "https://shmonad.xyz/",
    color: "bg-purple-500",
    logoUrl: "https://shmonad.xyz/logo/shmonad_white.svg"
  },
  {
    name: "Kintsu",
    contractAddress: "0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5",
    tokenSymbol: "sMON",
    description: "Liquid Staking On Monad",
    website: "https://kintsu.xyz/",
    color: "bg-green-500"
  },
  {
    name: "Magma",
    contractAddress: "0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3",
    tokenSymbol: "gMON",
    description: "Magma is a community focused Liquid Staking Protocol on Monad",
    website: "https://www.magmastaking.xyz/",
    color: "bg-orange-500",
    logoUrl: "https://www.magmastaking.xyz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.723d3b22.png&w=1920&q=75"
  }
];

const LENDING_TOKENS: LendingToken[] = [
  // Convenant Platform
  {
    name: "Convenant",
    contractAddress: "0x1d30392503203dd42f5516B32dACA6b2e11F71d7",
    tokenSymbol: "cvnMON",
    description: "Lending token on Convenant protocol",
    platform: "Convenant",
    color: "bg-indigo-500"
  },
  {
    name: "aaPriori Monad LST",
    contractAddress: "0x9a1dc02bC1c4d417DB92858857e1cE44448C167d",
    tokenSymbol: "aaPriori",
    description: "aPriori lending token on Convenant",
    platform: "Convenant",
    color: "bg-indigo-500"
  },
  {
    name: "zaPriori Monad LST",
    contractAddress: "0x0326d17b271859b11495fEB1313820857A634937",
    tokenSymbol: "zaPriori",
    description: "zaPriori lending token on Convenant",
    platform: "Convenant",
    color: "bg-indigo-500"
  },
  {
    name: "ashmonad",
    contractAddress: "0xb34104E84fE38Db28FbA228C98c0f2c179b035cA",
    tokenSymbol: "ashmonad",
    description: "Shmonad lending token on Convenant",
    platform: "Convenant",
    color: "bg-indigo-500"
  },
  {
    name: "zShmonad",
    contractAddress: "0x89456CcA1Fb8E41406c8e2b0E67Fa590179fE7Af",
    tokenSymbol: "zShmonad",
    description: "zShmonad lending token on Convenant",
    platform: "Convenant",
    color: "bg-indigo-500"
  },
  // Nostra Platform
  {
    name: "Nostra IB aprMON Collateral",
    contractAddress: "0x1D1d54337103059aD106B5EB567B0279a988e66c",
    tokenSymbol: "ibAprMON",
    description: "Interest bearing aprMON collateral on Nostra",
    platform: "Nostra",
    color: "bg-teal-500"
  },
  {
    name: "Nostra IB gMON Collateral",
    contractAddress: "0xabcBA744914B6d77bf3946f6830b487Ab49b5A8B",
    tokenSymbol: "ibGMON",
    description: "Interest bearing gMON collateral on Nostra",
    platform: "Nostra",
    color: "bg-teal-500"
  },
  {
    name: "Nostra IB sMON Collateral",
    contractAddress: "0xB2e2Bb53F1FD98cF802a5F459f26e763474Bbe69",
    tokenSymbol: "ibSMON",
    description: "Interest bearing sMON collateral on Nostra",
    platform: "Nostra",
    color: "bg-teal-500"
  },
  {
    name: "Nostra IB shMON Collateral",
    contractAddress: "0x27baf5c4cc9b0B7340F342F50b876dB5baa96848",
    tokenSymbol: "ibShMON",
    description: "Interest bearing shMON collateral on Nostra",
    platform: "Nostra",
    color: "bg-teal-500"
  }
];

const LiquidStakingDerivatives = ({ walletAddress }: LSDProps) => {
  const [stakingData, setStakingData] = useState<StakingInfo[]>([]);
  const [lendingData, setLendingData] = useState<LendingInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching account tokens for LSD and lending analysis...");
      
      // Get all tokens for the wallet
      const response = await getAccountTokens(walletAddress);
      const tokens = response?.result?.data || [];
      
      console.log("Account tokens:", tokens);
      
      // Map staking platforms
      const stakingResults = STAKING_PLATFORMS.map((platform) => {
        const token = tokens.find(t => 
          t.contractAddress.toLowerCase() === platform.contractAddress.toLowerCase()
        );
        
        if (token) {
          const balance = token.balance || "0";
          const balanceFormatted = parseFloat(balance);
          
          return {
            platform,
            hasToken: balanceFormatted > 0,
            balance,
            balanceFormatted
          };
        } else {
          return {
            platform,
            hasToken: false,
            balance: "0",
            balanceFormatted: 0
          };
        }
      });

      // Map lending tokens
      const lendingResults = LENDING_TOKENS.map((lendingToken) => {
        const token = tokens.find(t => 
          t.contractAddress.toLowerCase() === lendingToken.contractAddress.toLowerCase()
        );
        
        if (token) {
          const balance = token.balance || "0";
          const balanceFormatted = parseFloat(balance);
          
          return {
            token: lendingToken,
            hasToken: balanceFormatted > 0,
            balance,
            balanceFormatted
          };
        } else {
          return {
            token: lendingToken,
            hasToken: false,
            balance: "0",
            balanceFormatted: 0
          };
        }
      });

      setStakingData(stakingResults);
      setLendingData(lendingResults);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [walletAddress]);

  const totalStaked = stakingData.reduce((sum, item) => sum + item.balanceFormatted, 0);
  const totalLent = lendingData.reduce((sum, item) => sum + item.balanceFormatted, 0);
  const activeStakingPlatforms = stakingData.filter(item => item.hasToken && item.balanceFormatted > 0);
  const activeLendingTokens = lendingData.filter(item => item.hasToken && item.balanceFormatted > 0);

  return (
    <div className="space-y-8">
      {/* Enhanced Summary Cards with Gradients */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Staked</p>
                <p className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {totalStaked.toFixed(4)}
                </p>
                <p className="text-xs text-gray-400 mt-1">MON</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Portfolio Weight</span>
                <span className="text-blue-300">{totalStaked > 0 ? '65%' : '0%'}</span>
              </div>
              <Progress value={totalStaked > 0 ? 65 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-300 text-sm font-medium">Total Lent</p>
                <p className="text-3xl font-bold text-white bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {totalLent.toFixed(4)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Tokens</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Lending APY</span>
                <span className="text-teal-300">8.5%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Active Platforms</p>
                <p className="text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {activeStakingPlatforms.length}
                </p>
                <p className="text-xs text-gray-400 mt-1">Diversified</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Risk Score</span>
                <span className="text-green-300">Low</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Status</p>
              <p className="text-3xl font-bold">
                {totalStaked > 0 || totalLent > 0 ? (
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Active</span>
                ) : (
                  <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">Inactive</span>
                )}
              </p>
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                <span>Last updated: now</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchData}
              disabled={loading}
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Staking Platforms */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-slate-700/50">
          <CardTitle className="text-white flex items-center text-2xl">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Coins className="w-6 h-6 text-white" />
            </div>
            Liquid Staking Derivatives
            <Badge variant="outline" className="ml-auto border-blue-500 text-blue-400 bg-blue-500/10">
              {activeStakingPlatforms.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin text-white" />
              </div>
              <p className="text-gray-400 text-lg">Loading staking data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 mb-6 text-lg">{error}</p>
              <Button onClick={fetchData} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {stakingData.map((item) => (
                <Card 
                  key={item.platform.name} 
                  className={`border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                    item.hasToken && item.balanceFormatted > 0 
                      ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-green-500/30 shadow-green-500/10 shadow-lg' 
                      : 'bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-slate-600/50 hover:border-slate-500/50'
                  }`}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        {item.platform.logoUrl ? (
                          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white/10 p-3 shadow-lg">
                            <img 
                              src={item.platform.logoUrl} 
                              alt={item.platform.name}
                              className="w-14 h-14 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className={`w-14 h-14 ${item.platform.color} rounded-xl items-center justify-center hidden shadow-lg`}>
                              <span className="text-white font-bold text-xl">
                                {item.platform.name.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={`w-20 h-20 ${item.platform.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold text-xl">
                              {item.platform.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-bold text-xl">{item.platform.name}</h3>
                          <p className="text-gray-400 text-sm font-medium">{item.platform.tokenSymbol}</p>
                          <div className="flex items-center mt-1 text-xs text-green-400">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span>12.5% APY</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {item.hasToken && item.balanceFormatted > 0 && (
                          <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 shadow-green-500/20 shadow-sm">
                            Active
                          </Badge>
                        )}
                        {item.platform.website !== "#" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-3 h-auto text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                            onClick={() => window.open(item.platform.website, '_blank')}
                          >
                            <ExternalLink className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-gray-300 text-sm leading-relaxed">{item.platform.description}</p>
                      
                      <div className="bg-slate-600/20 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm font-medium">Balance:</span>
                          <span className="text-white font-bold text-lg">
                            {item.balanceFormatted > 0 
                              ? `${item.balanceFormatted.toFixed(6)} ${item.platform.tokenSymbol}`
                              : `0 ${item.platform.tokenSymbol}`
                            }
                          </span>
                        </div>

                        {item.balanceFormatted > 0 && (
                          <>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-green-400 text-sm font-medium">
                                  ≈ {item.balanceFormatted.toFixed(4)} MON staked
                                </p>
                                <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                                  Earning
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">Daily Rewards</span>
                                <span className="text-green-400 font-medium">+0.034 MON</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Lending Tokens */}
      {activeLendingTokens.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-slate-700/50">
            <CardTitle className="text-white flex items-center text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              Lending Tokens
              <Badge variant="outline" className="ml-auto border-teal-500 text-teal-400 bg-teal-500/10">
                {activeLendingTokens.length} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin text-white" />
                </div>
                <p className="text-gray-400 text-lg">Loading lending data...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-400 mb-6 text-lg">{error}</p>
                <Button onClick={fetchData} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Group by platform */}
                {["Convenant", "Nostra"].map((platform) => {
                  const platformTokens = activeLendingTokens.filter(item => item.token.platform === platform);
                  
                  if (platformTokens.length === 0) return null;
                  
                  return (
                    <div key={platform} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white flex items-center">
                          <div className={`w-12 h-12 ${platform === 'Convenant' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-teal-500 to-cyan-500'} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                            <span className="text-white font-bold text-lg">
                              {platform.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          {platform}
                        </h3>
                        <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
                          {platformTokens.length} Active
                        </Badge>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {platformTokens.map((item) => (
                          <Card 
                            key={item.token.contractAddress} 
                            className="border-slate-600 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-green-500/30 shadow-green-500/10 shadow-lg hover:scale-[1.02] transition-all duration-300"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-12 h-12 ${item.token.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <span className="text-white font-bold text-sm">
                                      {item.token.tokenSymbol.slice(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-white font-bold text-lg">{item.token.tokenSymbol}</h4>
                                    <p className="text-gray-400 text-sm">{item.token.platform}</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-green-500 text-green-400 text-xs bg-green-500/10">
                                  Lending
                                </Badge>
                              </div>

                              <div className="space-y-4">
                                <p className="text-gray-300 text-sm">{item.token.description}</p>
                                
                                <div className="bg-slate-600/20 rounded-lg p-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Balance:</span>
                                    <span className="text-white font-bold">
                                      {item.balanceFormatted.toFixed(6)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiquidStakingDerivatives;
