import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, ExternalLink, RefreshCw, PiggyBank } from "lucide-react";
import { getAccountTokens } from "@/lib/blockvision";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Staked</p>
                <p className="text-2xl font-bold text-white">{totalStaked.toFixed(4)} MON</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Lend</p>
                <p className="text-2xl font-bold text-white">{totalLent.toFixed(4)}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Platforms</p>
                <p className="text-2xl font-bold text-white">{activeStakingPlatforms.length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Status</p>
              <p className="text-2xl font-bold text-green-400">
                {totalStaked > 0 || totalLent > 0 ? "Active" : "Inactive"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchData}
              disabled={loading}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Staking Platforms */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Coins className="w-5 h-5 mr-2 text-blue-500" />
            Liquid Staking Derivatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
              <p className="text-gray-400">Loading staking data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline">
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {stakingData.map((item) => (
                <Card 
                  key={item.platform.name} 
                  className={`border-slate-600 ${
                    item.hasToken && item.balanceFormatted > 0 
                      ? 'bg-slate-700/50 border-green-500/30' 
                      : 'bg-slate-700/30'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {item.platform.logoUrl ? (
                          <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-white/10 p-2">
                            <img 
                              src={item.platform.logoUrl} 
                              alt={item.platform.name}
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                // Fallback to text initials if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className={`w-12 h-12 ${item.platform.color} rounded-lg items-center justify-center hidden`}>
                              <span className="text-white font-bold text-lg">
                                {item.platform.name.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className={`w-16 h-16 ${item.platform.color} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold text-lg">
                              {item.platform.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-semibold">{item.platform.name}</h3>
                          <p className="text-gray-400 text-sm">{item.platform.tokenSymbol}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.hasToken && item.balanceFormatted > 0 && (
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            Staking
                          </Badge>
                        )}
                        {item.platform.website !== "#" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-auto text-gray-400 hover:text-white"
                            onClick={() => window.open(item.platform.website, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-gray-300 text-sm">{item.platform.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Balance:</span>
                        <span className="text-white font-semibold">
                          {item.balanceFormatted > 0 
                            ? `${item.balanceFormatted.toFixed(6)} ${item.platform.tokenSymbol}`
                            : `0 ${item.platform.tokenSymbol}`
                          }
                        </span>
                      </div>

                      {item.balanceFormatted > 0 && (
                        <div className="mt-3 p-3 bg-slate-600/30 rounded-lg">
                          <p className="text-green-400 text-sm font-medium">
                            ≈ {item.balanceFormatted.toFixed(4)} MON staked
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lending Tokens - Only show if there are active lending tokens */}
      {activeLendingTokens.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PiggyBank className="w-5 h-5 mr-2 text-teal-500" />
              Lending Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-500 mb-4" />
                <p className="text-gray-400">Loading lending data...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={fetchData} variant="outline">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group by platform */}
                {["Convenant", "Nostra"].map((platform) => {
                  const platformTokens = activeLendingTokens.filter(item => item.token.platform === platform);
                  
                  // Only show platform section if there are active tokens
                  if (platformTokens.length === 0) return null;
                  
                  return (
                    <div key={platform} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <div className={`w-8 h-8 ${platform === 'Convenant' ? 'bg-indigo-500' : 'bg-teal-500'} rounded-lg flex items-center justify-center mr-3`}>
                            <span className="text-white font-bold text-sm">
                              {platform.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          {platform}
                        </h3>
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          {platformTokens.length} Active
                        </Badge>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {platformTokens.map((item) => (
                          <Card 
                            key={item.token.contractAddress} 
                            className="border-slate-600 bg-slate-700/50 border-green-500/30"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-8 h-8 ${item.token.color} rounded-lg flex items-center justify-center`}>
                                    <span className="text-white font-bold text-xs">
                                      {item.token.tokenSymbol.slice(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium text-sm">{item.token.tokenSymbol}</h4>
                                    <p className="text-gray-400 text-xs">{item.token.platform}</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                                  Lending
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <p className="text-gray-300 text-xs">{item.token.description}</p>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400 text-xs">Balance:</span>
                                  <span className="text-white font-semibold text-sm">
                                    {item.balanceFormatted.toFixed(6)}
                                  </span>
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
