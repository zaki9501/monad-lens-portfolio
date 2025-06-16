
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Shield, Zap } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

const WalletConnection = () => {
  const {
    login,
    ready,
    authenticated,
    user
  } = usePrivy();

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating blockchain nodes */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `floatAnimation ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Network connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {[...Array(6)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              className="animate-pulse"
              style={{
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`
              }}
            />
          ))}
        </svg>

        {/* Geometric shapes */}
        <div className="absolute top-1/4 left-1/6 w-16 h-16 border border-blue-500/20 rounded-lg animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-12 h-12 border border-purple-500/20 rotate-45" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
        <div className="absolute top-2/3 left-3/4 w-8 h-8 border border-green-500/20 rounded-full animate-ping" style={{ animationDelay: '1s' }} />

        {/* Search wave effect */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
            style={{ 
              animation: 'searchWaveAnimation 4s ease-in-out infinite',
              transform: 'translateX(-100%)'
            }}
          />
          <div 
            className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
            style={{ 
              animation: 'searchWaveAnimation 4s ease-in-out infinite', 
              animationDelay: '2s',
              transform: 'translateX(-100%)'
            }}
          />
        </div>
      </div>

      {/* Main content with higher z-index */}
      <div className="relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Monad lens</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Track your Monad Testnet assets, explore DeFi protocols, and discover the latest dApps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Portfolio Tracking</CardTitle>
              <CardDescription className="text-gray-400">
                Monitor your Monad Testnet tokens, NFTs, and DeFi positions in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">DeFi Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Get insights into your DeFi activities across Kuru, Curvance, and other protocols
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Visualiser</CardTitle>
              <CardDescription className="text-gray-400">
                Discover and connect to the latest Monad Testnet applications and protocols, and visualise your impressions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-auto backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription className="text-gray-400">
              Connect your EVM-compatible wallet to get started with Monad lens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={login} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg">
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
            <p className="text-center text-sm text-gray-400">
              Supports MetaMask, Rabby, and other EVM wallets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CSS animations using a style tag without jsx */}
      <style>{`
        @keyframes floatAnimation {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes searchWaveAnimation {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(0%); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WalletConnection;
