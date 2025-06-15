import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe, Zap, Activity, TrendingUp, Users, Hash, ArrowRight, Fuel, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Globe3D from "@/components/Globe3D";
import StatsWaveChart from "@/components/pulse/StatsWaveChart";
import RadarOverlay from "@/components/RadarOverlay";
import RadarBlockDetailPanel from "@/components/RadarBlockDetailPanel";
import { useToast } from "@/hooks/use-toast";

// Mock data fetching function (replace with actual Monad API)
const fetchLatestBlock = async () => {
  const response = await fetch('https://testnet-rpc.monad.xyz/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['latest', true],
      id: 1
    })
  });
  
  if (!response.ok) throw new Error('Failed to fetch block');
  const data = await response.json();
  return data.result;
};

const BlockVisualizer = () => {
  const [currentBlock, setCurrentBlock] = useState<any>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [recentBlocks, setRecentBlocks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [liveGlobeTransactions, setLiveGlobeTransactions] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [selectedRadarBlock, setSelectedRadarBlock] = useState<any>(null);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionResult, setTransactionResult] = useState<any | null>(null);
  const [isSearchingTx, setIsSearchingTx] = useState(false);
  const [txSearchError, setTxSearchError] = useState('');
  const { toast } = useToast();
  const [contractSearch, setContractSearch] = useState('');
  const [isSearchingContract, setIsSearchingContract] = useState(false);
  const [contractResult, setContractResult] = useState<any | null>(null);
  const [contractSearchError, setContractSearchError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const block = await fetchLatestBlock();
        setCurrentBlock(block);

        // Deduplicate and update recentBlocks based on hash (avoid repeated blocks)
        setRecentBlocks(prevBlocks => {
          // Prepend the latest block, then append unique from previous (excluding same hash)
          const allBlocks = [block, ...prevBlocks.filter(b => b.hash !== block.hash)];
          // Keep only the N most recent unique blocks
          return allBlocks.slice(0, 8); // set to show 8 recent blocks (adjust as you wish)
        });

        if (block?.transactions) {
          setTransactions(block.transactions);
          setLiveGlobeTransactions(prevTransactions => {
            const newTransactions = block.transactions || [];
            const uniqueNewTransactions = newTransactions.filter(
                (ntx: any) => !prevTransactions.some((ptx: any) => ptx.hash === ntx.hash)
            );
            const combinedTransactions = [...prevTransactions, ...uniqueNewTransactions];
            const maxGlobeRays = 50;
            return combinedTransactions.slice(-maxGlobeRays);
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch block data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Contract search logic
  const handleContractSearch = async () => {
    setContractResult(null);
    setContractSearchError('');
    const address = contractSearch.trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setContractSearchError("Please enter a valid contract address.");
      return;
    }
    setIsSearchingContract(true);
    try {
      const response = await fetch('https://testnet-rpc.monad.xyz/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [address, 'latest'],
          id: 2
        })
      });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      // data.result is contract code as hex. If '0x', not a contract.
      if (data?.result && data.result !== "0x" && data.result !== "0X") {
        setContractResult({
          address,
          code: data.result,
        });
      } else {
        setContractSearchError('Address is not a contract.');
      }
    } catch (err) {
      setContractSearchError('Failed to fetch contract.');
    } finally {
      setIsSearchingContract(false);
    }
  };

  const handleContractInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleContractSearch();
  };

  // Transaction search function
  const handleTxSearch = async () => {
    setTransactionResult(null);
    setTxSearchError('');
    if (!/^0x([A-Fa-f0-9]{64})$/.test(transactionSearch.trim())) {
      setTxSearchError('Please enter a valid transaction hash.');
      return;
    }
    setIsSearchingTx(true);
    try {
      const response = await fetch('https://testnet-rpc.monad.xyz/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [transactionSearch.trim()],
          id: 1
        })
      });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      if (data?.result) {
        setTransactionResult(data.result);
      } else {
        setTxSearchError('Transaction not found.');
        toast({ title: 'Not found', description: 'No transaction for this hash.' });
      }
    } catch (err) {
      setTxSearchError('Failed to fetch transaction.');
      toast({ title: 'Error', description: 'Could not search transaction.' });
    } finally {
      setIsSearchingTx(false);
    }
  };

  const handleTxInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleTxSearch();
  };

  const formatValue = (value: string) => {
    const wei = parseInt(value, 16);
    const eth = wei / 1e18;
    // Change label from "ETH" to "MON"
    return eth > 0.001 ? `${eth.toFixed(4)} MON` : `${wei.toLocaleString()} wei`;
  };

  const formatAddress = (address: string | null | undefined) => {
    if (!address || typeof address !== 'string') {
      return 'N/A';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleBlockClick = (block: any) => {
    setSelectedBlock(block);
  };

  // Add waveData for mini chart below radar details
  const [miniWaveData, setMiniWaveData] = useState<{ t: number; v: number }[]>([]);
  useEffect(() => {
    // mimic wave changes for RadarBlockMiniChart
    const interval = setInterval(() => {
      setMiniWaveData((old) => [
        ...old.slice(-29),
        { t: Date.now(), v: 10 + Math.floor(Math.random() * 25 + 5 * Math.sin(Math.random() * 3.1)) },
      ]);
    }, 270);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      {/* Header */}
      <div className="border-b border-green-900/50 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-green-400">MONAD PULSE</h1>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>REAL-TIME</span>
            </div>
          </div>
          {/* Search bar for transaction hash and contract */}
          <div className="flex items-center gap-2 ml-auto">
            {/* TX Search */}
            <Input
              className="w-[220px] text-xs font-mono border-green-900/60 bg-gray-800/80"
              placeholder="Search TX hash…"
              value={transactionSearch}
              onChange={e => { setTransactionSearch(e.target.value); setTxSearchError(''); }}
              onKeyDown={handleTxInputKeyDown}
              disabled={isSearchingTx}
            />
            <Button
              size="sm"
              className="bg-gradient-to-r from-green-700 to-cyan-600 text-white h-8 px-3"
              onClick={handleTxSearch}
              disabled={isSearchingTx}
            >
              <Search className="w-4 h-4 mr-1" />
              {isSearchingTx ? "Searching..." : "Search"}
            </Button>
            {/* Contract Search */}
            <Input
              className="w-[190px] text-xs font-mono border-cyan-900/60 bg-gray-800/80"
              placeholder="Search contract address…"
              value={contractSearch}
              onChange={e => { setContractSearch(e.target.value); setContractSearchError(''); }}
              onKeyDown={handleContractInputKeyDown}
              disabled={isSearchingContract}
            />
            <Button
              size="sm"
              className="bg-gradient-to-r from-cyan-700 to-blue-600 text-white h-8 px-3"
              onClick={handleContractSearch}
              disabled={isSearchingContract}
            >
              <Search className="w-4 h-4 mr-1" />
              {isSearchingContract ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
        {/* Error messages */}
        {(txSearchError || contractSearchError) && (
          <div className="text-xs text-red-500 mt-2 flex flex-row gap-4">
            {txSearchError && <span>{txSearchError}</span>}
            {contractSearchError && <span>{contractSearchError}</span>}
          </div>
        )}
      </div>

      {/* Show transaction result card if present */}
      {transactionResult && (
        <div className="w-full flex justify-end mb-4 pr-2 animate-fade-in-up">
          <Card className="border-cyan-400 bg-black/95 p-6 max-w-2xl w-full rounded-xl shadow-2xl relative min-w-[420px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTransactionResult(null)}
              className="absolute right-3 top-3 text-cyan-400/70 hover:text-cyan-300 p-2 h-auto"
            >
              <XCircle className="h-5 w-5" />
            </Button>
            <div className="text-green-400 text-base font-mono space-y-2 pr-10">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-green-500 font-bold text-lg">Transaction Details</span>
                <span className="bg-cyan-800/70 border border-cyan-500 rounded-md px-3 py-1 font-mono text-cyan-200 text-xs select-all break-all" title={transactionResult.hash}>
                  Hash: {transactionResult.hash}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <span className="text-green-600">From:</span>
                  <span className="ml-2 text-cyan-300 select-all break-all" title={transactionResult.from}>
                    {transactionResult.from}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">To:</span>
                  <span className="ml-2 text-cyan-300 select-all break-all" title={transactionResult.to}>
                    {transactionResult.to || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Value:</span>
                  <span className="ml-2 text-green-300">
                    {formatValue(transactionResult.value)}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Gas:</span>
                  <span className="ml-2">{parseInt(transactionResult.gas, 16).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-green-600">Gas Price:</span>
                  <span className="ml-2">{transactionResult.gasPrice ? parseInt(transactionResult.gasPrice, 16).toLocaleString() + " wei" : "N/A"}</span>
                </div>
                <div>
                  <span className="text-green-600">Nonce:</span>
                  <span className="ml-2">{parseInt(transactionResult.nonce, 16)}</span>
                </div>
                <div>
                  <span className="text-green-600">Block:</span>
                  <span className="ml-2">{transactionResult.blockNumber ? parseInt(transactionResult.blockNumber, 16).toLocaleString() : 'Pending'}</span>
                </div>
                <div>
                  <span className="text-green-600">Index in Block:</span>
                  <span className="ml-2">{transactionResult.transactionIndex ? parseInt(transactionResult.transactionIndex, 16) : "N/A"}</span>
                </div>
                <div className="col-span-1 md:col-span-2 break-all">
                  <span className="text-green-600">Type:</span>
                  <span className="ml-2">{transactionResult.type ?? 'N/A'}</span>
                </div>
                <div className="col-span-1 md:col-span-2 break-all">
                  <span className="text-green-600">Input:</span>
                  <span className="ml-2 text-gray-300 select-all" title={transactionResult.input}>
                    {transactionResult.input && transactionResult.input !== "0x"
                      ? (
                        transactionResult.input.length > 80
                          ? transactionResult.input.slice(0, 80) + "..."
                          : transactionResult.input
                        )
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Show contract result card if present */}
      {contractResult && (
        <div className="w-full flex justify-end mb-4 pr-2 animate-fade-in-up">
          <Card className="border-blue-400 bg-black/95 p-6 max-w-2xl w-full rounded-xl shadow-2xl relative min-w-[420px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setContractResult(null)}
              className="absolute right-3 top-3 text-blue-400/70 hover:text-cyan-300 p-2 h-auto"
            >
              {/* XCircle from lucide-react */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </Button>
            <div className="text-blue-300 text-base font-mono space-y-2 pr-10">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-blue-400 font-bold text-lg">Contract Details</span>
                <span className="bg-blue-800/70 border border-blue-500 rounded-md px-3 py-1 font-mono text-blue-200 text-xs select-all break-all" title={contractResult.address}>
                  Address: {contractResult.address}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <span className="text-blue-700">Code Size:</span>
                  <span className="ml-2">{(contractResult.code.length / 2 - 1).toLocaleString()} bytes</span>
                </div>
                <div>
                  <span className="text-blue-700">Is Proxy:</span>
                  <span className="ml-2">N/A</span>
                </div>
                <div className="col-span-1 md:col-span-2 break-all">
                  <span className="text-blue-700">Code Preview:</span>
                  <pre className="block p-2 bg-gray-800 text-blue-200 rounded break-words max-h-32 overflow-auto mt-1 text-xs select-all">
                    {contractResult.code.length > 120
                      ? contractResult.code.slice(0, 120) + "..."
                      : contractResult.code}
                  </pre>
                </div>
                <div className="col-span-1 md:col-span-2 break-all">
                  <span className="text-blue-700">Full Code:</span>
                  <span className="ml-2 text-gray-400 select-all" title={contractResult.code.length > 1000 ? undefined : contractResult.code}>
                    {contractResult.code.length > 1000
                      ? `${contractResult.code.slice(0, 100)}... (${contractResult.code.length} chars)`
                      : contractResult.code}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* The rest of the page */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">

        {/* Left Panel */}
        <div className="col-span-3 space-y-4">
          {/* Network Stats */}
          <Card className="bg-gray-900/30 border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">NETWORK OVERVIEW</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {currentBlock ? parseInt(currentBlock.number, 16).toLocaleString() : '---'}
                  </div>
                  <div className="text-xs text-green-600">Block Height</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {currentBlock?.transactions?.length || 0}
                  </div>
                  <div className="text-xs text-cyan-600">Transactions</div>
                </div>
              </div>
              
              <div className="border-t border-green-900/50 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-green-600">Gas Used</span>
                  <span className="text-xs text-green-400">
                    {currentBlock ? `${((parseInt(currentBlock.gasUsed, 16) / parseInt(currentBlock.gasLimit, 16)) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-600 to-cyan-400 h-2 rounded-full"
                    style={{ 
                      width: currentBlock ? `${((parseInt(currentBlock.gasUsed, 16) / parseInt(currentBlock.gasLimit, 16)) * 100)}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Blocks */}
          <Card className="bg-gray-900/30 border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">RECENT BLOCKS</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {recentBlocks.map((block, index) => (
                    <div key={block.hash} className="flex items-center justify-between p-2 bg-gray-800/30 rounded border border-green-900/30">
                      <div>
                        <div className="text-sm font-bold text-green-400">
                          #{parseInt(block.number, 16).toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">
                          {block.transactions?.length || 0} txs
                        </div>
                      </div>
                      <div className="text-xs text-cyan-400">
                        {new Date(parseInt(block.timestamp, 16) * 1000).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {/* Wave chart below blocks */}
              <div className="mt-3">
                <StatsWaveChart recentBlocks={recentBlocks} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center - 3D Globe Visualization & Details */}
        <div className="col-span-6 relative">
          <Card className="bg-gray-900/30 border-green-900/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                MONAD NETWORK PULSE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)] relative">
              {/* --- GLOBE VISUALIZATION --- */}
              <div className="flex items-center justify-center w-full relative" style={{ minHeight: 400 }}>
                <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                  <Globe3D blocks={recentBlocks} onBlockClick={handleBlockClick} />
                </div>
              </div>
              {/* Overlay info */}
              <div className="absolute top-4 left-4 text-xs space-y-1">
                <div className="text-green-400">Active Validators: <span className="text-cyan-400">99</span></div>
                <div className="text-green-400">Connections: <span className="text-cyan-400">12</span></div>
                <div className="text-green-400">TPS: <span className="text-cyan-400">301</span></div>
              </div>
              
              <div className="absolute top-4 right-4 text-xs space-y-1">
                <div className="text-green-400">Latency: <span className="text-cyan-400">12ms</span></div>
                <div className="text-green-400">Health: <span className="text-green-400">98.7%</span></div>
                <div className="text-green-400">Block Time: <span className="text-cyan-400">~2.5s</span></div>
              </div>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-lg font-bold text-green-400">REAL-TIME MONITORING</div>
                <div className="text-sm text-green-600">
                  {transactions.length} active transactions
                </div>
              </div>

              {/* Selected Block Details Overlay within Globe Card */}
              {selectedBlock && (
                <div className="absolute bottom-4 left-4 bg-gray-900/70 border border-green-900/50 rounded-lg p-4 w-64 animate-fade-in-up shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-green-400">BLOCK DETAILS</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBlock(null)}
                      className="text-green-600 hover:text-green-400 p-0 h-auto"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-green-600">Number:</span>
                      <span className="text-green-400">{parseInt(selectedBlock.number, 16).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Hash:</span>
                      <span className="text-green-400">{formatAddress(selectedBlock.hash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Time:</span>
                      <span className="text-green-400">{new Date(parseInt(selectedBlock.timestamp, 16) * 1000).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">TXs:</span>
                      <span className="text-green-400">{selectedBlock.transactions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Gas Used:</span>
                      <span className="text-green-400">{parseInt(selectedBlock.gasUsed, 16).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Miner:</span>
                      <span className="text-green-400">{formatAddress(selectedBlock.miner)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="col-span-3 space-y-4">
          {/* Transaction Stream */}
          <Card className="bg-gray-900/30 border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">LIVE TRANSACTIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx.hash + index}
                      className="p-2 bg-gray-800/30 rounded border border-green-900/30 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <Hash className="h-3 w-3 text-green-600" />
                        <span className="text-green-400">{formatAddress(tx.hash)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span className="text-cyan-400">{formatAddress(tx.from)}</span>
                        <ArrowRight className="h-3 w-3 text-green-600" />
                        <span className="text-green-400">{formatAddress(tx.to)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                          {formatValue(tx.value)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Fuel className="h-3 w-3" />
                          {parseInt(tx.gas, 16).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Performance Card */}
          <Card className="bg-gray-900/30 border-green-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm">PERFORMANCE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">Block Time</span>
                <span className="text-sm text-green-400">~2.5s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">TPS</span>
                <span className="text-sm text-cyan-400">~301</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">Active Validators</span>
                <span className="text-sm text-green-400">142</span>
              </div>
              
              <div className="border-t border-green-900/50 pt-3">
                <div className="text-xs text-green-600 mb-2">Network Health</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-6 bg-green-600 rounded animate-pulse"></div>
                  <div className="h-6 bg-green-500 rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <div className="h-6 bg-cyan-400 rounded animate-pulse" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ------ RADAR & NETWORK DATA SECTION BELOW THE GRID ------ */}
      <section className="w-full flex flex-col items-center mt-16 mb-24">
        <h2 className="text-2xl font-bold text-green-400 mb-4 mt-2 text-center tracking-widest uppercase drop-shadow-lg">
          MONAD BLOCK RADAR & FREQUENCY ANALYZER
        </h2>
        <p className="text-green-600 text-center mb-6 max-w-lg">
          Live block propagation visualized as sci-fi radar. New blocks are shown as ships slowly approaching the center; click a ship to view block details and frequency chart.
        </p>
        <div className="flex flex-row w-full max-w-5xl justify-center">
          <RadarOverlay
            recentBlocks={recentBlocks}
            onSelectBlock={setSelectedRadarBlock}
            selectedBlockHash={selectedRadarBlock?.hash || null}
          />
          {/* Pass transactions to panel */}
          {selectedRadarBlock && (
            <div className="-ml-2">
              <RadarBlockDetailPanel
                block={selectedRadarBlock}
                waveData={miniWaveData}
                onClose={() => setSelectedRadarBlock(null)}
                transactions={transactions}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlockVisualizer;
