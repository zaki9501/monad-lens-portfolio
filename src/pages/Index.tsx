import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Activity, ExternalLink, Copy, CheckCircle, BarChart3, Target, Coins, X, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WalletConnection from "@/components/WalletConnection";
import PortfolioOverview from "@/components/PortfolioOverview";
import DeFiAnalytics from "@/components/DeFiAnalytics";
import NFTCollection from "@/components/NFTCollection";
import DAppExplorer from "@/components/DAppExplorer";
import TransactionHistory from "@/components/TransactionHistory";
import BadgeCollection from "@/components/BadgeCollection";
import StakeInfo from "@/components/StakeInfo";
import SearchBar from "@/components/SearchBar";
import { usePrivy } from "@privy-io/react-auth";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Link, useSearchParams } from "react-router-dom";
import { getAccountTokens } from "@/lib/blockvision";
import { ethers } from "ethers";
import LiquidStakingDerivatives from "@/components/LiquidStakingDerivatives";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Cell, Pie, ResponsiveContainer } from "recharts";

interface CopyAddressButtonProps {
  address: string;
}

const CopyAddressButton: React.FC<CopyAddressButtonProps> = ({ address }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard"
      });
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      toast({
        title: "Copy failed",
        description: "Could not copy address to clipboard"
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 w-6 p-0 text-gray-400 hover:text-white">
            {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {copied ? "Copied!" : "Copy to clipboard"}
        </TooltipContent>
      </TooltipProvider>
  );
};

const MONAD_RPC_URL = "https://rpc.monad.monadblockchain.com";
const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)", "function symbol() view returns (string)", "function name() view returns (string)"];

const MONAD_TOKEN_ADDRESSES = [
"0x0000000000000000000000000000000000000000"
];
const TOKEN_CACHE_KEY = "token_holdings_cache";
const CACHE_TTL = 2 * 60 * 1000;

function getCachedTokens(address: string) {
  try {
    const cache = JSON.parse(localStorage.getItem(TOKEN_CACHE_KEY) || "{}");
    if (cache[address] && Date.now() - cache[address].timestamp < CACHE_TTL) {
      return cache[address].tokens;
    }
  } catch {}
  return null;
}

