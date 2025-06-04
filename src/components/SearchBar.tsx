
import { useState } from "react";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  onWalletSelect: (address: string) => void;
}

const SearchBar = ({ onWalletSelect }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Mock search results for demonstration
  const mockWallets = [
    "0x742d35Cc6634C0532925a3b8D48C405BeF8b30Ab",
    "0x1234567890abcdef1234567890abcdef12345678",
    "0xabcdef1234567890abcdef1234567890abcdef12",
    "0x9876543210fedcba9876543210fedcba98765432",
    "0x555666777888999aaabbbcccdddeeefff0001112"
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a wallet address to search",
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (searchQuery.length >= 10) {
        // Filter mock wallets that contain the search query
        const filtered = mockWallets.filter(wallet => 
          wallet.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 500);
  };

  const handleWalletClick = (address: string) => {
    onWalletSelect(address);
    setSearchQuery("");
    setSearchResults([]);
    toast({
      title: "Portfolio Loaded",
      description: `Viewing portfolio for ${address.slice(0, 6)}...${address.slice(-4)}`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search wallet address (0x...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400 focus:border-purple-500"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="absolute top-full mt-2 w-full bg-slate-800/95 border-slate-700 backdrop-blur-sm z-50">
          <CardContent className="p-4">
            <h3 className="text-white font-medium mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Found Portfolios
            </h3>
            <div className="space-y-2">
              {searchResults.map((address) => (
                <div
                  key={address}
                  onClick={() => handleWalletClick(address)}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </p>
                      <p className="text-gray-400 text-sm">Monad Testnet User</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-sm">Active</p>
                    <p className="text-gray-400 text-xs">Click to view</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchQuery.length >= 10 && searchResults.length === 0 && !isSearching && (
        <Card className="absolute top-full mt-2 w-full bg-slate-800/95 border-slate-700 backdrop-blur-sm z-50">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400">No portfolios found for this address</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
