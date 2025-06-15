
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Wallet, ArrowRight, Clock, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddressLookupProps {
  selectedAddress: string | null;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  gasUsed: string;
  status: 'success' | 'failed';
  method: string;
}

const AddressLookup: React.FC<AddressLookupProps> = ({ selectedAddress }) => {
  const [searchInput, setSearchInput] = useState('');
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addressStats, setAddressStats] = useState({
    balance: '0 ETH',
    totalTxs: 0,
    totalSent: '0 ETH',
    totalReceived: '0 ETH'
  });

  useEffect(() => {
    if (selectedAddress) {
      setCurrentAddress(selectedAddress);
      setSearchInput(selectedAddress);
      fetchAddressData(selectedAddress);
    }
  }, [selectedAddress]);

  const fetchAddressData = async (address: string) => {
    setIsLoading(true);
    
    // Mock data for demonstration
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        {
          hash: '0x1234567890abcdef',
          from: address,
          to: '0x9876543210fedcba',
          value: '1.5',
          timestamp: Date.now() - 3600000,
          gasUsed: '21000',
          status: 'success',
          method: 'transfer'
        },
        {
          hash: '0x2345678901bcdef0',
          from: '0x8765432109edcbaf',
          to: address,
          value: '0.75',
          timestamp: Date.now() - 7200000,
          gasUsed: '21000',
          status: 'success',
          method: 'transfer'
        },
        {
          hash: '0x3456789012cdef01',
          from: address,
          to: '0x7654321098dcbafe',
          value: '2.25',
          timestamp: Date.now() - 10800000,
          gasUsed: '45000',
          status: 'failed',
          method: 'swap'
        }
      ];
      
      setTransactions(mockTransactions);
      setAddressStats({
        balance: '15.75 ETH',
        totalTxs: mockTransactions.length,
        totalSent: '3.75 ETH',
        totalReceived: '0.75 ETH'
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      setCurrentAddress(searchInput.trim());
      fetchAddressData(searchInput.trim());
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-blue-400" />
            Address Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Ethereum address (0x...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-gray-900/50 border-gray-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentAddress && (
        <>
          {/* Address Stats */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="h-5 w-5 text-green-400" />
                Address Overview
                <Badge variant="outline" className="border-blue-400 text-blue-400 font-mono">
                  {formatAddress(currentAddress)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-400">{addressStats.balance}</div>
                  <div className="text-sm text-gray-400">Balance</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-400">{addressStats.totalTxs}</div>
                  <div className="text-sm text-gray-400">Total TXs</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-red-400">{addressStats.totalSent}</div>
                  <div className="text-sm text-gray-400">Total Sent</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                  <div className="text-xl font-bold text-purple-400">{addressStats.totalReceived}</div>
                  <div className="text-sm text-gray-400">Total Received</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="h-5 w-5 text-purple-400" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] px-6">
                <div className="space-y-3 pb-4">
                  {isLoading ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p>Loading transactions...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No transactions found</p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.hash}
                        className="p-4 rounded-lg bg-gray-900/50 border border-gray-600 hover:border-gray-500 transition-colors"
                      >
                        <div className="space-y-3">
                          {/* Transaction Hash & Status */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm text-gray-400">{formatAddress(tx.hash)}</span>
                            <Badge 
                              variant={tx.status === 'success' ? 'default' : 'destructive'}
                              className={tx.status === 'success' ? 'bg-green-600' : 'bg-red-600'}
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          
                          {/* From -> To */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`font-mono ${tx.from === currentAddress ? 'text-red-400' : 'text-blue-400'}`}>
                              {formatAddress(tx.from)}
                            </span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <span className={`font-mono ${tx.to === currentAddress ? 'text-green-400' : 'text-blue-400'}`}>
                              {formatAddress(tx.to)}
                            </span>
                          </div>
                          
                          {/* Details */}
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline" className="border-purple-400 text-purple-400">
                              {tx.value} ETH
                            </Badge>
                            <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                              <Zap className="h-3 w-3 mr-1" />
                              {tx.gasUsed} gas
                            </Badge>
                            <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                              {tx.method}
                            </Badge>
                            <Badge variant="outline" className="border-gray-400 text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(tx.timestamp)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AddressLookup;
