import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe, Zap, Activity, Users, Hash, ArrowRight, Fuel, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Globe3D from "@/components/Globe3D";
import StatsWaveChart from "@/components/pulse/StatsWaveChart";
import { useToast } from "@/hooks/use-toast";
import LiveContractDeployments from "@/components/pulse/LiveContractDeployments";
import { useValidatorStream } from '@/hooks/useValidatorStream';
import WorldMap from "@/components/WorldMap";
import NeuralNetworkPattern from "@/components/pulse/NeuralNetworkPattern";

const BLOCKVISION_API_KEY = import.meta.env.VITE_BLOCKVISION_API_KEY as string;

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

// Add utility to fetch contract creation details from Blockvision
async function fetchContractDeploymentInfo(address: string) {
  // Docs: https://docs.blockvision.org/docs/api-monad-account-activities
  const url = `https://api.blockvision.org/v2/monad/account/activities?address=${address}&limit=50`;
  const res = await fetch(url, {
    headers: {
      "accept": "application/json",
      "x-api-key": BLOCKVISION_API_KEY,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch contract activities");
  const { data } = await res.json();
  // Find the creation txn (first incoming tx with "create" type)
  const creation = data?.find((d: any) => d.category === "create");
  // Fallback to the earliest txn
  const firstSeen = data ? data[data.length - 1] : null;
  const lastSeen = data && data.length > 0 ? data[0] : null;

  return {
    creationTransactionHash: creation?.hash || firstSeen?.hash || null,
    creator: creation?.from || null,
    creationTime: creation?.time || firstSeen?.time || null,
    numTxs: data?.length || 0,
    firstSeen: firstSeen?.time || null,
    lastSeen: lastSeen?.time || null,
  };
}

function formatDateTime(ts: string | number | null | undefined) {
  if (!ts) return "N/A";
  // Accept seconds or ms. Blockvision sends both sometimes
  const date =
    typeof ts === "number"
      ? new Date(ts * (ts < 1e12 ? 1000 : 1))
      : new Date(parseInt(ts) * (ts.length < 13 ? 1000 : 1));
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
function timeAgo(ts: string | number | null | undefined) {
  if (!ts) return "N/A";
  const now = Date.now();
  const time =
    typeof ts === "number"
      ? ts * (ts < 1e12 ? 1000 : 1)
      : parseInt(ts) * (ts.length < 13 ? 1000 : 1);
  const diff = now - time;
  if (diff < 0) return "N/A";
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days} d ${hrs} hrs ago`;
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return `${hrs} hrs ${mins} min ago`;
  const secs = Math.floor((diff % 60000) / 1000);
  if (mins > 0) return `${mins} min ago`;
  return `${secs} secs ago`;
}

const BlockVisualizer = () => {
  const [currentBlock, setCurrentBlock] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [recentBlocks, setRecentBlocks] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [liveGlobeTransactions, setLiveGlobeTransactions] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchType, setSearchType] = useState<"tx" | "contract" | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const { toast } = useToast();

  // New state for live contract deployments
  const [liveDeployments, setLiveDeployments] = useState<any[]>([]);
  const [deploymentsLoading, setDeploymentsLoading] = useState(false);
  const { validators, activeValidators, averageSuccessRate, isConnected, error } = useValidatorStream();

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

  // Unified search for tx hash or contract address
  const handleSearch = async () => {
    setSearchResult(null);
    setSearchType(null);
    setSearchError('');
    const text = searchValue.trim();

    const isHash = /^0x([A-Fa-f0-9]{64})$/.test(text);
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(text);

    if (!isHash && !isAddress) {
      setSearchError('Enter a valid tx hash or contract address.');
      return;
    }

    setIsSearching(true);

    let triedTx = false;
    if (isHash) {
      try {
        const txRes = await fetch('https://testnet-rpc.monad.xyz/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [text],
            id: 1
          })
        });
        if (!txRes.ok) throw new Error('tx not found');
        const txData = await txRes.json();
        if (txData?.result) {
          setSearchResult(txData.result);
          setSearchType("tx");
          setIsSearching(false);
          return;
        }
        triedTx = true;
      } catch (err) {
        triedTx = true;
      }
    }

    // Contract search
    try {
      const addr = isAddress ? text : null;
      const possibleAddr = addr || (isHash ? text.slice(0, 42) : null);
      if (possibleAddr) {
        // Fetch contract code
        const codeRes = await fetch('https://testnet-rpc.monad.xyz/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [possibleAddr, 'latest'],
            id: 2
          })
        });
        if (!codeRes.ok) throw new Error('Network error');
        const codeData = await codeRes.json();
        if (codeData?.result && codeData.result !== "0x" && codeData.result !== "0X") {
          // Fetch new details from Blockvision:
          let info = null;
          try {
            info = await fetchContractDeploymentInfo(possibleAddr);
          } catch {}
          setSearchResult({
            address: possibleAddr,
            code: codeData.result,
            ...info,
          });
          setSearchType("contract");
          setIsSearching(false);
          return;
        } else {
          // No code, not a contract
          setSearchError(triedTx ? 'No transaction or contract found for input.' : 'Not a contract.');
        }
      } else {
        setSearchError('No transaction or contract found.');
      }
    } catch (err) {
      setSearchError('Failed to search contract.');
    }
    setIsSearching(false);
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
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

  // New effect: For each new currentBlock, fetch receipts and detect contract deployments
  useEffect(() => {
    let cancelled = false;
    async function fetchAndDetectContracts(block: any) {
      if (!block || !block.transactions || block.transactions.length === 0) {
        setLiveDeployments([]);
        return;
      }
      setDeploymentsLoading(true);

      // Fetch receipts for all txs in the latest block in parallel
      const txs = Array.isArray(block.transactions) ? block.transactions : [];
      try {
        const results = await Promise.all(
          txs.map(async (tx: any) => {
            try {
              const receiptRes = await fetch('https://testnet-rpc.monad.xyz/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_getTransactionReceipt',
                  params: [tx.hash],
                  id: 2,
                }),
              });
              if (!receiptRes.ok) return null;
              const receiptData = await receiptRes.json();
              const contractAddress = receiptData?.result?.contractAddress;
              if (contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000") {
                return {
                  contractAddress,
                  creator: tx.from,
                  txHash: tx.hash,
                  blockNumber: tx.blockNumber,
                  timestamp: parseInt(block.timestamp, 16),
                };
              }
              return null;
            } catch (err) {
              return null;
            }
          })
        );
        if (!cancelled) {
          setLiveDeployments(results.filter(Boolean));
        }
      } finally {
        setDeploymentsLoading(false);
      }
    }

    if (currentBlock) {
      fetchAndDetectContracts(currentBlock);
    }
    return () => { cancelled = true; };
  }, [currentBlock]);

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono overflow-hidden">
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
          {/* ONE unified search bar for TX hash & contract address */}
          <div className="flex items-center gap-2 ml-auto">
            <Input
              className="w-[320px] text-xs font-mono border-green-900/60 bg-gray-800/80"
              placeholder="Search TX hash or contract address…"
              value={searchValue}
              onChange={e => { setSearchValue(e.target.value); setSearchError(''); }}
              onKeyDown={handleSearchInputKeyDown}
              disabled={isSearching}
            />
            <Button
              size="sm"
              className="bg-gradient-to-r from-green-700 to-cyan-600 text-white h-8 px-3"
              onClick={handleSearch}
              disabled={isSearching}
            >
              <Search className="w-4 h-4 mr-1" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
        {/* Error messages */}
        {!!searchError && (
          <div className="text-xs text-red-500 mt-2 flex flex-row gap-4">
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Show result card if present (tx or contract) */}
      {searchType === "tx" && searchResult && (
        <div className="w-full flex justify-end mb-4 pr-2 animate-fade-in-up">
          <Card className="border-cyan-400 bg-black/95 p-7 max-w-3xl w-full rounded-xl shadow-2xl relative min-w-[520px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchResult(null)}
              className="absolute right-3 top-3 text-cyan-400/70 hover:text-cyan-300 p-2 h-auto"
            >
              <XCircle className="h-5 w-5" />
            </Button>
            <div className="text-green-400 text-base font-mono space-y-3 pr-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-green-500 font-bold text-xl">Transaction Details</span>
                <span className="bg-cyan-800/70 border border-cyan-500 rounded-md px-3 py-1 font-mono text-cyan-200 text-base select-all break-all" title={searchResult.hash}>
                  Hash: {searchResult.hash}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-base">
                <div>
                  <span className="text-green-600">From:</span>
                  <span className="ml-2 text-cyan-400 select-all break-all" title={searchResult.from}>
                    {searchResult.from}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">To:</span>
                  <span className="ml-2 text-cyan-400 select-all break-all" title={searchResult.to}>
                    {searchResult.to || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Value:</span>
                  <span className="ml-2 text-green-300">
                    {formatValue(searchResult.value)}
                  </span>
                </div>
                <div>
                  <span className="text-green-600">Gas:</span>
                  <span className="ml-2">{parseInt(searchResult.gas, 16).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-green-600">Gas Price:</span>
                  <span className="ml-2">{searchResult.gasPrice ? parseInt(searchResult.gasPrice, 16).toLocaleString() + " wei" : "N/A"}</span>
                </div>
                <div>
                  <span className="text-green-600">Nonce:</span>
                  <span className="ml-2">{parseInt(searchResult.nonce, 16)}</span>
                </div>
                <div>
                  <span className="text-green-600">Block:</span>
                  <span className="ml-2">{searchResult.blockNumber ? parseInt(searchResult.blockNumber, 16).toLocaleString() : 'Pending'}</span>
                </div>
                <div>
                  <span className="text-green-600">Index in Block:</span>
                  <span className="ml-2">{searchResult.transactionIndex ? parseInt(searchResult.transactionIndex, 16) : "N/A"}</span>
                </div>
                <div>
                  <span className="text-green-600">Type:</span>
                  <span className="ml-2">{searchResult.type ?? 'N/A'}</span>
                </div>
              </div>
              <div className="break-all text-green-600 mt-2">
                <span>Input:</span>
                <span className="ml-2 text-gray-300 select-all" title={searchResult.input}>
                  {searchResult.input && searchResult.input !== "0x"
                    ? (
                      searchResult.input.length > 150
                        ? searchResult.input.slice(0, 150) + "..."
                        : searchResult.input
                      )
                    : "—"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
      {searchType === "contract" && searchResult && (
        <div className="w-full flex justify-end mb-4 pr-2 animate-fade-in-up">
          <Card className="border-blue-400 bg-black/95 p-7 max-w-3xl w-full rounded-xl shadow-2xl relative min-w-[520px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchResult(null)}
              className="absolute right-3 top-3 text-blue-400/70 hover:text-cyan-300 p-2 h-auto"
            >
              <XCircle className="h-5 w-5" />
            </Button>
            <div className="text-blue-300 text-base font-mono space-y-4 pr-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-blue-400 font-bold text-xl">Contract Details</span>
                <span className="bg-blue-800/70 border border-blue-500 rounded-md px-3 py-1 font-mono text-blue-200 text-base select-all break-all" title={searchResult.address}>
                  Address: {searchResult.address}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 text-base">
                <div>
                  <span className="text-blue-700">Code Size:</span>
                  <span className="ml-2">{(searchResult.code.length / 2 - 1).toLocaleString()} bytes</span>
                </div>
                <div>
                  <span className="text-blue-700">Is Proxy:</span>
                  <span className="ml-2">N/A</span>
                </div>
                <div>
                  <span className="text-blue-700">Contract Creator:</span>
                  <span className="ml-2 text-blue-300 select-all" title={searchResult.creator}>
                    {searchResult.creator
                      ? `${searchResult.creator.slice(0, 7)}...${searchResult.creator.slice(-4)}`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Creation Txn:</span>
                  <span className="ml-2 text-blue-300 select-all" title={searchResult.creationTransactionHash}>
                    {searchResult.creationTransactionHash
                      ? `${searchResult.creationTransactionHash.slice(0, 7)}...${searchResult.creationTransactionHash.slice(-4)}`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Creation Time:</span>
                  <span className="ml-2 text-gray-200">{formatDateTime(searchResult.creationTime)}</span>
                </div>
                <div>
                  <span className="text-blue-700">First Seen:</span>
                  <span className="ml-2 text-gray-200">{timeAgo(searchResult.firstSeen)}</span>
                </div>
                <div>
                  <span className="text-blue-700">Last Seen:</span>
                  <span className="ml-2 text-gray-200">{timeAgo(searchResult.lastSeen)}</span>
                </div>
                <div>
                  <span className="text-blue-700">Transactions:</span>
                  <span className="ml-2 text-blue-200">{searchResult.numTxs?.toLocaleString() || "—"}</span>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 break-all">
                <span className="text-blue-700">Code Preview:</span>
                <pre className="block p-2 bg-gray-800 text-blue-200 rounded break-words max-h-44 overflow-auto mt-1 text-xs select-all">
                  {searchResult.code.length > 220
                    ? searchResult.code.slice(0, 220) + "..."
                    : searchResult.code}
                </pre>
              </div>
              <div className="col-span-1 md:col-span-2 break-all">
                <span className="text-blue-700">Full Code:</span>
                <span className="ml-2 text-gray-400 select-all" title={searchResult.code.length > 1000 ? undefined : searchResult.code}>
                  {searchResult.code.length > 1200
                    ? `${searchResult.code.slice(0, 150)}... (${searchResult.code.length} chars)`
                    : searchResult.code}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* The rest of the page */}
      <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-120px)] overflow-auto">

        {/* Left Panel */}
        <div className="col-span-3 space-y-4 h-full">
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

          {/* Neural Network Pattern - NEW */}
          <NeuralNetworkPattern 
            validators={validators}
            activeValidators={activeValidators}
            averageSuccessRate={averageSuccessRate}
          />
        </div>

        {/* Center - 3D Globe Visualization & World Map */}
        <div className="col-span-6 space-y-4 h-full">
          {/* 3D Globe Card */}
          <Card className="bg-gray-900/30 border-green-900/50 h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                MONAD NETWORK PULSE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              {/* --- GLOBE VISUALIZATION --- */}
              <div
                className="flex items-center justify-center w-full relative"
                style={{ height: 400, maxHeight: 400 }}
              >
                <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                  <Globe3D blocks={recentBlocks} onBlockClick={handleBlockClick} />
                </div>
              </div>
              {/* Overlay info */}
              <div className="absolute top-4 left-4 text-xs space-y-1">
                <div className="text-green-400">Active Validators: <span className="text-cyan-400">{activeValidators}</span></div>
                <div className="text-green-400">Connections: <span className="text-cyan-400">12</span></div>
                <div className="text-green-400">TPS: <span className="text-cyan-400">301</span></div>
              </div>
              
              <div className="absolute top-4 right-4 text-xs space-y-1">
                <div className="text-green-400">Latency: <span className="text-cyan-400">12ms</span></div>
                <div className="text-green-400">Health: <span className="text-green-400">{averageSuccessRate.toFixed(1)}%</span></div>
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

          {/* World Map Card - positioned below the globe with proper spacing */}
          <WorldMap />
        </div>

        {/* Right Panel */}
        <div className="col-span-3 space-y-4 h-full">
          {/* Block Details Card */}
          {selectedBlock && (
            <Card className="bg-gray-900/30 border-green-900/50">
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
            </Card>
          )}

          {/* Transaction List Card */}
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

          {/* Live Contract Deployments Card */}
          <LiveContractDeployments
            deployments={liveDeployments}
            isLoading={deploymentsLoading}
          />

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
                <span className="text-sm text-green-400">{activeValidators}</span>
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

          {/* Validator Network Card */}
          <Card className="bg-gray-900/30 border-green-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Users className="h-5 w-5 text-orange-400" />
                Validator Network
                {isConnected ? (
                  <Badge variant="secondary" className="ml-2">Connected</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">Disconnected</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 text-green-400">
                  <p className="text-sm text-muted-foreground">Active Validators</p>
                  <p className="text-2xl font-bold">{activeValidators}</p>
                </div>
                <div className="space-y-2 text-green-400">
                  <p className="text-sm text-muted-foreground">Average Success Rate</p>
                  <p className="text-2xl font-bold">{averageSuccessRate.toFixed(1)}%</p>
                </div>
                <div className="space-y-2 text-green-400">
                  <p className="text-sm text-muted-foreground">Total Validators</p>
                  <p className="text-2xl font-bold">{validators.length}</p>
                </div>
              </div>
              {error && (
                <p className="mt-4 text-sm text-red-500">{error}</p>
              )}
              <ScrollArea className="h-[200px] mt-4">
                <div className="space-y-2">
                  {validators.map((validator) => (
                    <div key={validator.address} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${validator.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <p className="text-sm font-mono">{validator.address.slice(0, 8)}...{validator.address.slice(-8)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm">{validator.blocksProduced} blocks</p>
                        <p className="text-sm">{validator.successRate.toFixed(1)}% success</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlockVisualizer;
