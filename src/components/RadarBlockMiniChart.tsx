
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";

// Simple frequency/wavelength chart, expects data=[{ t, v }]
const RadarBlockMiniChart: React.FC<{ data: { t: number; v: number }[] }> = ({ data }) => (
  <div className="p-1 bg-black/80 border border-green-900/50 rounded shadow-lg mb-2">
    <div className="text-green-400 font-mono text-xs opacity-75 mb-0.5">Block Frequency</div>
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke="#00ffb3"
          dot={false}
          strokeWidth={2}
          isAnimationActive
        />
        <XAxis dataKey="t" hide />
        <YAxis hide />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default RadarBlockMiniChart;
