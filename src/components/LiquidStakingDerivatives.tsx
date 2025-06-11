
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, ExternalLink, RefreshCw } from "lucide-react";
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
}

interface StakingInfo {
  platform: StakingPlatform;
  hasToken: boolean;
  balance: string;
  balanceFormatted: number;
}

const STAKING_PLATFORMS: StakingPlatform[] = [
  {
    name: "aPriori",
    contractAddress: "0xb2f82D0f38dc453D596Ad40A37799446Cc89274A",
    tokenSymbol: "aprMON",
    description: "Liquid staking token for staked MON, tradable on Uniswap V2 and zkSwap Finance V3",
    website: "https://apriori.finance",
    color: "bg-blue-500"
  },
  {
    name: "Shmonad",
    contractAddress: "0x3a98250F98Dd388C211206983453837C8365BDc1",
    tokenSymbol: "shMONAD",
    description: "Holistic liquid staking platform offering rewards while maintaining liquidity",
    website: "https://shmonad.xyz",
    color: "bg-purple-500"
  },
  {
    name: "Kintsu",
    contractAddress: "0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5",
    tokenSymbol: "sMON",
    description: "Next-gen liquid staking protocol with DeFi integration",
    website: "https://kintsu.xyz",
    color: "bg-green-500"
  },
  {
    name: "Magma",
    contractAddress: "0x2c9C959516e9AAEdB2C748224a41249202ca8BE7",
    tokenSymbol: "magmaMON",
    description: "Liquid staking platform integrated with Monad ecosystem",
    website: "#",
    color: "bg-orange-500"
  }
];

const LiquidStakingDerivatives = ({ walletAddress }: LSDProps) => {
  const [stakingData, setStakingData] = useState<StakingInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStakingData = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching account tokens for LSD analysis...");
      
      // Get all tokens for the wallet
      const response = await getAccountTokens(walletAddress);
      const tokens = response?.result?.data || [];
      
      console.log("Account tokens:", tokens);
      
      // Map each platform to check if user has their LST
      const stakingResults = STAKING_PLATFORMS.map((platform) => {
        // Find the token that matches this platform's contract address
        const token = tokens.find(t => 
          t.contractAddress.toLowerCase() === platform.contractAddress.toLowerCase()
        );
        
        if (token) {
          const balance = token.balance || "0";
          const balanceFormatted = parseFloat(balance);
          
          console.log(`Found ${platform.tokenSymbol}:`, {
            balance,
            balanceFormatted,
            token
          });
          
          return {
            platform,
            hasToken: balanceFormatted > 0,
            balance,
            balanceFormatted
          };
        } else {
          console.log(`No ${platform.tokenSymbol} found for ${platform.name}`);
          return {
            platform,
            hasToken: false,
            balance: "0",
            balanceFormatted: 0
          };
        }
      });

      setStakingData(stakingResults);
    } catch (err) {
      console.error("Error fetching staking data:", err);
      setError("Failed to load staking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakingData();
  }, [walletAddress]);

  const totalStaked = stakingData.reduce((sum, item) => sum + item.balanceFormatted, 0);
  const activeStakingPlatforms = stakingData.filter(item => item.hasToken && item.balanceFormatted > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
                {totalStaked > 0 ? "Staking" : "No Stakes"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchStakingData}
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
              <Button onClick={fetchStakingData} variant="outline">
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
                        <div className={`w-10 h-10 ${item.platform.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">
                            {item.platform.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
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
    </div>
  );
};

export default LiquidStakingDerivatives;
