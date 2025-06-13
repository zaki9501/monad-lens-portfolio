
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Zap, Target, Trophy, Shield, Calendar, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { getAccountTransactions, getAccountActivities } from "@/lib/blockvision";

interface BadgeCollectionProps {
  walletAddress: string;
}

interface EarnedBadge {
  id: number;
  name: string;
  description: string;
  icon: any;
  rarity: string;
  earnedDate: string;
  category: string;
}

interface AvailableBadge {
  id: number;
  name: string;
  description: string;
  icon: any;
  rarity: string;
  progress: number;
  category: string;
}

const BadgeCollection = ({ walletAddress }: BadgeCollectionProps) => {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<AvailableBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletMetrics, setWalletMetrics] = useState<any>(null);

  useEffect(() => {
    if (!walletAddress) return;
    
    const analyzeWalletForBadges = async () => {
      setLoading(true);
      try {
        const [txData, activityData] = await Promise.all([
          getAccountTransactions(walletAddress, 1000),
          getAccountActivities(walletAddress, 1000)
        ]);

        const transactions = txData?.result?.data || [];
        const activities = activityData?.result?.data || [];
        const allTxs = [...transactions, ...activities];
        
        // Calculate comprehensive metrics
        const totalTx = Math.max(txData?.result?.total || 0, allTxs.length);
        const contractInteractions = allTxs.filter(tx => 
          tx.contractAddress || tx.to !== walletAddress
        ).length;
        
        const uniqueContracts = new Set(
          allTxs.map(tx => tx.contractAddress || tx.to).filter(Boolean)
        ).size;
        
        const gasSpent = allTxs.reduce((sum, tx) => 
          sum + (Number(tx.transactionFee) || 0), 0
        );
        
        const totalVolume = allTxs.reduce((sum, tx) => {
          if (tx.value && tx.value !== "0") {
            return sum + (Number(tx.value) / 1e18);
          }
          return sum;
        }, 0);

        // Calculate account age
        const timestamps = allTxs.map(tx => tx.timestamp).filter(Boolean)
          .map(ts => typeof ts === 'number' && ts > 1e12 ? ts / 1000 : ts)
          .sort((a, b) => a - b);
        const accountAge = timestamps.length > 0 ? 
          (Date.now() / 1000 - timestamps[0]) / 86400 : 0;

        const activeDays = new Set(
          allTxs.map(tx => {
            if (tx.timestamp) {
              const timestamp = typeof tx.timestamp === 'number' && tx.timestamp > 1e12 ? 
                tx.timestamp : tx.timestamp * 1000;
              return new Date(timestamp).toDateString();
            }
            return null;
          }).filter(Boolean)
        ).size;

        setWalletMetrics({
          totalTx,
          contractInteractions,
          uniqueContracts,
          gasSpent,
          totalVolume,
          accountAge,
          activeDays
        });

        // Generate earned badges based on real metrics
        const earned: EarnedBadge[] = [];
        
        if (accountAge > 30) {
          earned.push({
            id: 1,
            name: "Early Adopter",
            description: "One of the first users on Monad Testnet",
            icon: Star,
            rarity: "Legendary",
            earnedDate: new Date(Date.now() - accountAge * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            category: "Community"
          });
        }
        
        if (uniqueContracts >= 5) {
          earned.push({
            id: 2,
            name: "DeFi Explorer",
            description: `Interacted with ${uniqueContracts}+ protocols`,
            icon: Zap,
            rarity: "Epic",
            earnedDate: new Date().toISOString().split('T')[0],
            category: "DeFi"
          });
        }
        
        if (totalTx >= 100) {
          earned.push({
            id: 4,
            name: "Active Trader",
            description: `Completed ${totalTx}+ transactions`,
            icon: Target,
            rarity: "Common",
            earnedDate: new Date().toISOString().split('T')[0],
            category: "Trading"
          });
        }

        if (activeDays >= 15) {
          earned.push({
            id: 5,
            name: "Consistent User",
            description: `Active for ${activeDays}+ days`,
            icon: Calendar,
            rarity: "Rare",
            earnedDate: new Date().toISOString().split('T')[0],
            category: "Engagement"
          });
        }

        setEarnedBadges(earned);

        // Generate available badges with real progress
        const available: AvailableBadge[] = [];
        
        if (totalVolume < 10000) {
          available.push({
            id: 5,
            name: "Whale Status",
            description: "Hold 10,000+ MON tokens",
            icon: Shield,
            rarity: "Legendary",
            progress: Math.min(95, (totalVolume / 10000) * 100),
            category: "Portfolio"
          });
        }
        
        if (uniqueContracts < 15) {
          available.push({
            id: 7,
            name: "dApp Master",
            description: "Use 15+ different dApps",
            icon: Award,
            rarity: "Rare",
            progress: Math.min(95, (uniqueContracts / 15) * 100),
            category: "dApps"
          });
        }

        if (totalTx < 1000) {
          available.push({
            id: 8,
            name: "Transaction King",
            description: "Complete 1000+ transactions",
            icon: Activity,
            rarity: "Epic",
            progress: Math.min(95, (totalTx / 1000) * 100),
            category: "Trading"
          });
        }

        setAvailableBadges(available);

      } catch (error) {
        console.error('Error analyzing wallet for badges:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeWalletForBadges();
  }, [walletAddress]);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-300">Analyzing wallet activity for badges...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {earnedBadges.length > 0 ? (
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
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No badges earned yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start using the blockchain to earn your first badges!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Badges */}
      {availableBadges.length > 0 && (
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
      )}

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
                <p className="text-white text-lg font-bold">
                  {earnedBadges.find(b => b.rarity === "Legendary")?.rarity || 
                   earnedBadges.find(b => b.rarity === "Epic")?.rarity || 
                   earnedBadges.find(b => b.rarity === "Rare")?.rarity || 
                   "None"}
                </p>
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
                <p className="text-white text-2xl font-bold">
                  {walletMetrics ? Math.round((earnedBadges.length / (earnedBadges.length + availableBadges.length)) * 100) : 0}%
                </p>
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
