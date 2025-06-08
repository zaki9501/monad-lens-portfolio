
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Clock, Calendar, ExternalLink, RefreshCw } from "lucide-react";

interface StakeInfoProps {
  walletAddress: string;
}

interface StakePosition {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  stakedAmount: string;
  rewardsEarned: string;
  apy: number;
  stakedDate: string;
  lockPeriod: string;
  status: 'active' | 'unstaking' | 'completed';
  protocol: string;
  tokenLogo?: string;
}

const StakeInfo = ({ walletAddress }: StakeInfoProps) => {
  const [stakes, setStakes] = useState<StakePosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - replace with actual API call
  const mockStakes: StakePosition[] = [
    {
      id: '1',
      tokenSymbol: 'MON',
      tokenName: 'Monad',
      stakedAmount: '1500.00',
      rewardsEarned: '45.23',
      apy: 12.5,
      stakedDate: '2024-05-15',
      lockPeriod: '30 days',
      status: 'active',
      protocol: 'Monad Staking',
    },
    {
      id: '2',
      tokenSymbol: 'WMON',
      tokenName: 'Wrapped Monad',
      stakedAmount: '800.50',
      rewardsEarned: '18.67',
      apy: 8.3,
      stakedDate: '2024-05-20',
      lockPeriod: '14 days',
      status: 'unstaking',
      protocol: 'MonadSwap',
    },
    {
      id: '3',
      tokenSymbol: 'LP-MON-USDC',
      tokenName: 'MON-USDC LP',
      stakedAmount: '250.75',
      rewardsEarned: '12.45',
      apy: 15.7,
      stakedDate: '2024-05-25',
      lockPeriod: 'Flexible',
      status: 'active',
      protocol: 'MonadFarm',
    }
  ];

  useEffect(() => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      try {
        setStakes(mockStakes);
      } catch (err) {
        setError("Failed to load staking positions");
      } finally {
        setLoading(false);
      }
    }, 1000);
  }, [walletAddress]);

  const totalStaked = stakes.reduce((sum, stake) => sum + parseFloat(stake.stakedAmount), 0);
  const totalRewards = stakes.reduce((sum, stake) => sum + parseFloat(stake.rewardsEarned), 0);
  const averageAPY = stakes.length > 0 ? stakes.reduce((sum, stake) => sum + stake.apy, 0) / stakes.length : 0;
  const activeStakes = stakes.filter(stake => stake.status === 'active').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'unstaking': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'unstaking': return 'Unstaking';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Staking Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">${totalStaked.toFixed(2)}</p>
            <p className="text-gray-400 text-sm">Total Staked</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">${totalRewards.toFixed(2)}</p>
            <p className="text-gray-400 text-sm">Total Rewards</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{averageAPY.toFixed(1)}%</p>
            <p className="text-gray-400 text-sm">Average APY</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{activeStakes}</p>
            <p className="text-gray-400 text-sm">Active Stakes</p>
          </CardContent>
        </Card>
      </div>

      {/* Staking Positions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Staking Positions</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading staking positions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : stakes.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No staking positions found</p>
              <p className="text-gray-500 text-sm">Start staking to earn rewards on your tokens</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stakes.map((stake) => (
                <div
                  key={stake.id}
                  className="bg-slate-700/30 rounded-lg p-6 hover:bg-slate-700/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {stake.tokenLogo ? (
                        <img src={stake.tokenLogo} alt={stake.tokenSymbol} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{stake.tokenSymbol[0]}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-semibold">{stake.tokenName}</h3>
                        <p className="text-gray-400 text-sm">{stake.protocol}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(stake.status)} text-white border-transparent`}>
                      {getStatusText(stake.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Staked Amount</p>
                      <p className="text-white font-semibold">{stake.stakedAmount} {stake.tokenSymbol}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Rewards Earned</p>
                      <p className="text-green-400 font-semibold">{stake.rewardsEarned} {stake.tokenSymbol}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">APY</p>
                      <p className="text-purple-400 font-semibold">{stake.apy}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Lock Period</p>
                      <p className="text-white font-semibold">{stake.lockPeriod}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-600">
                    <div>
                      <p className="text-gray-400 text-sm">Staked on: {new Date(stake.stakedDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      {stake.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            Unstake
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-400 hover:bg-green-500/10"
                          >
                            Claim Rewards
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StakeInfo;
