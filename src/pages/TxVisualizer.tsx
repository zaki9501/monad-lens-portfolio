
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Navigation from "@/components/Navigation";
import WalletConnection from "@/components/WalletConnection";
import SearchBar from "@/components/SearchBar";
import AnalysisResults from "@/components/AnalysisResults";
import WalletScoreCard from "@/components/WalletScoreCard";
import TransactionTimeline from "@/components/TransactionTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

const TxVisualizer = () => {
  const { authenticated } = usePrivy();
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoreMode, setIsLoreMode] = useState(false);
  const isMobile = useIsMobile();

  const { data: walletData, isLoading } = useQuery({
    queryKey: ['wallet-analysis', selectedAddress],
    queryFn: async () => {
      if (!selectedAddress) return null;
      
      const response = await fetch(
        `https://api.blockvision.org/v2/account/txs?address=${selectedAddress}&limit=50&offset=0`,
        {
          headers: {
            'X-API-KEY': 'yiF1gJh8kNbFlkm3AgL3H5P7NF95c4XVIbNsJQql'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }
      
      return response.json();
    },
    enabled: !!selectedAddress,
  });

  if (!authenticated) {
    return <WalletConnection />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <Navigation />
      
      <div className={`${isMobile ? 'pt-20 px-4' : 'pt-24 px-8'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={`text-center mb-6 ${isMobile ? 'mb-4' : 'mb-8'}`}>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Transaction Visualizer
            </h1>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Visualize and analyze Monad wallet transactions in real-time
            </p>
            
            {/* Controls */}
            <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row justify-center space-x-6'} mb-6`}>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
                <Label htmlFor="dark-mode" className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  Dark Mode
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="lore-mode"
                  checked={isLoreMode}
                  onCheckedChange={setIsLoreMode}
                />
                <Label htmlFor="lore-mode" className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  Lore Mode
                </Label>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <SearchBar onAddressSelect={setSelectedAddress} />
          </div>

          {/* Main Content */}
          {selectedAddress && (
            <div className={`space-y-6 ${isMobile ? 'space-y-4' : 'space-y-8'}`}>
              {/* Wallet Stats */}
              <WalletScoreCard address={selectedAddress} />

              {/* Analysis Results */}
              {walletData && (
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
                  <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-2'}`}>
                    <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                      <CardHeader className={`${isMobile ? 'p-4' : 'p-6'}`}>
                        <div className="flex items-center justify-between">
                          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {isLoreMode ? "Mind Ball Visualization" : "Transaction Visualization"}
                          </CardTitle>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {walletData?.result?.data?.length || 0} transactions
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className={`${isMobile ? 'p-2' : 'p-6'} pt-0`}>
                        <TransactionTimeline 
                          data={walletData} 
                          isDarkMode={isDarkMode}
                          isLoreMode={isLoreMode}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-1'}`}>
                    <AnalysisResults data={walletData} />
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!selectedAddress && (
            <div className="text-center py-12">
              <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                <p className={`${isMobile ? 'text-base' : 'text-lg'} mb-2`}>Enter a wallet address to start analyzing</p>
                <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>Visualize transaction patterns and behavior</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TxVisualizer;
