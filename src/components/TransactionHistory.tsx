import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAccountTransactions } from "@/lib/blockvision";
import { formatEther } from "ethers";
import { Activity, ArrowUpRight, ArrowDownLeft, Repeat, ExternalLink } from "lucide-react";

interface TransactionHistoryProps {
  walletAddress: string;
}

const TransactionHistory = ({ walletAddress }: TransactionHistoryProps) => {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    getAccountTransactions(walletAddress, 20)
      .then((data) => {
        const txList = data?.result?.data || [];
        setTxs(txList);
      })
      .catch((err) => {
        setError("Failed to load transactions");
      })
      .finally(() => setLoading(false));
  }, [walletAddress]);

  // Helper functions
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send": return <ArrowUpRight className="w-4 h-4" />;
      case "receive": return <ArrowDownLeft className="w-4 h-4" />;
      case "swap": return <Repeat className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };
  const getStatusBadge = (status: string) => (
    <Badge 
      variant={status === "success" ? "default" : "destructive"}
      className={status === "success" ? "bg-green-600 text-white" : ""}
    >
      {status}
    </Badge>
  );
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
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white">Loading transactions...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : txs.length === 0 ? (
            <p className="text-gray-400">No transactions found for this address.</p>
          ) : (
            <div className="space-y-4">
              {txs.map((tx, idx) => {
                const type = tx.type || tx.method || "Transfer";
                const status = tx.status || "success";
                const from = shortAddr(tx.from);
                const to = shortAddr(tx.to);
                const hash = tx.hash;
                let value = "-";
                if (tx.value && Number(tx.value) > 0) {
                  try {
                    value = formatEther(tx.value) + " MON";
                  } catch {
                    value = Number(tx.value).toLocaleString();
                  }
                }
                const isSwap = type.toLowerCase() === "swap";
                const gas = tx.gasUsed ? Number(tx.gasUsed).toLocaleString() : "-";
                const gasPrice = tx.gasPrice ? Number(tx.gasPrice) / 1e9 + " gwei" : "-";
                const ago = tx.timestamp ? timeAgo(tx.timestamp) : "";
                // Icon color logic
                let iconBg = "bg-blue-500/20 text-blue-400";
                if (type === "send") iconBg = "bg-red-500/20 text-red-400";
                if (type === "receive") iconBg = "bg-green-500/20 text-green-400";
                return (
                  <div
                    key={hash || idx}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${iconBg} flex items-center justify-center`}>
                        {getTransactionIcon(type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium capitalize">{type}</p>
                          {getStatusBadge(status)}
                        </div>
                        {isSwap ? (
                          <p className="text-gray-400 text-sm">
                            {tx.amountIn} {tx.tokenIn} → {tx.amountOut} {tx.tokenOut}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-sm">
                            {value}
                            {type === "send" && to && ` to ${to}`}
                            {type === "receive" && from && ` from ${from}`}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>Gas: {gas} ({gasPrice})</span>
                          <span>{ago}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-white font-mono text-sm">
                          {hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : ""}
                        </p>
                      </div>
                      <a href={`https://monadscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Transaction Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-white text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Gas Spent</p>
                <p className="text-white text-2xl font-bold">{stats.gasSpent} MON</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-white text-2xl font-bold">{stats.successRate}%</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionHistory;
