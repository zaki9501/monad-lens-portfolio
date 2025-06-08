
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, ExternalLink } from "lucide-react";
import { getAccountNFTs } from "@/lib/blockvision";

interface NFTCollectionProps {
  walletAddress: string;
}

const NFTCollection = ({ walletAddress }: NFTCollectionProps) => {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    getAccountNFTs(walletAddress, 1)
      .then((data) => {
        const nftList = data?.result?.data || [];
        console.log("NFT data received:", nftList);
        // Log each NFT to see what image fields are available
        nftList.forEach((nft, index) => {
          console.log(`NFT ${index}:`, {
            name: nft.name,
            image_url: nft.image_url,
            image: nft.image,
            imageURL: nft.imageURL,
            imageUrl: nft.imageUrl,
            metadata: nft.metadata
          });
        });
        setNfts(nftList);
      })
      .catch((err) => {
        setError("Failed to load NFTs");
      })
      .finally(() => setLoading(false));
  }, [walletAddress]);

  const getNFTImageUrl = (nft: any) => {
    // Try multiple possible image field names
    return nft.image_url || nft.imageURL || nft.imageUrl || nft.image || nft.metadata?.image;
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
            <p className="text-2xl font-bold text-white">{nfts.length}</p>
            <p className="text-gray-400 text-sm">Total NFTs</p>
          </CardContent>
        </Card>
        {/* You can add more summary cards here if needed */}
      </div>

      {/* NFT Collections */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">My NFTs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white">Loading NFTs...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : nfts.length === 0 ? (
            <p className="text-gray-400">No NFTs found for this address.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {nfts.map((nft, index) => {
                const imageUrl = getNFTImageUrl(nft);
                return (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300">
                    <div className="aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={nft.name || `NFT #${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log(`Failed to load image for NFT ${index}:`, imageUrl);
                            // Hide the broken image and show fallback
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log(`Successfully loaded image for NFT ${index}:`, imageUrl);
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ display: imageUrl ? 'none' : 'flex' }}
                      >
                        <Image className="w-16 h-16 text-white/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">{nft.name || `NFT #${index + 1}`}</h3>
                        {nft.external_url && (
                          <a href={nft.external_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                          </a>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{nft.collection_name || nft.contract_address}</p>
                      {/* Debug info - remove this in production */}
                      <p className="text-xs text-gray-500">
                        Image URL: {imageUrl ? "✓" : "✗"} | Token ID: {nft.token_id}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTCollection;
