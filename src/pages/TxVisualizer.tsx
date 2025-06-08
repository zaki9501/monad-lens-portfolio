import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Copy, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useClipboard } from "@/hooks/use-clipboard";
import TransactionHistory from "@/components/TransactionHistory";
import TokenMovementGraph from "@/components/TokenMovementGraph";

const TxVisualizer = () => {
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const { toast } = useToast();
  const { isCopied, copyToClipboard } = useClipboard();

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setAddress(storedAddress);
      setSelectedAddress(storedAddress);
    }
  }, []);

  const handleSearch = () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please enter a wallet address.",
        variant: "destructive",
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      toast({
        title: "Error",
        description: "Please enter a valid Ethereum wallet address.",
        variant: "destructive",
      });
      return;
    }

    setSelectedAddress(address);
    localStorage.setItem("walletAddress", address);
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto bg-slate-900/70 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Transaction Visualizer</CardTitle>
          <CardDescription className="text-slate-400">
            Enter a wallet address to visualize its transaction history and token movements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter wallet address (0x...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <Button onClick={handleSearch} className="bg-blue-500 text-white hover:bg-blue-600">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            {selectedAddress && (
              <Button
                variant="secondary"
                onClick={() => {
                  copyToClipboard(selectedAddress);
                  toast({
                    title: "Copied!",
                    description: "Wallet address copied to clipboard.",
                  });
                }}
                className="ml-2"
                disabled={isCopied}
              >
                {isCopied ? <AlertTriangle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {isCopied ? "Copied" : "Copy Address"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedAddress && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Wallet Address: {selectedAddress}</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <TransactionHistory walletAddress={selectedAddress} />
            <TokenMovementGraph walletAddress={selectedAddress} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TxVisualizer;
