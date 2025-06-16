
import React from "react";

interface RadarLiveTransactionFeedProps {
  transactions: any[];
}

const formatAddress = (address: string | null | undefined) => {
  if (!address || typeof address !== "string") {
    return "N/A";
  }
  return `${address.slice(0, 7)}...${address.slice(-5)}`;
};

const formatValue = (value: string) => {
  const wei = parseInt(value, 16);
  const eth = wei / 1e18;
  return eth > 0.001 ? `${eth.toFixed(4)} MON` : `${wei.toLocaleString()} wei`;
};

const RadarLiveTransactionFeed: React.FC<RadarLiveTransactionFeedProps> = ({ transactions }) => (
  <div className="bg-black/70 border border-green-900/50 rounded shadow-lg px-2 py-1 mb-2">
    <div className="text-green-400 font-mono text-xs opacity-75 mb-1">Live Transactions</div>
    <div className="max-h-24 overflow-y-auto space-y-1">
      {transactions.length === 0 ? (
        <div className="text-green-700 text-xs py-2 opacity-60">No live transactions.</div>
      ) : (
        transactions.slice(0, 6).map((tx, idx) => (
          <div key={tx.hash + idx} className="flex flex-col mb-1 border-b border-green-900/30 pb-1 last:border-0 last:pb-0">
            <div className="flex gap-1 items-center text-xs text-green-400">
              <span className="font-mono">{formatAddress(tx.hash)}</span>
              <span className="text-green-600 px-2">→</span>
              <span className="font-mono">{formatAddress(tx.to)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-green-600 mt-0.5">
              <span>{formatValue(tx.value)}</span>
              <span>{tx.from ? formatAddress(tx.from) : ""}</span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default RadarLiveTransactionFeed;
