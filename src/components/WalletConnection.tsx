
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, Zap, Search, Network } from "lucide-react";

const WalletConnection = () => {
  const { login, authenticated } = usePrivy();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blockchain-bg">
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
          
          {/* Network connections */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="connection-line"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
          
          {/* Geometric shapes */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="geometric-shape"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`
              }}
            />
          ))}
          
          {/* Search wave effect */}
          <div className="search-wave" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/85b0ee68-ba1c-4435-a606-e39e09aaf155.png" 
              alt="Monad Lens Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Welcome to <span className="text-purple-400">Monad Lens</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
            Track your Monad Testnet assets, explore DeFi protocols, and discover the latest dApps
          </p>

          {!authenticated && (
            <Button
              onClick={login}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg transition-all duration-200 hover:scale-105"
            >
              <Wallet className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Connect Your Wallet
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-200 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-white">Portfolio Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-center text-sm sm:text-base">
                Monitor your Monad Testnet tokens, NFTs, and DeFi positions in real-time
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-200 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-white">DeFi Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-center text-sm sm:text-base">
                Get insights into your DeFi activities across Kuru, Curvance, and other protocols
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-200 hover:scale-105 md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-white">Visualizer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-center text-sm sm:text-base">
                Discover and connect to the latest Monad Testnet applications and protocols, and visualise your transactions
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {authenticated && (
          <div className="text-center mt-8 sm:mt-12">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 px-3 sm:px-4 py-2 text-sm sm:text-base">
              <Shield className="mr-2 h-4 w-4" />
              Wallet Connected
            </Badge>
          </div>
        )}
      </div>

      <style>{`
        .blockchain-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(139, 92, 246, 0.6);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .connection-line {
          position: absolute;
          width: 100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), transparent);
          animation: pulse 3s ease-in-out infinite;
        }

        .geometric-shape {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          animation: rotate 8s linear infinite;
        }

        .search-wave {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 50%;
          animation: searchPulse 4s ease-in-out infinite;
          transform: translate(-50%, -50%);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scaleX(1); }
          50% { opacity: 0.8; transform: scaleX(1.2); }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg) scale(1); opacity: 0.3; }
          50% { transform: rotate(180deg) scale(1.1); opacity: 0.6; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.3; }
        }

        @keyframes searchPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
        }

        @media (max-width: 640px) {
          .particle { width: 3px; height: 3px; }
          .connection-line { width: 60px; }
          .geometric-shape { width: 15px; height: 15px; }
          .search-wave { width: 150px; height: 150px; }
        }
      `}</style>
    </div>
  );
};

export default WalletConnection;
