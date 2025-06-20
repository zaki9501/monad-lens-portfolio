import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Activity, ExternalLink, Copy, CheckCircle, BarChart3, Target, Coins, X, Box } from "lucide-react";
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
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getAccountTokens } from "@/lib/blockvision";
import { ethers } from "ethers";
import LiquidStakingDerivatives from "@/components/LiquidStakingDerivatives";
import MarketOverview from "@/components/MarketOverview";

const CopyAddressButton = ({
  address
}: {
  address: string;
}) => {
  const [copied, setCopied] = useState(false);
  const {
    toast
  } = useToast();
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
  return <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 w-6 p-0 text-gray-400 hover:text-white">
            {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {copied ? "Copied!" : "Copy to clipboard"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>;
};

const MONAD_RPC_URL = "https://rpc.monad.monadblockchain.com";
const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)", "function symbol() view returns (string)", "function name() view returns (string)"];

const MONAD_TOKEN_ADDRESSES = [
"0x0000000000000000000000000000000000000000"
];

const TOKEN_CACHE_KEY = "token_holdings_cache";
const CACHE_TTL = 2 * 60 * 1000;

function getCachedTokens(address) {
  try {
    const cache = JSON.parse(localStorage.getItem(TOKEN_CACHE_KEY) || "{}");
    if (cache[address] && Date.now() - cache[address].timestamp < CACHE_TTL) {
      return cache[address].tokens;
    }
  } catch {}
  return null;
}

function setCachedTokens(address, tokens) {
  try {
    const cache = JSON.parse(localStorage.getItem(TOKEN_CACHE_KEY) || "{}");
    cache[address] = {
      tokens,
      timestamp: Date.now()
    };
    localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

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
  const navigate = useNavigate();

  // For viewing other wallets, keep this state
  const [viewingAddress, setViewingAddress] = useState<string>("");
  const isViewingOwnWallet = viewingAddress === user?.wallet?.address;
  const [tokens, setTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [refreshTokens, setRefreshTokens] = useState(0);

  useEffect(() => {
    // Check for wallet query parameter first
    const walletFromQuery = searchParams.get('wallet');
    if (walletFromQuery) {
      setViewingAddress(walletFromQuery);
    } else if (authenticated && user?.wallet?.address) {
      // Only set to user's wallet if no query parameter is present
      setViewingAddress(user.wallet.address);
    }
  }, [authenticated, user, searchParams]);

  // Add this effect for redirecting after wallet connect
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      // Only redirect if not already on /portfolio
      if (!window.location.pathname.startsWith('/portfolio')) {
        navigate('/portfolio?wallet=' + user.wallet.address);
      }
    }
  }, [authenticated, user, navigate]);

  useEffect(() => {
    if (!viewingAddress) return;
    setLoadingTokens(true);
    setTokenError(null);

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

  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/image/Untitled_design__2_-removebg-preview.png" 
                alt="Monad Lens Logo" 
                className="w-8 h-8"
              />
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
              <Link to="/block-visualizer">
                <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 relative">
                  <Box className="w-4 h-4 mr-2" />
                  Block Visualizer
                  <Badge variant="outline" className="absolute -top-2 -right-2 text-[10px] px-1 py-0 border-green-500 text-green-400 bg-black/50">
                    BETA
                  </Badge>
                </Button>
              </Link>
              {authenticated && user?.wallet?.address ? <div className="flex items-center space-x-3">
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
                </div> : <Button onClick={login} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {(!authenticated || !user?.wallet?.address) && !viewingAddress ? <div>
            <WalletConnection />
          </div> : <div className="space-y-8">
            
            {/* Search Bar */}
            <div className="flex justify-center">
              <SearchBar onWalletSelect={setViewingAddress} />
            </div>

            {/* Portfolio Header */}
            {!isViewingOwnWallet && viewingAddress ? <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Viewing Portfolio: {viewingAddress.slice(0, 6)}...{viewingAddress.slice(-4)}
                </h2>
                {authenticated && user?.wallet?.address && (
                  <Button onClick={() => setViewingAddress(user.wallet.address)} variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10">
                    Return to My Portfolio
                  </Button>
                )}
              </div> : null}

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
                      {loadingTokens ? <p className="text-white">Loading tokens...</p> : tokenError ? <p className="text-red-400">{tokenError}</p> : tokens.length === 0 ? <p className="text-gray-400">No tokens found for this address.</p> : (() => {
                    const sortedTokens = [...tokens].sort((a, b) => {
                      const aBalance = Number(a.balance ?? 0);
                      const bBalance = Number(b.balance ?? 0);
                      return bBalance - aBalance;
                    });
                    return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {sortedTokens.map((token, idx) => {
                        const balance = Number(token.balance ?? 0);
                        const isTop = token.symbol === "MON";
                        return <div key={token.token_address || idx} className={`flex items-center space-x-3 p-3 rounded-xl bg-white/5 border ${isTop ? 'border-blue-500 shadow-lg' : 'border-transparent'} ${balance === 0 ? 'opacity-50' : ''}`}>
                                    {token.logo_url ? <img src={token.logo_url} alt={token.symbol} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">{token.symbol[0]}</span>
                                      </div>}
                                    <div>
                                      <div className={`text-sm ${isTop ? 'text-blue-500 font-bold' : 'text-gray-200'}`}>{token.name || token.symbol}</div>
                                      <div className={`text-lg ${isTop ? 'text-blue-700 font-bold' : 'text-white'}`}>{balance.toLocaleString(undefined, {
                                maximumFractionDigits: 6
                              })}</div>
                                    </div>
                                  </div>;
                      })}
                            </div>;
                  })()}
                    </CardContent>
                  </Card>
                </div>
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
          </div>}

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
    </div>;
};

export default Index;
