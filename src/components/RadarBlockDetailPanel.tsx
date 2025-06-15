
import React from "react";
import { Card } from "@/components/ui/card";
import RadarBlockMiniChart from "./RadarBlockMiniChart";
import RadarLiveTransactionFeed from "./RadarLiveTransactionFeed";

interface RadarBlockDetailPanelProps {
  block: any | null;
  waveData: { t: number; v: number }[];
  onClose: () => void;
  transactions?: any[]; // Pass transactions to show below chart
}

// Formats
const formatHex = (val: string | number | undefined) => {
  if (!val) return "N/A";
  if (typeof val === "string" && val.startsWith("0x")) return parseInt(val, 16).toLocaleString();
  if (typeof val === "number") return val.toLocaleString();
  return val.toString();
};
const formatShortHash = (hash: string) =>
  typeof hash === "string" ? hash.slice(0, 7) + "..." + hash.slice(-5) : "N/A";
const formatDateTime = (hex: string) => {
  if (!hex) return "";
  const ms = parseInt(hex, 16) * 1000;
  const d = new Date(ms);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
};

const RadarBlockDetailPanel: React.FC<RadarBlockDetailPanelProps> = ({
  block,
  waveData,
  onClose,
  transactions = [],
}) => {
  if (!block) return null;
  return (
    <aside className="w-80 max-w-full p-2 pr-0 animate-fade-in-up">
      <Card className="border-green-400/80 bg-black/80 rounded-lg px-3 py-3 mb-3 backdrop-blur-[2px] relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-green-400/60 hover:text-green-300 text-xs"
        >
          ✕
        </button>
        <div className="text-green-400 text-xs font-mono leading-[1.2] space-y-1 break-all">
          <div>
            <b>Block</b> #{formatHex(block.number)}
          </div>
          <div>{block.transactions?.length ?? 0} txs <span className="text-green-700">by</span></div>
          <div>
            <span className="text-green-600">Miner:</span>{" "}
            <span className="text-green-400">{formatShortHash(block.miner)}</span>
          </div>
          <div>
            <span className="text-green-600">Full Hash:</span>{" "}
            <span
              className="text-cyan-400 truncate max-w-[180px] inline-block align-top"
              title={block.hash}
              style={{
                verticalAlign: 'middle',
                wordBreak: 'break-all'
              }}
            >
              {formatShortHash(block.hash)}
            </span>
          </div>
          <div>
            <span className="text-green-600">Gas Used:</span>{" "}
            <span className="">{formatHex(block.gasUsed)}</span>
            <span className="text-green-700"> / </span>
            <span className="">{formatHex(block.gasLimit)}</span>
          </div>
          <div className="text-green-600">
            {formatDateTime(block.timestamp)}
          </div>
        </div>
      </Card>
      {/* Show a mini wave chart below the details */}
      <RadarBlockMiniChart data={waveData} />

      {/* Live transaction feed below mini chart */}
      <RadarLiveTransactionFeed transactions={transactions || []} />
    </aside>
  );
};

export default RadarBlockDetailPanel;

