
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, ExternalLink } from "lucide-react";

const NFTCollection = () => {
  const nftCollections = [
    {
      name: "Monad Penguins",
      count: 3,
      floorPrice: "0.05 ETH",
      collection: "MonadVerse",
      rarity: "Rare",
      image: "/placeholder.svg",
    },
    {
      name: "MonSharks",
      count: 2,
      floorPrice: "0.08 ETH",
      collection: "AquaWorld",
      rarity: "Epic",
      image: "/placeholder.svg",
    },
    {
      name: "Monad Warriors",
      count: 1,
      floorPrice: "0.12 ETH",
      collection: "BattleVerse",
      rarity: "Legendary",
      image: "/placeholder.svg",
    },
    {
      name: "Crystal Monads",
      count: 4,
      floorPrice: "0.03 ETH",
      collection: "GemWorld",
      rarity: "Common",
      image: "/placeholder.svg",
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common": return "border-gray-500 text-gray-300";
      case "Rare": return "border-blue-500 text-blue-300";
      case "Epic": return "border-purple-500 text-purple-300";
      case "Legendary": return "border-yellow-500 text-yellow-300";
      default: return "border-gray-500 text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* NFT Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Image className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">10</p>
            <p className="text-gray-400 text-sm">Total NFTs</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Image className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">4</p>
            <p className="text-gray-400 text-sm">Collections</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Image className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">$0.00</p>
            <p className="text-gray-400 text-sm">Est. Value</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Image className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">1</p>
            <p className="text-gray-400 text-sm">Legendary</p>
          </CardContent>
        </Card>
      </div>

      {/* NFT Collections */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">My NFT Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nftCollections.map((nft, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <Image className="w-16 h-16 text-white/50" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">{nft.name}</h3>
                    <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                  </div>
                  <p className="text-gray-400 text-sm">{nft.collection}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-xs ${getRarityColor(nft.rarity)}`}>
                      {nft.rarity}
                    </Badge>
                    <span className="text-white text-sm">×{nft.count}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                    <span className="text-gray-400 text-xs">Floor Price</span>
                    <span className="text-white text-sm">{nft.floorPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collection Analytics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Collection Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["MonadVerse", "AquaWorld", "BattleVerse", "GemWorld"].map((collection, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{collection}</h3>
                    <p className="text-gray-400 text-sm">Monad Testnet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">Floor: 0.05 ETH</p>
                  <p className="text-green-400 text-sm">+12.5%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTCollection;