function setCachedTokens(address: string, tokens: any[]) {
  try {
    const cache = JSON.parse(localStorage.getItem(TOKEN_CACHE_KEY) || "{}");
    cache[address] = {
      tokens,
      timestamp: Date.now()
    };
    localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

// Chart color palette for pie chart
const CHART_COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff88", 
  "#ff0080", "#8000ff", "#ff8000", "#0080ff", "#80ff00"
];

const chartConfig = {
  balance: {
    label: "Balance",
  },
};

const Index = () => {
  const {
    login,
    logout,
    authenticated,
    user,
    ready
  } = usePrivy();
  const {
    toast
  } = useToast();
  const [searchParams] = useSearchParams();

  // For viewing other wallets, keep this state
  const [viewingAddress, setViewingAddress] = useState<string>("");
  const isViewingOwnWallet = viewingAddress === user?.wallet?.address;
  const [tokens, setTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [refreshTokens, setRefreshTokens] = useState(0);
  
  useEffect(() => {
    // Check for wallet query parameter first
    const walletFromQuery = searchParams.get('wallet');
    if (walletFromQuery) {
      setViewingAddress(walletFromQuery);
    } else if (authenticated && user?.wallet?.address) {
      setViewingAddress(user.wallet.address);
    }
  }, [authenticated, user, searchParams]);

  useEffect(() => {
    if (!viewingAddress) return;
    setLoadingTokens(true);
    setTokenError(null);

    // Try cache first
    const cached = getCachedTokens(viewingAddress);
    if (cached && !refreshTokens) {
      setTokens(cached);
      setLoadingTokens(false);
      return;
    }
    getAccountTokens(viewingAddress).then(data => {
      const tokensList = (data?.result?.data || []).map(token => ({
        ...token,
        decimals: token.decimal,
        token_address: token.contractAddress,
        logo_url: token.imageURL
      }));
      setTokens(tokensList);
      setCachedTokens(viewingAddress, tokensList);
    }).catch(err => {
      if (err.message && err.message.includes("429")) {
        setTokenError("Rate limit exceeded. Please try again later.");
      } else {
        setTokenError("Failed to load tokens");
      }
    }).finally(() => setLoadingTokens(false));
  }, [viewingAddress, refreshTokens]);

  // Prepare pie chart data from tokens - Fixed calculation
  const preparePieChartData = () => {
    if (!tokens || tokens.length === 0) return [];
    
    console.log("Preparing pie chart data from tokens:", tokens);
    
    // Calculate actual balances and filter out zero balances
    const tokenData = tokens
      .map((token, index) => {
        const rawBalance = Number(token.balance || 0);
        const decimals = Number(token.decimals || token.decimal || 18);
        const actualBalance = rawBalance / Math.pow(10, decimals);
        const priceUSD = Number(token.priceUSD || 0);
        const usdValue = actualBalance * priceUSD;
        
        console.log(`Token ${token.symbol}: rawBalance=${rawBalance}, decimals=${decimals}, actualBalance=${actualBalance}, priceUSD=${priceUSD}, usdValue=${usdValue}`);
        
        return {
          name: token.symbol || token.name || 'Unknown',
          value: usdValue > 0 ? usdValue : actualBalance, // Use USD value if available, otherwise raw balance
          balance: actualBalance,
          fill: CHART_COLORS[index % CHART_COLORS.length],
          hasUSDValue: usdValue > 0
        };
      })
      .filter(token => token.balance > 0) // Only include tokens with actual balance
      .sort((a, b) => b.value - a.value) // Sort by value descending
      .slice(0, 10); // Limit to top 10 tokens
    
    console.log("Prepared pie chart data:", tokenData);
    return tokenData;
  };

  const pieChartData = preparePieChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Monad lens</h1>
              <Badge variant="outline" className="border-purple-500 text-purple-300">
                Testnet
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/tx-visualizer">
                <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  TX Visualizer
                </Button>
              </Link>
              {authenticated && user?.wallet?.address ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">
                      {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                    </span>
                    <CopyAddressButton address={user.wallet.address} />
                  </div>
                  <Button variant="outline" onClick={logout} className="border-red-500 bg-purple-700 hover:bg-purple-600 text-slate-200">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button onClick={login} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!authenticated || !user?.wallet?.address ? (
          <div>
            <WalletConnection />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Search Bar */}
            <div className="flex justify-center">
              <SearchBar onWalletSelect={setViewingAddress} />
            </div>

            {/* Portfolio Header */}
            {!isViewingOwnWallet && viewingAddress ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Viewing Portfolio: {viewingAddress.slice(0, 6)}...{viewingAddress.slice(-4)}
                </h2>
                <Button onClick={() => setViewingAddress(user.wallet.address)} variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10">
                  Return to My Portfolio
                </Button>
              </div>
            ) : null}

            {/* Portfolio Overview */}
            <PortfolioOverview walletAddress={viewingAddress} />

            {/* Main Dashboard */}
            <Tabs defaultValue="portfolio" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
                <TabsTrigger value="portfolio" className="text-white data-[state=active]:bg-purple-600">
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="nfts" className="text-white data-[state=active]:bg-purple-600">
                  NFTs
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-purple-600">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="lsd" className="text-white data-[state=active]:bg-purple-600">
                  LSD
                </TabsTrigger>
                <TabsTrigger value="badges" className="text-white data-[state=active]:bg-purple-600">
                  Badges
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Token Holdings */}
                  <Card className="bg-slate-800/50 border-slate-700 col-span-3">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                        Token Holdings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Refresh Button */}
                      <button className="mb-4 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => setRefreshTokens(x => x + 1)}>
                        Refresh
                      </button>
                      {/* Token Holdings Grid */}
                      {loadingTokens ? (
                        <p className="text-white">Loading tokens...</p>
                      ) : tokenError ? (
                        <p className="text-red-400">{tokenError}</p>
                      ) : tokens.length === 0 ? (
                        <p className="text-gray-400">No tokens found for this address.</p>
                      ) : (() => {
                        // Sort tokens by balance descending
                        const sortedTokens = [...tokens].sort((a, b) => {
                          const aBalance = Number(a.balance ?? 0);
                          const bBalance = Number(b.balance ?? 0);
                          return bBalance - aBalance;
                        });

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {sortedTokens.map((token, idx) => {
                              const rawBalance = Number(token.balance ?? 0);
                              const decimals = Number(token.decimals || token.decimal || 18);
                              const actualBalance = rawBalance / Math.pow(10, decimals);
                              const isTop = token.symbol === "MON";

                              return (
                                <div
                                  key={token.token_address || token.contractAddress || idx}
                                  className={`flex items-center space-x-3 p-3 rounded-xl bg-white/5 border ${isTop ? 'border-blue-500 shadow-lg' : 'border-transparent'} ${actualBalance === 0 ? 'opacity-50' : ''}`}
                                >
                                  {token.logo_url || token.imageURL ? (
                                    <img src={token.logo_url || token.imageURL} alt={token.symbol} className="w-8 h-8 rounded-full" />
                                  ) : (
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">{(token.symbol || 'T')[0]}</span>
                                    </div>
                                  )}
                                  <div>
                                    <div className={`text-sm ${isTop ? 'text-blue-500 font-bold' : 'text-gray-200'}`}>{token.name || token.symbol}</div>
                                    <div className={`text-lg ${isTop ? 'text-blue-700 font-bold' : 'text-white'}`}>{actualBalance.toLocaleString(undefined, {
                                      maximumFractionDigits: 6
                                    })}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>

                {/* Token Distribution Pie Chart - Now positioned after token holdings */}
                {pieChartData.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <PieChart className="w-5 h-5 mr-2 text-blue-400" />
                          Token Distribution
                        </h3>
                        <p className="text-gray-400 text-sm">Top {pieChartData.length} tokens with balance</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="h-80">
                          <ChartContainer config={chartConfig} className="h-full">
                            <RechartsPieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <ChartTooltip
                                content={<ChartTooltipContent />}
                                formatter={(value, name) => [
                                  `${Number(value).toFixed(6)}`,
                                  name
                                ]}
                              />
                            </RechartsPieChart>
                          </ChartContainer>
                        </div>
                        
                        {/* Legend */}
                        <div className="space-y-2">
                          <h4 className="text-lg font-medium text-white mb-4">Token Breakdown</h4>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {pieChartData.map((token, index) => {
                              const totalValue = pieChartData.reduce((sum, t) => sum + t.value, 0);
                              const percentage = totalValue > 0 ? ((token.value / totalValue) * 100) : 0;
                              
                              return (
                                <div key={token.name} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div 
                                      className="w-4 h-4 rounded-full"
                                      style={{ backgroundColor: token.fill }}
                                    />
                                    <span className="text-white font-medium">{token.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white font-semibold">{token.balance.toFixed(6)}</p>
                                    <p className="text-gray-400 text-xs">
                                      {percentage.toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="nfts">
                <NFTCollection walletAddress={viewingAddress} />
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionHistory walletAddress={viewingAddress} />
              </TabsContent>

              <TabsContent value="lsd">
                <LiquidStakingDerivatives walletAddress={viewingAddress} />
              </TabsContent>

              <TabsContent value="badges">
                <BadgeCollection walletAddress={viewingAddress} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Built by Piki Section */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-gray-400 text-lg">Built by</span>
            <a href="https://x.com/Piki_eth" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors group">
              <span className="text-xl font-bold">Piki</span>
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
