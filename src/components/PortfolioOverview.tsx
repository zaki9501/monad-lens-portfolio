
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Wallet, Target, BarChart3 } from "lucide-react";
import { getAccountTokens, getAccountNFTs } from "@/lib/blockvision";

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

const PortfolioOverview = ({ walletAddress }: PortfolioOverviewProps) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdValue, setUsdValue] = useState<number>(0);
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [showAllTokens, setShowAllTokens] = useState(false);
  const DEFAULT_VISIBLE_TOKENS = 5;
  const PRIORITY_TOKENS = ["MON", "USDC", "WMON"];

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    getAccountTokens(walletAddress)
      .then(async (data) => {
        console.log("API response:", data);
        const tokensList = (data?.result?.data || []).map(token => ({
          ...token,
          decimals: token.decimal,
          token_address: token.contractAddress,
          logo_url: token.imageURL,
        }));
        setTokens(tokensList);
        console.log("Tokens:", tokensList);
        // Fetch prices for each token and calculate total USD value
        let total = 0;
        for (const token of tokensList) {
          let price = 0;
          try {
            // Try to get price from Blockvision API if available
            if (token.priceUSD !== undefined) {
              price = Number(token.priceUSD);
            } else {
              // fallback: try MCP plugin (if available in your project)
              // const meta = await functions.mcp_piki_monadhub_get_token_metadata({ tokenAddress: token.token_address });
              // price = meta.priceUsd || 0;
            }
          } catch (e) {
            price = 0;
          }
          const balance = Number(token.balance ?? 0);
          const decimals = Number(token.decimals ?? 18);
          if (!isNaN(balance) && !isNaN(decimals)) {
            total += (balance / 10 ** decimals) * price;
          }
        }
        setUsdValue(total);
      })
      .catch((err) => {
        console.error("Blockvision error:", err);
        if (err.message && err.message.includes("429")) {
          setError("Rate limit exceeded. Please try again later.");
        } else {
          setError("Failed to load tokens");
        }
      })
      .finally(() => setLoading(false));

    // Fetch NFTs
    (async () => {
      try {
        const nftData = await getAccountNFTs(walletAddress, 1);
        // Blockvision returns an array of NFTs in nftData.result.data
        const nfts = nftData?.result?.data || [];
        setNftCount(nfts.length);
      } catch (e) {
        setNftCount(null);
      }
    })();
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

  // Sort tokens by USD value (or balance if price is missing)
  const sortedTokens = [...tokens].sort((a, b) => {
    // Priority sort
    const aPriority = PRIORITY_TOKENS.indexOf(a.symbol);
    const bPriority = PRIORITY_TOKENS.indexOf(b.symbol);
    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority; // both are priority, keep their order
    }
    if (aPriority !== -1) return -1; // a is priority, comes first
    if (bPriority !== -1) return 1;  // b is priority, comes first

    // Otherwise, sort by USD value
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

        {/* Active Tokens */}
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

        {/* Portfolio Performance */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Performance</p>
                <p className="text-2xl font-bold text-green-400">+24.5%</p>
                <p className="text-gray-400 text-sm mt-1">Since testnet</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second row with additional metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Wallet Health */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">Excellent</p>
            <p className="text-gray-400 text-sm">Wallet Health</p>
            <div className="mt-2 bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full w-4/5"></div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Volume */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">127</p>
            <p className="text-gray-400 text-sm">Total Transactions</p>
            <p className="text-cyan-400 text-xs mt-1">+12 this week</p>
          </CardContent>
        </Card>

        {/* DeFi Positions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">3</p>
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
            <p className="text-2xl font-bold text-yellow-400">Low</p>
            <p className="text-gray-400 text-sm">Risk Score</p>
            <div className="mt-2 bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-full w-1/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PortfolioOverview;
