
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, Users, TrendingUp, Gamepad2, Coins, Droplets } from "lucide-react";

const DAppExplorer = () => {
  const featuredDApps = [
    {
      name: "Kuru",
      category: "DeFi",
      description: "Advanced AMM and liquidity protocols for Monad ecosystem",
      tvl: "$2.4M",
      users: "1,247",
      rating: 4.8,
      icon: <Droplets className="w-6 h-6 text-blue-400" />,
      url: "#",
      trending: true,
    },
    {
      name: "Curvance",
      category: "Lending",
      description: "Decentralized lending and borrowing platform",
      tvl: "$1.8M",
      users: "892",
      rating: 4.6,
      icon: <Coins className="w-6 h-6 text-green-400" />,
      url: "#",
      trending: false,
    },
    {
      name: "Fantasy Top",
      category: "Gaming",
      description: "Fantasy sports and gaming on Monad Testnet",
      tvl: "$950K",
      users: "634",
      rating: 4.9,
      icon: <Gamepad2 className="w-6 h-6 text-purple-400" />,
      url: "#",
      trending: true,
    },
  ];

  const categories = [
    { name: "DeFi", count: 12, icon: <TrendingUp className="w-5 h-5" /> },
    { name: "Gaming", count: 8, icon: <Gamepad2 className="w-5 h-5" /> },
    { name: "NFT", count: 15, icon: <Star className="w-5 h-5" /> },
    { name: "Social", count: 6, icon: <Users className="w-5 h-5" /> },
  ];

  const allDApps = [
    { name: "MonadSwap", category: "DeFi", users: "2.1K", status: "Live" },
    { name: "PenguinWorld", category: "Gaming", users: "1.8K", status: "Beta" },
    { name: "MonadNFT", category: "NFT", users: "956", status: "Live" },
    { name: "SocialMon", category: "Social", users: "743", status: "Alpha" },
    { name: "CryptoClash", category: "Gaming", users: "1.2K", status: "Live" },
    { name: "MonadBridge", category: "Infrastructure", users: "3.4K", status: "Live" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Beta": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Alpha": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="grid gap-4 md:grid-cols-4">
        {categories.map((category, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
                {category.icon}
              </div>
              <h3 className="text-white font-semibold mb-1">{category.name}</h3>
              <p className="text-gray-400 text-sm">{category.count} dApps</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured dApps */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Featured dApps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredDApps.map((dapp, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-6 hover:bg-slate-700/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
                      {dapp.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold flex items-center">
                        {dapp.name}
                        {dapp.trending && (
                          <Badge variant="outline" className="ml-2 border-orange-500 text-orange-300 text-xs">
                            🔥 Trending
                          </Badge>
                        )}
                      </h3>
                      <Badge variant="outline" className="border-purple-500 text-purple-300 text-xs mt-1">
                        {dapp.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">{dapp.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400">TVL</p>
                    <p className="text-white font-semibold">{dapp.tvl}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Users</p>
                    <p className="text-white font-semibold">{dapp.users}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm">{dapp.rating}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All dApps */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All dApps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allDApps.map((dapp, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{dapp.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{dapp.name}</h3>
                    <p className="text-gray-400 text-sm">{dapp.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white text-sm">{dapp.users}</p>
                    <p className="text-gray-400 text-xs">Users</p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(dapp.status)}`}>
                    {dapp.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DAppExplorer;
