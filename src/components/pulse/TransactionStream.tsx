
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Fuel, Hash, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input?: string;
}

interface TransactionStreamProps {
  currentBlock: any;
}

const TransactionStream: React.FC<TransactionStreamProps> = ({ currentBlock }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (currentBlock?.transactions) {
      const newTxs = currentBlock.transactions.slice(0, 10); // Show latest 10 transactions
      setTransactions(newTxs);
    }
  }, [currentBlock]);

  const formatValue = (value: string) => {
    const wei = parseInt(value, 16);
    const eth = wei / 1e18;
    return eth > 0.001 ? `${eth.toFixed(4)} ETH` : `${wei.toLocaleString()} wei`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getMethodName = (input: string) => {
    if (!input || input === '0x') return 'Transfer';
    
    // Common method signatures
    const methods: { [key: string]: string } = {
      '0xa9059cbb': 'transfer',
      '0x23b872dd': 'transferFrom', 
      '0x095ea7b3': 'approve',
      '0x18160ddd': 'totalSupply',
      '0x70a08231': 'balanceOf'
    };
    
    const methodSig = input.slice(0, 10);
    return methods[methodSig] || 'Contract Call';
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="h-5 w-5 text-yellow-400" />
          Transaction Stream
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] px-6">
          <div className="space-y-3 pb-4">
            {transactions.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Waiting for transactions...</p>
              </div>
            ) : (
              transactions.map((tx, index) => (
                <div
                  key={tx.hash + index}
                  className="p-3 rounded-lg bg-gray-900/50 border border-gray-600 hover:border-gray-500 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="space-y-2">
                    {/* Transaction Hash */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Hash className="h-3 w-3" />
                      {formatAddress(tx.hash)}
                    </div>
                    
                    {/* From -> To */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-400 font-mono">
                        {formatAddress(tx.from)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="text-green-400 font-mono">
                        {formatAddress(tx.to)}
                      </span>
                    </div>
                    
                    {/* Value & Gas */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs">
                        {formatValue(tx.value)}
                      </Badge>
                      
                      <Badge variant="outline" className="border-orange-400 text-orange-400 text-xs">
                        <Fuel className="h-3 w-3 mr-1" />
                        {parseInt(tx.gas, 16).toLocaleString()}
                      </Badge>
                      
                      <Badge variant="outline" className="border-cyan-400 text-cyan-400 text-xs">
                        {getMethodName(tx.input)}
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
  );
};

export default TransactionStream;
