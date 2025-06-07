import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Activity, ExternalLink, Copy, CheckCircle, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WalletConnection from "@/components/WalletConnection";
import PortfolioOverview from "@/components/PortfolioOverview";
import DeFiAnalytics from "@/components/DeFiAnalytics";
import NFTCollection from "@/components/NFTCollection";
import DAppExplorer from "@/components/DAppExplorer";
import TransactionHistory from "@/components/TransactionHistory";
import BadgeCollection from "@/components/BadgeCollection";
import SearchBar from "@/components/SearchBar";
import { usePrivy } from "@privy-io/react-auth";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

const CopyAddressButton = ({ address }: { address: string }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      toast({
        title: "Copy failed",
        description: "Could not copy address to clipboard",
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {copied ? "Copied!" : "Copy to clipboard"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Index = () => {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { toast } = useToast();

  // For viewing other wallets, keep this state
  const [viewingAddress, setViewingAddress] = useState<string>("");
  const isViewingOwnWallet = viewingAddress === user?.wallet?.address;

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      setViewingAddress(user.wallet.address);
    }
  }, [authenticated, user]);

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
              <h1 className="text-2xl font-bold text-white">Monad Portfolio</h1>
              <Badge variant="outline" className="border-purple-500 text-purple-300">
                Testnet
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/tx-visualizer">
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                >
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
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={login}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
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
            <p className="text-white mb-4">Wallet not connected - showing connection page</p>
            <WalletConnection />
          </div>
        ) : (
          <div className="space-y-8">
            <p className="text-white mb-4">Wallet connected - showing main dashboard</p>
            
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
                <Button
                  onClick={() => setViewingAddress(user.wallet.address)}
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                >
                  Return to My Portfolio
                </Button>
              </div>
            ) : null}

            {/* Portfolio Overview */}
            <PortfolioOverview walletAddress={viewingAddress} />

            {/* Main Dashboard */}
            <Tabs defaultValue="portfolio" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-slate-800/50">
                <TabsTrigger value="portfolio" className="text-white data-[state=active]:bg-purple-600">
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="defi" className="text-white data-[state=active]:bg-purple-600">
                  DeFi
                </TabsTrigger>
                <TabsTrigger value="nfts" className="text-white data-[state=active]:bg-purple-600">
                  NFTs
                </TabsTrigger>
                <TabsTrigger value="dapps" className="text-white data-[state=active]:bg-purple-600">
                  dApps
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-purple-600">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="badges" className="text-white data-[state=active]:bg-purple-600">
                  Badges
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Token Holdings */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                        Token Holdings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { symbol: "MON", name: "Monad", balance: "1,250.00", value: "$0.00", change: "+12.5%" },
                        { symbol: "DAK", name: "Degen Ape King", balance: "850.50", value: "$0.00", change: "+8.2%" },
                        { symbol: "YAKI", name: "Yakitori", balance: "2,100.75", value: "$0.00", change: "-3.1%" },
                      ].map((token) => (
                        <div key={token.symbol} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{token.symbol[0]}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{token.symbol}</p>
                              <p className="text-gray-400 text-sm">{token.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white">{token.balance}</p>
                            <p className={`text-sm ${token.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {token.change}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Transaction History */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-500" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { type: "Swap", desc: "MON → DAK", time: "2 hours ago", status: "success" },
                        { type: "Stake", desc: "1000 MON staked", time: "5 hours ago", status: "success" },
                        { type: "Transfer", desc: "Received 500 YAKI", time: "1 day ago", status: "success" },
                      ].map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{tx.type}</p>
                            <p className="text-gray-400 text-sm">{tx.desc}</p>
                          </div>
                          <div className="text-right">
                            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                            <p className="text-gray-400 text-xs">{tx.time}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Network Stats */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Network Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Block Height</span>
                        <span className="text-white">2,847,392</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gas Price</span>
                        <span className="text-white">0.1 gwei</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">TPS</span>
                        <span className="text-white">10,000+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Validators</span>
                        <span className="text-white">156</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="defi">
                <DeFiAnalytics />
              </TabsContent>

              <TabsContent value="nfts">
                <NFTCollection />
              </TabsContent>

              <TabsContent value="dapps">
                <DAppExplorer />
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionHistory walletAddress={viewingAddress} />
              </TabsContent>

              <TabsContent value="badges">
                <BadgeCollection walletAddress={viewingAddress} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
