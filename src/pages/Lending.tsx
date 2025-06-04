
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Shield, Zap, Users, DollarSign, ArrowUpRight, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SearchBar from "@/components/SearchBar";

const Lending = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [viewingAddress, setViewingAddress] = useState("");
  const { toast } = useToast();

  const connectWallet = () => {
    const mockAddress = "0x742d35Cc6634C0532925a3b8D48C405BeF8b30Ab";
    setWalletAddress(mockAddress);
    setViewingAddress(mockAddress);
    setIsConnected(true);
    toast({
      title: "Wallet Connected",
      description: "Successfully connected to Monad Testnet",
    });
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setViewingAddress("");
    setIsConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleWalletSearch = (address: string) => {
    setViewingAddress(address);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Monad Lending</h1>
              <Badge variant="outline" className="border-purple-500 text-purple-300">
                Testnet
              </Badge>
            </div>
            
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={disconnectWallet}
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 animate-scale-in"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-6">
            Explore <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Monad Lending</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover lending opportunities, track borrowing positions, and analyze DeFi protocols across the Monad Testnet ecosystem. Search any wallet to explore their lending portfolio.
          </p>
        </div>

        {/* Search Bar - Centered */}
        <div className="flex justify-center mb-16 animate-scale-in">
          <SearchBar onWalletSelect={handleWalletSearch} />
        </div>

        {/* Stats Section */}
        <div className="grid gap-6 md:grid-cols-4 mb-16">
          {[
            { label: "Total Value Locked", value: "$12.5M", icon: DollarSign, color: "from-green-500 to-teal-500" },
            { label: "Active Lenders", value: "2,847", icon: Users, color: "from-blue-500 to-purple-500" },
            { label: "Protocols", value: "8", icon: Shield, color: "from-orange-500 to-red-500" },
            { label: "Avg APY", value: "12.5%", icon: TrendingUp, color: "from-purple-500 to-pink-500" }
          ].map((stat, index) => (
            <Card key={stat.label} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 animate-fade-in hover-scale" style={{ animationDelay: `${index * 100}ms` }}>
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
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {[
            {
              icon: Shield,
              title: "Secure Lending",
              description: "Lend your assets with confidence using battle-tested protocols on Monad Testnet",
              gradient: "from-blue-500 to-purple-500"
            },
            {
              icon: TrendingUp,
              title: "Yield Optimization",
              description: "Maximize your returns with advanced yield farming strategies and automated protocols",
              gradient: "from-green-500 to-teal-500"
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Experience instant transactions with Monad's high-performance blockchain infrastructure",
              gradient: "from-orange-500 to-red-500"
            }
          ].map((feature, index) => (
            <Card key={feature.title} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 group hover-scale animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <CardHeader>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Popular Protocols */}
        <Card className="bg-slate-800/50 border-slate-700 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center">
              <Shield className="w-6 h-6 mr-2 text-purple-500" />
              Popular Lending Protocols
            </CardTitle>
            <CardDescription className="text-gray-400">
              Explore the most trusted lending platforms on Monad Testnet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Kuru Finance", apy: "15.2%", tvl: "$4.2M", users: "892" },
                { name: "Curvance", apy: "12.8%", tvl: "$3.1M", users: "647" },
                { name: "MonadLend", apy: "18.5%", tvl: "$2.8M", users: "534" },
                { name: "TestnetVault", apy: "11.3%", tvl: "$2.4M", users: "423" }
              ].map((protocol, index) => (
                <div key={protocol.name} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{protocol.name}</h3>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">APY</span>
                      <span className="text-green-400 font-bold">{protocol.apy}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">TVL</span>
                      <span className="text-white">{protocol.tvl}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Users</span>
                      <span className="text-blue-400">{protocol.users}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Lending;
