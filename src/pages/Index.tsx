
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Box, Droplet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import PortfolioOverview from "@/components/PortfolioOverview";
import TransactionHistory from "@/components/TransactionHistory";
import TokenMovementGraph from "@/components/TokenMovementGraph";
import RecentActivity from "@/components/RecentActivity";
import WalletConnection from "@/components/WalletConnection";
import { usePrivy } from "@privy-io/react-auth";
import Navigation from "@/components/Navigation";
import FaucetDialog from "@/components/FaucetDialog";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authenticated, user } = usePrivy();
  const [faucetOpen, setFaucetOpen] = useState(false);
  
  // Get wallet address from URL params or connected wallet
  const walletFromUrl = searchParams.get("wallet");
  const connectedWallet = user?.wallet?.address;
  const walletAddress = walletFromUrl || connectedWallet || "";

  // Show toast if no wallet is provided
  useEffect(() => {
    if (!walletAddress && !authenticated) {
      toast({
        title: "No wallet connected",
        description: "Please connect your wallet or search for a specific address",
        variant: "destructive",
      });
    }
  }, [walletAddress, authenticated, toast]);

  const handleWalletSelect = (address: string) => {
    navigate(`/portfolio?wallet=${address}`);
  };

  const handleBackToHome = () => {
    navigate('/lending');
  };

  if (!walletAddress && !authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="mb-8 border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold text-white mb-6">
              Portfolio <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Analytics</span>
            </h1>
            <p className="text-gray-300 mb-8">
              Connect your wallet or search for a wallet address to view detailed portfolio analytics
            </p>
            <div className="flex justify-center mb-8">
              <SearchBar onWalletSelect={handleWalletSelect} />
            </div>
            <WalletConnection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleBackToHome}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white">Portfolio Analytics</h1>
                <Badge variant="outline" className="border-purple-500 text-purple-300">
                  {walletFromUrl ? "Viewing" : "Connected"}
                </Badge>
              </div>
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
              <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10" onClick={() => setFaucetOpen(true)}>
                <Droplet className="w-4 h-4 mr-2" />
                Faucet
              </Button>
              <FaucetDialog open={faucetOpen} onOpenChange={setFaucetOpen} />
              <div className="flex justify-center">
                <SearchBar onWalletSelect={handleWalletSelect} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Portfolio Overview */}
          <PortfolioOverview walletAddress={walletAddress} />

          {/* Charts and Analytics */}
          <div className="grid gap-8 lg:grid-cols-2">
            <TokenMovementGraph walletAddress={walletAddress} />
            <RecentActivity walletAddress={walletAddress} />
          </div>

          {/* Transaction History */}
          <TransactionHistory walletAddress={walletAddress} />
        </div>
      </div>
    </div>
  );
};

export default Index;
