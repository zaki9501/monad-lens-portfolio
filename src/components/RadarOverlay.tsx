
import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface BlockRadarBlip {
  id: string;
  angle: number; // in radians
  radius: number;
  detail: any;
  detectedAt: number;
}

interface RadarOverlayProps {
  recentBlocks: any[];
}

const RADAR_SWEEP_TIME = 4000; // ms for a full sweep

// Dummy frequency data for the wavelength chart
function useFakeWaveData(maxPoints: number = 30) {
  const [data, setData] = useState<{ t: number; v: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((old) => {
        const next = [
          ...old.slice(-(maxPoints - 1)),
          {
            t: Date.now(),
            v: Math.floor(15 + Math.random() * 12 + 8 * Math.sin(Math.random() * 3.14)), // random spike/wave
          },
        ];
        return next;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [maxPoints]);
  return data;
}

const RadarOverlay: React.FC<RadarOverlayProps> = ({ recentBlocks }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [blips, setBlips] = useState<BlockRadarBlip[]>([]);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [dimensions, setDimensions] = useState({ w: 400, h: 400 });
  const freqData = useFakeWaveData();

  // Resize canvas on mount and window resize
  useEffect(() => {
    function handleResize() {
      const size = Math.min(window.innerWidth, 400, window.innerHeight * 0.6);
      setDimensions({ w: size, h: size });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animated sweep
  useEffect(() => {
    let animationId: number;
    let lastStamp = performance.now();
    function animate(now: number) {
      const elapsed = now - lastStamp;
      lastStamp = now;
      setSweepAngle((prev) => (prev + (2 * Math.PI * elapsed) / RADAR_SWEEP_TIME) % (2 * Math.PI));
      animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Add block blips as blocks come in
  useEffect(() => {
    if (!recentBlocks.length) return;
    // Show only 6 latest unique blocks as blips
    const unique: { [hash: string]: boolean } = {};
    const newBlips: BlockRadarBlip[] = [];
    let num = 0;
    for (let b of recentBlocks) {
      if (num > 6) break;
      if (!b.hash || unique[b.hash]) continue;
      unique[b.hash] = true;
      // random angle/radius for visual effect based on block hash
      const hashSeed = parseInt(b.hash?.slice(2, 10) || "", 16) || Math.floor(Math.random()*10000);
      const angle = ((hashSeed % 1000) / 1000) * 2 * Math.PI;
      const radius = 0.5 + 0.45 * ((hashSeed % 700) / 700); // [0.5, 0.95]
      newBlips.push({
        id: b.hash,
        angle,
        radius,
        detail: b,
        detectedAt: Date.now(),
      });
      num++;
    }
    setBlips(newBlips);
  }, [recentBlocks]);

  // Draw radar
  useEffect(() => {
    const { w, h } = dimensions;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    // Radar circle and grid
    ctx.save();
    ctx.strokeStyle = "#00FF66";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.26;
    for (let r = 1; r <= 4; r++) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, (w / 2) * (r / 4), 0, 2 * Math.PI);
      ctx.stroke();
    }
    // cross lines
    for (let a = 0; a < 4; a++) {
      ctx.beginPath();
      const angle = a * (Math.PI / 2);
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(
        w / 2 + (w / 2) * Math.cos(angle),
        h / 2 + (h / 2) * Math.sin(angle)
      );
      ctx.stroke();
    }
    ctx.restore();

    // Radar sweep
    const grad = ctx.createRadialGradient(w / 2, h / 2, w / 20, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(0,255,70,0.14)");
    grad.addColorStop(0.92, "rgba(0,255,100,0.1)");
    grad.addColorStop(1, "rgba(0,255, 50,0)");
    ctx.save();
    ctx.globalAlpha = 0.80;
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    const sweepStart = sweepAngle;
    const sweepEnd = sweepAngle + Math.PI / 16;
    ctx.arc(w / 2, h / 2, w / 2, sweepStart, sweepEnd);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Blips
    for (let blip of blips) {
      // Blip fades out after 4s
      const dt = (Date.now() - blip.detectedAt) % RADAR_SWEEP_TIME;
      if (dt > RADAR_SWEEP_TIME * 0.92) continue; // fade-out in last sweep
      const fade = Math.max(0.2, 1 - dt / 3000);
      const blipR = w / 2 * blip.radius;
      const bx =
        w / 2 + blipR * Math.cos(blip.angle);
      const by =
        h / 2 + blipR * Math.sin(blip.angle);

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, 2 * Math.PI);
      ctx.globalAlpha = fade * 0.82;
      ctx.fillStyle = "#00ff99";
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    }
  }, [blips, sweepAngle, dimensions]);

  // Map blip positions for info popups
  let blipPositions: { [hash: string]: { top: number; left: number } } = {};
  const { w, h } = dimensions;
  blips.forEach((blip) => {
    const blipR = w / 2 * blip.radius;
    const bx = w / 2 + blipR * Math.cos(blip.angle);
    const by = h / 2 + blipR * Math.sin(blip.angle);
    blipPositions[blip.id] = {
      left: bx,
      top: by,
    };
  });

  return (
    <div className="relative mx-auto flex flex-col items-center" style={{ width: w, height: h + 120 }}>
      {/* Canvas radar */}
      <canvas
        ref={canvasRef}
        width={w}
        height={h}
        className="rounded-full border border-green-700/60 bg-black shadow-2xl"
        style={{
          width: w,
          height: h,
          boxShadow: '0 0 50px #00ff88, 0 0 4px #111',
        }}
      />

      {/* Floating block info over blips */}
      {blips.map((blip) => {
        const pos = blipPositions[blip.id];
        if (!pos) return null;
        // Fade out popup on oldest detcted blocks
        const age = (Date.now() - blip.detectedAt) % RADAR_SWEEP_TIME;
        if (age > RADAR_SWEEP_TIME * 0.8) return null;

        return (
          <div
            key={blip.id}
            className={`absolute animate-fade-in-up pointer-events-none transition-all`}
            style={{
              top: pos.top - 52,
              left: pos.left + 16,
              minWidth: 140,
              zIndex: 10,
              opacity: 1 - age / (RADAR_SWEEP_TIME * 0.8),
              filter: "drop-shadow(0 0 6px #18ff94cc)"
            }}
          >
            <Card className="border-[1.5px] border-green-400/80 bg-black/80 rounded-lg px-2 py-1 backdrop-blur-[2px]">
              <div className="text-green-400 text-xs font-mono leading-[1.25] space-y-[1px]">
                <div><b>Block</b> #{parseInt(blip.detail.number, 16)}</div>
                <div>{blip.detail.transactions?.length ?? 0} txs</div>
                <div>
                  <span className="text-green-800">Gas:</span>{" "}
                  <span className="text-green-400">{parseInt(blip.detail.gasUsed, 16).toLocaleString()}</span>
                </div>
                <div className="text-green-600">{new Date(parseInt(blip.detail.timestamp, 16) * 1000).toLocaleTimeString()}</div>
              </div>
            </Card>
          </div>
        );
      })}
      {/* Label/scan text */}
      <div className="absolute left-2 bottom-1 text-green-400 text-xs font-mono uppercase select-none opacity-70 pointer-events-none">Live Block Radar</div>

      {/* Network Frequency/Wavelength Chart */}
      <div className="absolute right-0 -bottom-20 w-full" style={{ pointerEvents:"none" }}>
        <div className="p-1 rounded bg-black/80 border border-green-900/50 shadow-lg">
          <div className="text-green-400 font-mono text-xs opacity-75 mb-0.5">Network Frequency Analyzer</div>
          <ResponsiveContainer width="100%" height={48}>
            <LineChart data={freqData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#00ffb3"
                dot={false}
                strokeWidth={2}
                isAnimationActive={true}
              />
              <XAxis dataKey="t" hide />
              <YAxis hide />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RadarOverlay;
