
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAccountTransactions } from "@/lib/blockvision";
import { formatEther } from "ethers";
import { Activity, ArrowUpRight, ArrowDownLeft, Repeat, ExternalLink, Filter, RefreshCw } from "lucide-react";

interface TransactionHistoryProps {
  walletAddress: string;
}

const TransactionHistory = ({ walletAddress }: TransactionHistoryProps) => {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'swap'>('all');

  const fetchTransactions = async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAccountTransactions(walletAddress, 20);
      const txList = data?.result?.data || [];
      setTxs(txList);
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [walletAddress]);

  // Helper functions
  const getTransactionType = (tx: any) => {
    if (tx.to?.toLowerCase() === walletAddress.toLowerCase()) return 'receive';
    if (tx.from?.toLowerCase() === walletAddress.toLowerCase()) return 'send';
    if (tx.method && tx.method.toLowerCase().includes('swap')) return 'swap';
    return 'send';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send": return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case "receive": return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case "swap": return <Repeat className="w-4 h-4 text-blue-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "failed": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const shortAddr = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
  
  const timeAgo = (ts: number | string) => {
    const now = Date.now();
    const date = new Date(Number(ts) < 1e12 ? Number(ts) * 1000 : Number(ts));
    const diff = Math.floor((now - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Filter transactions
  const filteredTxs = useMemo(() => {
    if (filter === 'all') return txs;
    return txs.filter(tx => getTransactionType(tx) === filter);
  }, [txs, filter]);

  // Transaction stats
  const stats = useMemo(() => {
    let total = txs.length;
    let gasSpent = 0;
    let success = 0;
    txs.forEach(tx => {
      if (tx.gasUsed) gasSpent += Number(tx.gasUsed);
      if ((tx.status || "success") === "success") success++;
    });
    return {
      total,
      gasSpent: gasSpent > 0 ? formatEther(gasSpent.toString()) : "0",
      successRate: total > 0 ? Math.round((success / total) * 100) : 0
    };
  }, [txs]);

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Transaction History</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Transactions</option>
              <option value="send">Sent</option>
              <option value="receive">Received</option>
              <option value="swap">Swaps</option>
            </select>
          </div>
          <Button
            onClick={fetchTransactions}
            variant="outline"
            size="sm"
            className="border-slate-600 text-gray-300 hover:bg-slate-700"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Transactions</p>
                <p className="text-white text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Gas Spent</p>
                <p className="text-white text-2xl font-bold">{parseFloat(stats.gasSpent).toFixed(4)} MON</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Success Rate</p>
                <p className="text-white text-2xl font-bold">{stats.successRate}%</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-gray-400">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">No transactions found for this address.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Hash</TableHead>
                  <TableHead className="text-gray-300">From/To</TableHead>
                  <TableHead className="text-gray-300">Value</TableHead>
                  <TableHead className="text-gray-300">Gas</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Time</TableHead>
                  <TableHead className="text-gray-300"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTxs.map((tx, idx) => {
                  const type = getTransactionType(tx);
                  const status = tx.status || "success";
                  const from = shortAddr(tx.from);
                  const to = shortAddr(tx.to);
                  const hash = tx.hash;
                  let value = "-";
                  if (tx.value && Number(tx.value) > 0) {
                    try {
                      value = parseFloat(formatEther(tx.value)).toFixed(4) + " MON";
                    } catch {
                      value = Number(tx.value).toLocaleString();
                    }
                  }
                  const gas = tx.gasUsed ? Number(tx.gasUsed).toLocaleString() : "-";
                  const ago = tx.timestamp ? timeAgo(tx.timestamp) : "";

                  return (
                    <TableRow key={hash || idx} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(type)}
                          <span className="text-white capitalize font-medium">{type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-blue-300 bg-slate-900/50 px-2 py-1 rounded text-sm">
                          {hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : ""}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-300">
                          {type === "receive" ? `From ${from}` : `To ${to}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono ${value !== "-" ? "text-white" : "text-gray-500"}`}>
                          {value}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-400 text-sm">{gas}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(status)} border`}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-400 text-sm">{ago}</span>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`https://monadscan.io/tx/${hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
