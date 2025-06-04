
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Zap, Target, Trophy, Shield } from "lucide-react";

interface BadgeCollectionProps {
  walletAddress: string;
}

const BadgeCollection = ({ walletAddress }: BadgeCollectionProps) => {
  // Mock badge data
  const earnedBadges = [
    {
      id: 1,
      name: "Early Adopter",
      description: "One of the first 1000 users on Monad Testnet",
      icon: Star,
      rarity: "Legendary",
      earnedDate: "2024-01-15",
      category: "Community"
    },
    {
      id: 2,
      name: "DeFi Explorer",
      description: "Completed transactions on 5+ DeFi protocols",
      icon: Zap,
      rarity: "Epic",
      earnedDate: "2024-02-20",
      category: "DeFi"
    },
    {
      id: 3,
      name: "NFT Collector",
      description: "Owns 10+ NFTs from Monad collections",
      icon: Trophy,
      rarity: "Rare",
      earnedDate: "2024-03-10",
      category: "NFT"
    },
    {
      id: 4,
      name: "Active Trader",
      description: "Completed 100+ successful transactions",
      icon: Target,
      rarity: "Common",
      earnedDate: "2024-03-25",
      category: "Trading"
    }
  ];

  const availableBadges = [
    {
      id: 5,
      name: "Whale Status",
      description: "Hold 10,000+ MON tokens",
      icon: Shield,
      rarity: "Legendary",
      progress: 65,
      category: "Portfolio"
    },
    {
      id: 6,
      name: "Liquidity Provider",
      description: "Provide liquidity worth 1000+ MON",
      icon: Zap,
      rarity: "Epic",
      progress: 30,
      category: "DeFi"
    },
    {
      id: 7,
      name: "dApp Master",
      description: "Use 15+ different dApps",
      icon: Award,
      rarity: "Rare",
      progress: 80,
      category: "dApps"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "from-yellow-500 to-orange-500";
      case "Epic":
        return "from-purple-500 to-pink-500";
      case "Rare":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "bg-yellow-600 text-white";
      case "Epic":
        return "bg-purple-600 text-white";
      case "Rare":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Earned Badges ({earnedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-full flex items-center justify-center`}>
                    <badge.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{badge.name}</h3>
                    <Badge className={getRarityBadgeColor(badge.rarity)}>
                      {badge.rarity}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-2">{badge.description}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{badge.category}</span>
                  <span>Earned: {badge.earnedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Badges */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            Available Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableBadges.map((badge) => (
              <div key={badge.id} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors opacity-75">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-full flex items-center justify-center opacity-60`}>
                    <badge.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{badge.name}</h3>
                    <Badge className={getRarityBadgeColor(badge.rarity)}>
                      {badge.rarity}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">{badge.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span>{badge.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getRarityColor(badge.rarity)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${badge.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                  <span>{badge.category}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badge Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Badges</p>
                <p className="text-white text-2xl font-bold">{earnedBadges.length}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rarest Badge</p>
                <p className="text-white text-lg font-bold">Legendary</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Collection</p>
                <p className="text-white text-2xl font-bold">57%</p>
              </div>
              <Trophy className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BadgeCollection;
