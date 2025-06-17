
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Shield, Zap, Users, DollarSign, Copy, Star, Check, X, BarChart3, Box } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import { usePrivy } from "@privy-io/react-auth";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import BackgroundAnimation from "@/components/BackgroundAnimation";

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
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {copied ? "Copied!" : "Copy to clipboard"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>;
};

const Lending = () => {
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
  const navigate = useNavigate();

  const handleWalletSelect = (address: string) => {
    // Navigate to home page with the selected wallet address as a query parameter
    navigate(`/?wallet=${address}`);
  };

  return (
    <div className="min-h-screen relative">
      {/* Add the background animation */}
      <BackgroundAnimation />
      
      {/* Main content with higher z-index */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
                  <DollarSign className="w-5 h-5 text-white" />
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
                    <Button variant="outline" onClick={logout} className="border-red-500 text-red-400 hover:bg-red-500/10">
                      Disconnect
                    </Button>
                  </div> : <Button onClick={login} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 animate-scale-in">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-7xl font-bold text-white mb-6">
              Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Monad Lens</span>
            </h1>
            <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
              The ultimate tool for exploring wallets, analyzing DApps, and visualizing transactions on the Monad Testnet. 
              Discover insights, track activities, and understand blockchain interactions like never before.
            </p>
            
            {/* Search Bar */}
            <div className="flex justify-center mb-12">
              <SearchBar onWalletSelect={handleWalletSelect} />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 md:grid-cols-3 mb-20">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 group hover-scale">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Wallet Analysis</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Deep dive into any wallet's activity, reputation, and transaction patterns with comprehensive analytics and visual insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 group hover-scale">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Transaction Visualizer</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Visualize complex transaction flows and patterns with interactive charts and real-time monitoring capabilities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 group hover-scale">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">DApp Analyzer</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Analyze DApp interactions, engagement patterns, and ecosystem participation with detailed metrics and insights.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="grid gap-6 md:grid-cols-4 mb-20">
            {[{
            label: "Wallets Analyzed",
            value: "15,847",
            icon: Users,
            color: "from-blue-500 to-purple-500"
          }, {
            label: "Transactions Tracked",
            value: "2.3M",
            icon: TrendingUp,
            color: "from-green-500 to-teal-500"
          }, {
            label: "DApps Monitored",
            value: "124",
            icon: Shield,
            color: "from-orange-500 to-red-500"
          }, {
            label: "Active Users",
            value: "3,291",
            icon: DollarSign,
            color: "from-purple-500 to-pink-500"
          }].map((stat, index) => <Card key={stat.label} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover-scale">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-white text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>

          {/* Key Features Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-3xl text-center flex items-center justify-center">
                <Star className="w-8 h-8 mr-3 text-purple-500" />
                Why Choose Monad Explorer?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  {["Comprehensive wallet reputation scoring", "Real-time transaction monitoring", "Advanced DApp interaction analytics", "Beautiful data visualizations"].map((feature, index) => <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-300 text-lg">{feature}</span>
                    </div>)}
                </div>
                <div className="space-y-6">
                  {["Lightning-fast Monad blockchain integration", "User-friendly interface design", "Detailed portfolio insights", "Export and sharing capabilities"].map((feature, index) => <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-300 text-lg">{feature}</span>
                    </div>)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Built by Piki Section */}
          <div className="mt-20 text-center">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-gray-400 text-lg">Built by</span>
              <a href="https://x.com/Piki_eth" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors group">
                <span className="text-xl font-bold">Piki</span>
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Lending;
