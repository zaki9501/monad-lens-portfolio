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
  return <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Monad lens</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Track your Monad Testnet assets, explore DeFi protocols, and discover the latest dApps
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
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

        <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
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

        <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-white">Visiualiser</CardTitle>
            <CardDescription className="text-gray-400">Discover and connect to the latest Monad Testnet applications and protocols, and visualise your impressions </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-auto">
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
    </div>;
};
export default WalletConnection;