
import React from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface StatsWaveChartProps {
  recentBlocks: Array<any>;
}

const getBlockStats = (blocks: Array<any>) => {
  return blocks.map((block, i) => {
    const txCount = block?.transactions?.length || 0;
    // Contract deployment if tx.to === null (per Ethereum/Monad convention)
    const contractsDeployed = block?.transactions?.filter((tx: any) => tx.to === null).length || 0;
    return {
      name: `#${parseInt(block.number, 16)}`,
      Transactions: txCount,
      "Contracts Deployed": contractsDeployed,
    };
  }).reverse(); // reverse to show oldest left
};

const StatsWaveChart: React.FC<StatsWaveChartProps> = ({ recentBlocks }) => {
  const data = getBlockStats(recentBlocks);

  return (
    <div className="w-full py-1">
      <div className="flex justify-between px-2 mb-1">
        <span className="text-green-400 text-xs font-bold">Total TX</span>
        <span className="text-cyan-400 text-xs font-bold">Contracts Deployed</span>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
              <stop offset="15%" stopColor="#22d3ee" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0.15} />
            </linearGradient>
            <linearGradient id="colorDeploy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a3e635" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="Transactions"
            stroke="#22d3ee"
            fillOpacity={1}
            fill="url(#colorTx)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="Contracts Deployed"
            stroke="#a3e635"
            fillOpacity={1}
            fill="url(#colorDeploy)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
          <XAxis dataKey="name" hide />
          <Tooltip
            wrapperClassName="!bg-black/80 text-xs rounded px-2 py-1"
            labelClassName="!text-cyan-400 font-mono"
            contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", fontSize: 12 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsWaveChart;

