import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Wallet, Target, BarChart3 } from "lucide-react";
import { getAccountTokens, getAccountNFTs, getAccountTransactions, getAccountActivities } from "@/lib/blockvision";

interface PortfolioOverviewProps {
  walletAddress: string;
}

interface TokenInfo {
  token_address: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  logo_url?: string;
  priceUSD?: number;
}

// Cache for transaction data to persist across navigation
const TRANSACTION_CACHE_KEY = "portfolio_transaction_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedTransactionData(address: string) {
  try {
    const cache = JSON.parse(localStorage.getItem(TRANSACTION_CACHE_KEY) || "{}");
    const addressData = cache[address.toLowerCase()];
    if (addressData && Date.now() - addressData.timestamp < CACHE_TTL) {
      return addressData.data;
    }
  } catch {}
  return null;
}

function setCachedTransactionData(address: string, data: any) {
  try {
    const cache = JSON.parse(localStorage.getItem(TRANSACTION_CACHE_KEY) || "{}");
    cache[address.toLowerCase()] = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(TRANSACTION_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

const PortfolioOverview = ({ walletAddress }: PortfolioOverviewProps) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdValue, setUsdValue] = useState<number>(0);
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [showAllTokens, setShowAllTokens] = useState(false);
  const DEFAULT_VISIBLE_TOKENS = 5;
  const PRIORITY_TOKENS = ["MON", "USDC", "WMON"];

  useEffect(() => {
    if (!walletAddress) return;
    
    // Try to get cached transaction data first
    const cachedTxData = getCachedTransactionData(walletAddress);
    if (cachedTxData) {
      setTotalTransactions(cachedTxData.totalTransactions || 0);
      console.log("Loaded cached transaction count:", cachedTxData.totalTransactions);
    }
    
    setLoading(true);
    setError(null);
    
    // Fetch data with proper error handling for each API call
    const fetchData = async () => {
      try {
        console.log("Starting data fetch for wallet:", walletAddress);
        
        // Try to fetch tokens first (most reliable)
        let tokenData = null;
        try {
          tokenData = await getAccountTokens(walletAddress);
          console.log("Token API response:", tokenData);
          
          if (tokenData?.result?.data) {
            const tokensList = tokenData.result.data.map(token => ({
              ...token,
              decimals: token.decimal,
              token_address: token.contractAddress,
              logo_url: token.imageURL,
            }));
            setTokens(tokensList);
            console.log("Processed tokens:", tokensList);
          }
        } catch (tokenError) {
          console.error("Token fetch failed:", tokenError);
        }

        // Try to fetch NFTs
        try {
          const nftData = await getAccountNFTs(walletAddress, 1);
          console.log("NFT API response:", nftData);
          setNftCount(nftData?.result?.total || 0);
        } catch (nftError) {
          console.error("NFT fetch failed:", nftError);
          setNftCount(0);
        }

        // Try to fetch transactions and activities with improved handling
        let txTotal = 0;
        let activityTotal = 0;
        
        try {
          const txData = await getAccountTransactions(walletAddress, 1000);
          console.log("Transaction API response:", txData);
          
          // Handle different response formats
          if (txData?.result?.total !== undefined) {
            txTotal = txData.result.total;
          } else if (txData?.result?.data?.length) {
            txTotal = txData.result.data.length;
          }
          console.log("Transaction total from API:", txTotal);
        } catch (txError) {
          console.error("Transaction fetch failed:", txError);
          // If API fails, keep the cached value
          if (cachedTxData?.totalTransactions) {
            txTotal = cachedTxData.totalTransactions;
            console.log("Using cached transaction count due to API failure:", txTotal);
          }
        }

        try {
          const activityData = await getAccountActivities(walletAddress, 1000);
          console.log("Activity API response:", activityData);
          
          // Handle different response formats
          if (activityData?.result?.total !== undefined) {
            activityTotal = activityData.result.total;
          } else if (activityData?.result?.data?.length) {
            activityTotal = activityData.result.data.length;
          }
          console.log("Activity total from API:", activityTotal);
        } catch (actError) {
          console.error("Activity fetch failed:", actError);
        }

        // Use the maximum of both sources, but ensure we don't go to 0 if we had cached data
        const finalTxTotal = Math.max(txTotal, activityTotal);
        const resultingTotal = cachedTxData?.totalTransactions && finalTxTotal === 0 
          ? cachedTxData.totalTransactions 
          : Math.max(finalTxTotal, cachedTxData?.totalTransactions || 0);
        
        setTotalTransactions(resultingTotal);
        console.log("Final transaction count set to:", resultingTotal);

        // Cache the transaction data for future use
        setCachedTransactionData(walletAddress, {
          totalTransactions: resultingTotal,
          timestamp: Date.now()
        });

        // Calculate USD value if token data is available
        if (tokenData?.result?.data) {
          let total = 0;
          tokenData.result.data.forEach(token => {
            const price = Number(token.priceUSD || 0);
            const balance = Number(token.balance || 0);
            const decimals = Number(token.decimal || 18);
            if (!isNaN(balance) && !isNaN(decimals)) {
              total += (balance / 10 ** decimals) * price;
            }
          });
          setUsdValue(total);
        }

      } catch (generalError) {
        console.error("General API error:", generalError);
        setError("Failed to load some portfolio data. Some features may show partial information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [walletAddress]);

  const totalBalance = typeof usdValue === 'number' && !isNaN(usdValue)
    ? usdValue
    : tokens.reduce((sum, token) => {
        const balance = Number(token.balance ?? 0);
        const decimals = Number(token.decimals ?? 18);
        if (isNaN(balance) || isNaN(decimals)) return sum;
        const price = 1; // TODO: fetch real price
        return sum + (balance / 10 ** decimals) * price;
      }, 0);

  const sortedTokens = [...tokens].sort((a, b) => {
    const aPriority = PRIORITY_TOKENS.indexOf(a.symbol);
    const bPriority = PRIORITY_TOKENS.indexOf(b.symbol);
    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority;
    }
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;

    const aValue = (Number(a.balance) / 10 ** Number(a.decimals)) * (a.priceUSD ? Number(a.priceUSD) : 1);
    const bValue = (Number(b.balance) / 10 ** Number(b.decimals)) * (b.priceUSD ? Number(b.priceUSD) : 1);
    return bValue - aValue;
  });
  const visibleTokens = showAllTokens ? sortedTokens : sortedTokens.slice(0, DEFAULT_VISIBLE_TOKENS);

  return (
    <>
      {/* Enhanced Summary cards row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        {/* Total Balance */}
        <Card className="bg-slate-800/50 border-slate-700 col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Balance</p>
                <p className="text-3xl font-bold text-white">${!isNaN(totalBalance) ? totalBalance.toFixed(2) : "0.00"}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +15.2% (Testnet)
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Tokens - Fixed to show actual count */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Tokens</p>
                <p className="text-2xl font-bold text-white">{tokens.length}</p>
                <p className="text-blue-400 text-sm mt-1">Holdings</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NFTs */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">NFTs</p>
                <p className="text-2xl font-bold text-white">{nftCount !== null ? nftCount : "--"}</p>
                <p className="text-purple-400 text-sm mt-1">Collectibles</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Network</p>
                <p className="text-2xl font-bold text-white">Monad</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Active
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second row with additional metrics - removed Performance card */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Wallet Health */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">--</p>
            <p className="text-gray-400 text-sm">Wallet Health</p>
            <p className="text-emerald-400 text-xs mt-1">Coming soon</p>
          </CardContent>
        </Card>

        {/* Transaction Volume - Now shows actual count with persistence */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{totalTransactions}</p>
            <p className="text-gray-400 text-sm">Total Transactions</p>
            <p className="text-cyan-400 text-xs mt-1">On Monad</p>
            {error && <p className="text-red-400 text-xs mt-1">Partial data</p>}
          </CardContent>
        </Card>

        {/* DeFi Positions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">--</p>
            <p className="text-gray-400 text-sm">DeFi Positions</p>
            <p className="text-violet-400 text-xs mt-1">Coming soon</p>
          </CardContent>
        </Card>

        {/* Risk Score */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">--</p>
            <p className="text-gray-400 text-sm">Risk Score</p>
            <p className="text-yellow-400 text-xs mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PortfolioOverview;
