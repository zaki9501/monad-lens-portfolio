
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Loader2, Cube, Clock, Hash, Users } from "lucide-react";

interface Block {
  number: string;
  hash: string;
  timestamp: string;
  gasUsed: string;
  gasLimit: string;
  transactionCount: number;
  miner: string;
  difficulty: string;
  size: string;
}

const BlockVisualizer = () => {
  const { authenticated } = usePrivy();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [latestBlock, setLatestBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestBlock = async () => {
    try {
      const response = await fetch('https://monad-testnet.hypersync.xyz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: ['latest', true],
          id: 1,
        }),
      });

      const data = await response.json();
      
      if (data.result) {
        const block: Block = {
          number: parseInt(data.result.number, 16).toString(),
          hash: data.result.hash,
          timestamp: new Date(parseInt(data.result.timestamp, 16) * 1000).toLocaleString(),
          gasUsed: parseInt(data.result.gasUsed, 16).toString(),
          gasLimit: parseInt(data.result.gasLimit, 16).toString(),
          transactionCount: data.result.transactions.length,
          miner: data.result.miner,
          difficulty: parseInt(data.result.difficulty, 16).toString(),
          size: parseInt(data.result.size, 16).toString(),
        };

        setLatestBlock(block);
        setBlocks(prev => [block, ...prev.slice(0, 9)]); // Keep last 10 blocks
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching block:', err);
      setError('Failed to fetch block data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authenticated) return;

    fetchLatestBlock();
    const interval = setInterval(fetchLatestBlock, 3000); // Fetch every 3 seconds

    return () => clearInterval(interval);
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please connect your wallet</h1>
          <p className="text-slate-400">You need to authenticate to view the block visualizer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Block Visualizer</h1>
          <p className="text-slate-400">Real-time Monad testnet block data</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-slate-400">Loading block data...</span>
          </div>
        )}

        {error && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-4">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {latestBlock && (
          <div className="mb-8">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Cube className="h-5 w-5" />
                  Latest Block #{latestBlock.number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Block Hash</p>
                      <p className="font-mono text-xs">{latestBlock.hash.slice(0, 20)}...</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Timestamp</p>
                      <p className="text-sm">{latestBlock.timestamp}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Transactions</p>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {latestBlock.transactionCount}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Gas Used / Limit</p>
                    <p className="text-sm">
                      {parseInt(latestBlock.gasUsed).toLocaleString()} / {parseInt(latestBlock.gasLimit).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Block Size</p>
                    <p className="text-sm">{parseInt(latestBlock.size).toLocaleString()} bytes</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Miner</p>
                    <p className="font-mono text-xs">{latestBlock.miner.slice(0, 20)}...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Recent Blocks</h2>
          
          <div className="grid gap-4">
            {blocks.map((block, index) => (
              <Card key={block.hash} className={`bg-slate-900/30 border-slate-700 ${index === 0 ? 'ring-2 ring-purple-400/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cube className="h-4 w-4 text-purple-400" />
                      <span className="font-semibold">Block #{block.number}</span>
                      {index === 0 && <Badge className="bg-green-600">Latest</Badge>}
                    </div>
                    <span className="text-sm text-slate-400">{block.timestamp}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Hash</p>
                      <p className="font-mono">{block.hash.slice(0, 12)}...</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Transactions</p>
                      <p className="text-green-400">{block.transactionCount}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Gas Used</p>
                      <p>{parseInt(block.gasUsed).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Size</p>
                      <p>{parseInt(block.size).toLocaleString()} bytes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockVisualizer;
