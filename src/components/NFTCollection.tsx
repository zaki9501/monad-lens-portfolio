import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, ExternalLink, ChevronDown, CheckCircle, HelpCircle } from "lucide-react";
import { getAccountNFTs } from "@/lib/blockvision";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface NFTCollectionProps {
  walletAddress: string;
}

// Helper function to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const NFTCollection = ({ walletAddress }: NFTCollectionProps) => {
  const [allNFTs, setAllNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalNFTs, setTotalNFTs] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("verified");
  const [displayCount, setDisplayCount] = useState(6); // Initial number of collections to display
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);

    const fetchAllNFTs = async () => {
      try {
        let fetchedNFTs: any[] = [];
        let currentPage = 1;
        let hasMore = true;
        let retryCount = 0;
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 2000;
        const REQUEST_DELAY = 1000;

        while (hasMore) {
          try {
            await delay(REQUEST_DELAY);
            
            const data = await getAccountNFTs(walletAddress, currentPage);
            const nftList = data?.result?.data || [];
            const total = data?.result?.total || 0;
            if (currentPage === 1) {
              setTotalNFTs(total);
            }
            
            if (nftList.length === 0) {
              hasMore = false;
            } else {
              fetchedNFTs = [...fetchedNFTs, ...nftList];
              currentPage++;
              retryCount = 0;
            }
          } catch (err) {
            console.error(`Error fetching page ${currentPage}:`, err);
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              console.log(`Retrying page ${currentPage} (attempt ${retryCount}/${MAX_RETRIES})...`);
              await delay(RETRY_DELAY * retryCount);
              continue;
            } else {
              throw err;
            }
          }
        }

        console.log("Total NFTs fetched:", fetchedNFTs.length);
        setAllNFTs(fetchedNFTs);

        // Debugging: Log all fetched NFTs to see their structure
        console.log("Fetched all NFTs (flattened):", fetchedNFTs);

        const verified = fetchedNFTs.filter(nft => nft.verified === true).length;
        const unknown = fetchedNFTs.filter(nft => nft.verified !== true).length;
        setVerifiedCount(verified);
        setUnknownCount(unknown);

      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to load NFTs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllNFTs();
  }, [walletAddress]);

  const groupNFTsByCollection = (nfts: any[]) => {
    const groups: { [key: string]: any[] } = {};
    nfts.forEach(nft => {
      // Debugging: Log individual NFT as it's being grouped
      console.log("Processing NFT for grouping:", nft);
      const collectionIdentifier = nft.collection_name || nft.contract_address || (nft.token_type ? `${nft.token_type} Collection` : "Unknown Collection");
      // Debugging: Log if collectionIdentifier is still 'Unknown Collection'
      if (collectionIdentifier === "Unknown Collection") {
        console.warn("NFT with unknown collection identifier after flattening:", nft);
      }
      if (!groups[collectionIdentifier]) {
        groups[collectionIdentifier] = [];
      }
      groups[collectionIdentifier].push(nft);
    });
    return groups;
  };

  const getNFTImageUrl = (nft: any) => {
    return nft.image_url || nft.imageURL || nft.imageUrl || nft.image || nft.metadata?.image;
  };

  const loadMore = () => {
    setIsLoadingMore(true);
    setDisplayCount(prevCount => prevCount + 6);
    setIsLoadingMore(false);
  };

  // Filter all NFTs based on active tab
  const filteredNFTs = allNFTs.filter(nft => {
    // Debugging: Log each NFT as it's filtered
    console.log("Filtering NFT (", activeTab, "):", nft);
    if (activeTab === "verified") {
      return nft.verified === true;
    } else {
      return nft.verified !== true;
    }
  });

  // Debugging: Log filtered NFTs array
  console.log("Filtered NFTs array (", activeTab, "):", filteredNFTs);

  // Group ALL filtered NFTs (not just a slice) to get all collections relevant to the tab
  const groupedCollections = groupNFTsByCollection(filteredNFTs);
  // Debugging: Log grouped collections
  console.log("Grouped Collections (after filtering and grouping):", groupedCollections);
  const allCollectionNames = Object.keys(groupedCollections);

  // Only display a slice of the collection names based on displayCount
  const displayedCollectionNames = allCollectionNames.slice(0, displayCount);

  return (
    <div className="space-y-6">
      {/* NFT Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total NFTs</p>
                <p className="text-2xl font-bold text-white">{totalNFTs}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Verified</p>
                <p className="text-2xl font-bold text-white">{verifiedCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Unknown</p>
                <p className="text-2xl font-bold text-white">{unknownCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NFT Collections */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Collections</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-white mb-2">Loading all NFTs...</p>
            </div>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : allNFTs.length === 0 ? (
            <p className="text-gray-400">No NFTs found for this address.</p>
          ) : (
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="verified">Verified ({verifiedCount})</TabsTrigger>
                  <TabsTrigger value="unverified">Unknown ({unknownCount})</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab}>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayedCollectionNames.map(collectionName => {
                      const nfts = groupedCollections[collectionName];
                      if (!nfts || nfts.length === 0) {
                        return null;
                      }
                      return (
                        <div key={collectionName} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300">
                          <div className="aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                            {nfts[0] && getNFTImageUrl(nfts[0]) ? (
                              <img 
                                src={getNFTImageUrl(nfts[0])} 
                                alt={nfts[0]?.name || `NFT #1`} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ display: nfts[0] && getNFTImageUrl(nfts[0]) ? 'none' : 'flex' }}
                            >
                              <Image className="w-16 h-16 text-white/50" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-semibold">{collectionName}</h3>
                              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                                {nfts.length} Items
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-gray-400 text-sm">
                                {nfts[0]?.ercStandard || "ERC721"}
                              </p>
                              {nfts[0]?.verified && (
                                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {displayCount < allCollectionNames.length && (
                    <div className="mt-6 text-center">
                      <Button 
                        onClick={loadMore}
                        variant="outline"
                        className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? (
                          "Loading..."
                        ) : (
                          <>
                            Load More <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTCollection;
