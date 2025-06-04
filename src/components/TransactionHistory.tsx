
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowUpRight, ArrowDownLeft, Repeat, ExternalLink } from "lucide-react";

interface TransactionHistoryProps {
  walletAddress: string;
}

const TransactionHistory = ({ walletAddress }: TransactionHistoryProps) => {
  // Mock transaction data
  const transactions = [
    {
      hash: "0x1234...5678",
      type: "send",
      token: "MON",
      amount: "150.0",
      to: "0xabcd...efgh",
      timestamp: "2 hours ago",
      status: "success",
      gasUsed: "21,000",
      gasPrice: "0.1 gwei"
    },
    {
      hash: "0x2345...6789",
      type: "receive",
      token: "DAK",
      amount: "500.0",
      from: "0xijkl...mnop",
      timestamp: "5 hours ago",
      status: "success",
      gasUsed: "25,000",
      gasPrice: "0.1 gwei"
    },
    {
      hash: "0x3456...7890",
      type: "swap",
      tokenIn: "YAKI",
      tokenOut: "MON",
      amountIn: "1000.0",
      amountOut: "250.0",
      timestamp: "1 day ago",
      status: "success",
      gasUsed: "120,000",
      gasPrice: "0.2 gwei"
    },
    {
      hash: "0x4567...8901",
      type: "send",
      token: "MON",
      amount: "75.5",
      to: "0xqrst...uvwx",
      timestamp: "2 days ago",
      status: "failed",
      gasUsed: "21,000",
      gasPrice: "0.1 gwei"
    },
    {
      hash: "0x5678...9012",
      type: "receive",
      token: "YAKI",
      amount: "2000.0",
      from: "0xyzab...cdef",
      timestamp: "3 days ago",
      status: "success",
      gasUsed: "30,000",
      gasPrice: "0.1 gwei"
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-4 h-4" />;
      case "receive":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "swap":
        return <Repeat className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge 
        variant={status === "success" ? "default" : "destructive"}
        className={status === "success" ? "bg-green-600 text-white" : ""}
      >
        {status}
      </Badge>
    );
  };

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
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.hash} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    tx.type === "send" ? "bg-red-500/20 text-red-400" :
                    tx.type === "receive" ? "bg-green-500/20 text-green-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium capitalize">{tx.type}</p>
                      {getStatusBadge(tx.status)}
                    </div>
                    
                    {tx.type === "swap" ? (
                      <p className="text-gray-400 text-sm">
                        {tx.amountIn} {tx.tokenIn} → {tx.amountOut} {tx.tokenOut}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        {tx.amount} {tx.token}
                        {tx.type === "send" && tx.to && ` to ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}
                        {tx.type === "receive" && tx.from && ` from ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>Gas: {tx.gasUsed} ({tx.gasPrice})</span>
                      <span>{tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-white font-mono text-sm">
                      {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-white text-2xl font-bold">47</p>
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
                <p className="text-white text-2xl font-bold">0.025 MON</p>
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
                <p className="text-white text-2xl font-bold">94%</p>
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
