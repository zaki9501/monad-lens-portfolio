import React from "react";
import { Badge } from "@/components/ui/badge";

interface LiveContractDeploymentsProps {
  deployments: {
    contractAddress: string;
    creator: string;
    txHash: string;
    blockNumber: string;
    timestamp: number;
  }[];
  isLoading: boolean;
}

const PANEL_HEIGHT_PX = 195;

const LiveContractDeployments: React.FC<LiveContractDeploymentsProps> = ({
  deployments,
  isLoading,
}) => (
  <div
    className="mb-0 h-[195px] min-h-[195px] max-h-[195px] flex flex-col"
    style={{}}
  >
    <div className="text-green-400 text-sm font-bold mb-2">
      LIVE CONTRACT DEPLOYMENTS
    </div>
    {isLoading && (
      <div className="text-green-700 text-xs mb-2 animate-pulse">
        Scanning latest block...
      </div>
    )}
    {/* Inner content should scroll but not grow */}
    <div
      className="relative flex-1 overflow-y-auto"
      style={{
        minHeight: 0,
      }}
    >
      {deployments.length === 0 && !isLoading ? (
        <div className="text-green-800 text-xs">
          No contracts deployed in the latest block.
        </div>
      ) : (
        <ul className="space-y-2 pr-1">
          {deployments.map((d, i) => (
            <li
              key={d.txHash + d.contractAddress}
              className="bg-green-900/20 p-2 rounded border border-green-900/40"
            >
              <div className="flex gap-1 text-xs items-center">
                <Badge variant="outline" className="border-green-600 text-green-400">
                  Contract
                </Badge>
                <span className="font-mono text-green-300 break-all" title={d.contractAddress}>
                  {d.contractAddress.slice(0, 8)}…{d.contractAddress.slice(-5)}
                </span>
              </div>
              <div className="ml-1 text-xs text-green-600 break-all">
                <span>Creator: </span>
                <span className="text-green-200" title={d.creator}>
                  {d.creator.slice(0, 7)}…{d.creator.slice(-4)}
                </span>
              </div>
              <div className="ml-1 text-xs text-green-600 break-all">
                <span>Tx: </span>
                <span className="text-cyan-300" title={d.txHash}>
                  {d.txHash.slice(0, 7)}…{d.txHash.slice(-4)}
                </span>
              </div>
              <div className="ml-1 text-xs text-green-700">
                Block: {parseInt(d.blockNumber, 16).toLocaleString()}
              </div>
              <div className="ml-1 text-xs text-green-800">
                {new Date(d.timestamp * 1000).toLocaleTimeString()}
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Gradient overlay if scrolling */}
      {deployments.length > 0 && (
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-4"
          style={{
            background:
              "linear-gradient(180deg,rgba(16,27,16,0) 0%,rgba(16,32,16,0.85) 100%)",
          }}
        />
      )}
    </div>
  </div>
);

export default LiveContractDeployments;
