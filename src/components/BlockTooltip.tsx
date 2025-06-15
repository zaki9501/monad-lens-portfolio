
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface BlockRay {
  id: string;
  block: any;
  position: { x: number; y: number };
  side: 'left' | 'right';
  active: boolean;
  createdAt: number;
}

interface BlockTooltipProps {
  ray: BlockRay;
}

const BlockTooltip: React.FC<BlockTooltipProps> = ({ ray }) => {
  const { block, position } = ray;
  
  const tooltipStyle = {
    left: position.x + (ray.side === 'left' ? 50 : -350),
    top: position.y - 50,
  };

  return (
    <div
      className="absolute z-30 animate-in fade-in-0 zoom-in-95 duration-200"
      style={tooltipStyle}
    >
      <Card className="bg-slate-900/95 border-purple-500/50 backdrop-blur-md shadow-2xl w-80">
        <CardContent className="p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-purple-400">Block Details</h3>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400">Block #:</span>
                <div className="text-green-400 font-mono text-lg font-bold">
                  {parseInt(block.number, 16).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Transactions:</span>
                <div className="text-blue-400 font-bold text-lg">
                  {block.transactions?.length || 0}
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-gray-400">Hash:</span>
              <div className="text-blue-400 font-mono text-xs break-all">
                {block.hash}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400">Gas Used:</span>
                <div className="text-yellow-400 font-mono">
                  {parseInt(block.gasUsed, 16).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Gas Limit:</span>
                <div className="text-orange-400 font-mono">
                  {parseInt(block.gasLimit, 16).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-gray-400">Timestamp:</span>
              <div className="text-cyan-400">
                {new Date(parseInt(block.timestamp, 16) * 1000).toLocaleString()}
              </div>
            </div>
            
            <div>
              <span className="text-gray-400">Size:</span>
              <span className="text-pink-400 ml-2">{parseInt(block.size, 16)} bytes</span>
            </div>
            
            <div>
              <span className="text-gray-400">Base Fee:</span>
              <span className="text-indigo-400 ml-2">
                {(parseInt(block.baseFeePerGas, 16) / 1e9).toFixed(2)} Gwei
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockTooltip;
