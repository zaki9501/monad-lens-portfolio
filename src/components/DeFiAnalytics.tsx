
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Droplets, Coins, Target } from "lucide-react";

const DeFiAnalytics = () => {
  const defiPositions = [
    {
      protocol: "Kuru",
      type: "Liquidity Pool",
      pair: "MON/ETH",
      deposited: "1,000 MON + 0.5 ETH",
      rewards: "25.6 KURU",
      apy: "45.2%",
      icon: <Droplets className="w-5 h-5 text-blue-400" />,
    },
    {
      protocol: "Curvance",
      type: "Lending",
      pair: "DAK Supply",
      deposited: "500 DAK",
      rewards: "12.3 CRV",
      apy: "28.7%",
      icon: <Coins className="w-5 h-5 text-green-400" />,
    },
    {
      protocol: "Fantasy Top",
      type: "Staking",
      pair: "YAKI Stake",
      deposited: "2,000 YAKI",
      rewards: "15.8 FT",
      apy: "67.3%",
      icon: <Target className="w-5 h-5 text-purple-400" />,
    },
  ];

  const protocolStats = [
    { name: "Kuru", tvl: "$2.4M", users: "1,247", apy: "45.2%" },
    { name: "Curvance", tvl: "$1.8M", users: "892", apy: "28.7%" },
    { name: "Fantasy Top", tvl: "$950K", users: "634", apy: "67.3%" },
  ];

  return (
    <div className="space-y-6">
      {/* DeFi Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Staked</p>
                <p className="text-2xl font-bold text-white">$0.00</p>
                <p className="text-green-400 text-sm">Testnet Value</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Positions</p>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-gray-400 text-sm">Protocols</p>
              </div>
              <Droplets className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending Rewards</p>
                <p className="text-2xl font-bold text-white">53.7</p>
                <p className="text-purple-400 text-sm">Various Tokens</p>
              </div>
              <Coins className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Active DeFi Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {defiPositions.map((position, index) => (
              <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {position.icon}
                    <div>
                      <h3 className="text-white font-semibold">{position.protocol}</h3>
                      <Badge variant="outline" className="border-purple-500 text-purple-300 text-xs">
                        {position.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">{position.apy} APY</p>
                    <p className="text-gray-400 text-sm">{position.pair}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Deposited</p>
                    <p className="text-white">{position.deposited}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pending Rewards</p>
                    <p className="text-purple-300">{position.rewards}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protocol Statistics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Protocol Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {protocolStats.map((protocol, index) => (
              <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-white font-semibold mb-3">{protocol.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">TVL</span>
                    <span className="text-white text-sm">{protocol.tvl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Users</span>
                    <span className="text-white text-sm">{protocol.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Best APY</span>
                    <span className="text-green-400 text-sm">{protocol.apy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeFiAnalytics;
