import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAccountTransactions } from "@/lib/blockvision";
import { formatEther } from "ethers";
import { Activity, ArrowUpRight, ArrowDownLeft, Repeat, ExternalLink, Filter, RefreshCw, Plus, Zap, FileText, DollarSign } from "lucide-react";
interface TransactionHistoryProps {
  walletAddress: string;
}
const TransactionHistory = ({
  walletAddress
}: TransactionHistoryProps) => {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'contract'>('all');
  const [currentLimit, setCurrentLimit] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalTransactions: 0,
    totalContractCalls: 0,
    totalGasSpent: "0",
    successRate: 0
  });
  const fetchTransactions = async (limit = 20, append = false) => {
    if (!walletAddress) return;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await getAccountTransactions(walletAddress, limit);
      const txList = data?.result?.data || [];
      if (append) {
        setTxs(prev => [...prev, ...txList.slice(prev.length)]);
      } else {
        setTxs(txList);
      }
      setHasMore(txList.length === limit);

      // Calculate total stats from all loaded transactions
      let totalGas = 0;
      let successCount = 0;
      let contractCount = 0;
      txList.forEach((tx: any) => {
        if (tx.gasUsed) totalGas += Number(tx.gasUsed);
        if (tx.status === 1 || tx.status === "success") successCount++;
        if (getTransactionType(tx) === 'contract') contractCount++;
      });
      setTotalStats({
        totalTransactions: txList.length,
        totalContractCalls: contractCount,
        totalGasSpent: totalGas > 0 ? formatEther(totalGas.toString()) : "0",
        successRate: txList.length > 0 ? Math.round(successCount / txList.length * 100) : 0
      });
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  useEffect(() => {
    setCurrentLimit(20);
    setHasMore(true);
    fetchTransactions(20, false);
  }, [walletAddress]);
  const loadMoreTransactions = () => {
    const newLimit = currentLimit + 20;
    setCurrentLimit(newLimit);
    fetchTransactions(newLimit, true);
  };

  // Helper functions
  const getTransactionType = (tx: any) => {
    if (tx.to?.toLowerCase() === walletAddress.toLowerCase()) return 'receive';
    if (tx.from?.toLowerCase() === walletAddress.toLowerCase()) {
      if (tx.toAddress?.isContract) return 'contract';
      return 'send';
    }
    return 'contract';
  };
  const getDetailedTransactionType = (tx: any) => {
    const basicType = getTransactionType(tx);
    if (basicType === 'contract') {
      if (tx.methodName) {
        return {
          type: 'contract',
          label: tx.methodName,
          description: `Contract: ${tx.methodName}`,
          icon: <FileText className="w-4 h-4 text-purple-400" />
        };
      }
      if (tx.methodID && tx.methodID !== '0x') {
        return {
          type: 'contract',
          label: 'Contract Call',
          description: `Method: ${tx.methodID.slice(0, 10)}...`,
          icon: <Zap className="w-4 h-4 text-purple-400" />
        };
      }
      return {
        type: 'contract',
        label: 'Contract',
        description: 'Contract interaction',
        icon: <FileText className="w-4 h-4 text-purple-400" />
      };
    }
    if (basicType === 'send') {
      return {
        type: 'send',
        label: 'Send',
        description: 'Outgoing transfer',
        icon: <ArrowUpRight className="w-4 h-4 text-red-400" />
      };
    }
    return {
      type: 'receive',
      label: 'Receive',
      description: 'Incoming transfer',
      icon: <ArrowDownLeft className="w-4 h-4 text-green-400" />
    };
  };
  const getStatusColor = (status: string | number) => {
    if (status === "success" || status === 1) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    }
    if (status === "failed" || status === 0) {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    }
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
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

  // Filter transactions for display
  const filteredTxs = useMemo(() => {
    if (filter === 'all') return txs;
    return txs.filter(tx => {
      const type = getTransactionType(tx);
      if (filter === 'contract') {
        return type === 'contract';
      }
      return type === filter;
    });
  }, [txs, filter]);
  return <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Transaction History</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Transactions</option>
              <option value="send">Sent</option>
              <option value="receive">Received</option>
              <option value="contract">Contract Calls</option>
            </select>
          </div>
          <Button onClick={() => fetchTransactions(currentLimit, false)} variant="outline" size="sm" className="border-slate-600 text-gray-300 hover:bg-slate-700" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards - showing total wallet stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <CardContent className="p-4 bg-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-neutral-400">{totalStats.totalTransactions}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Contract Calls</p>
                <p className="text-2xl font-bold text-gray-400">{totalStats.totalContractCalls}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Gas Spent</p>
                <p className="text-xl font-bold text-gray-400">{parseFloat(totalStats.totalGasSpent).toFixed(4)} MON</p>
              </div>
              <Zap className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-gray-400">{totalStats.successRate}%</p>
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
          {loading ? <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-gray-400">Loading transactions...</p>
            </div> : error ? <div className="p-8 text-center">
              <p className="text-red-400">{error}</p>
            </div> : filteredTxs.length === 0 ? <div className="p-8 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">No transactions found for this address.</p>
            </div> : <>
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
                const typeInfo = getDetailedTransactionType(tx);
                const status = tx.status === 1 ? "success" : tx.status === 0 ? "failed" : tx.status || "success";
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
                return <TableRow key={hash || idx} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {typeInfo.icon}
                            <div>
                              <span className="text-white font-medium">{typeInfo.label}</span>
                              <p className="text-xs text-gray-400">{typeInfo.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-blue-300 bg-slate-900/50 px-2 py-1 rounded text-sm">
                            {hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : ""}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-300">
                            {typeInfo.type === "receive" ? `From ${from}` : `To ${to}`}
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
                            {status === 1 || status === "success" ? "Success" : status === 0 || status === "failed" ? "Failed" : status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-400 text-sm">{ago}</span>
                        </TableCell>
                        <TableCell>
                          <a href={`https://testnet.monvision.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </TableCell>
                      </TableRow>;
              })}
                </TableBody>
              </Table>
              
              {/* Load More Button */}
              {hasMore && <div className="p-6 border-t border-slate-700 bg-slate-800/30">
                  <Button onClick={loadMoreTransactions} variant="outline" disabled={loadingMore} className="w-full border-slate-600 hover:bg-slate-700 text-gray-300">
                    {loadingMore ? <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading more...
                      </> : <>
                        <Plus className="w-4 h-4 mr-2" />
                        Load More Transactions
                      </>}
                  </Button>
                </div>}
            </>}
        </CardContent>
      </Card>
    </div>;
};
export default TransactionHistory;