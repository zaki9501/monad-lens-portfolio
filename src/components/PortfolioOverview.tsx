import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { getAccountTokens } from "@/lib/blockvision";

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
}

const PortfolioOverview = ({ walletAddress }: PortfolioOverviewProps) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdValue, setUsdValue] = useState<number>(0);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    getAccountTokens(walletAddress)
      .then((data) => {
        console.log("API response:", data);
        setTokens(
          (data?.result?.data || []).map(token => ({
            ...token,
            decimals: token.decimal,
            token_address: token.contractAddress,
            logo_url: token.imageURL,
          }))
        );
        console.log("Tokens:", data?.result?.data || []);
        setUsdValue(data?.result?.usdValue ?? 0);
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

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-slate-800/50 border-slate-700">
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

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">24h Change</p>
              <p className="text-3xl font-bold text-white">--</p>
              <p className="text-gray-400 text-sm mt-1">Coming soon</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 col-span-2">
        <CardContent className="p-6">
          <div className="mb-4">
            <p className="text-gray-400 text-sm font-medium">Tokens</p>
            {loading ? (
              <p className="text-white">Loading...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : tokens.length === 0 ? (
              <p className="text-gray-400">No tokens found for this address.</p>
            ) : (
              <div className="space-y-2">
                {tokens.map((token, idx) => (
                  <div key={token.token_address || idx} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {token.logo_url ? (
                        <img src={token.logo_url} alt={token.symbol} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{token.symbol[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{token.symbol}</p>
                        <p className="text-gray-400 text-sm">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white">
                        {
                          !isNaN(Number(token.balance))
                            ? Number(token.balance).toLocaleString()
                            : "0"
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">NFTs</p>
              <p className="text-3xl font-bold text-white">--</p>
              <p className="text-gray-400 text-sm mt-1">Coming soon</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioOverview;
