
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

  useEffect(() => {
    function handleResize() {
      const size = Math.min(window.innerWidth, 400, window.innerHeight * 0.6);
      setDimensions({ w: size, h: size });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animated sweep, higher FPS
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

  // More accurate blip positioning and richer details
  useEffect(() => {
    if (!recentBlocks.length) return;
    // Show only 7 latest unique blocks as blips (more dense than before)
    const unique: { [hash: string]: boolean } = {};
    const newBlips: BlockRadarBlip[] = [];
    let num = 0;
    for (let b of recentBlocks) {
      if (num > 6) break;
      if (!b.hash || unique[b.hash]) continue;
      unique[b.hash] = true;

      // New: deterministic angle using blockNumber & timestamp
      // angle = (blockNumber * 117 + timestamp * 37) % TAU (TAU = 2pi)
      const blockNum =
        typeof b.number === "string"
          ? parseInt(b.number, 16)
          : typeof b.number === "number"
          ? b.number
          : 0;
      const time = typeof b.timestamp === "string" ? parseInt(b.timestamp, 16) : 0;
      const angle = (((blockNum || 1) * 117 + (time || 1) * 37) % 1000) / 1000 * 2 * Math.PI;

      // New: radius varies smoothly with block number to make visually distributed
      const radius = 0.52 + 0.44 * (((blockNum || 37) % 700) / 700); // [0.52, 0.96]

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

  useEffect(() => {
    const { w, h } = dimensions;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    // Radar grid
    ctx.save();
    ctx.strokeStyle = "#00FF66";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.23;
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
      ctx.lineTo(w / 2 + (w / 2) * Math.cos(angle), h / 2 + (h / 2) * Math.sin(angle));
      ctx.stroke();
    }
    ctx.restore();

    // Radar sweep
    const grad = ctx.createRadialGradient(w / 2, h / 2, w / 23, w / 2, h / 2, w / 2);
    grad.addColorStop(0, "rgba(0,255,70,0.14)");
    grad.addColorStop(0.89, "rgba(0,255,100,0.15)");
    grad.addColorStop(1, "rgba(0,255, 50,0)");
    ctx.save();
    ctx.globalAlpha = 0.90;
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
      // Blip fades out after ~4s
      const dt = (Date.now() - blip.detectedAt) % RADAR_SWEEP_TIME;
      if (dt > RADAR_SWEEP_TIME * 0.95) continue; // fade-out very last sweep
      // Make blip stronger just after "caught" and fade smoother
      const fade = Math.max(0.13, 1.05 - dt / 3500);
      const blipR = (w / 2) * blip.radius;
      const bx = w / 2 + blipR * Math.cos(blip.angle);
      const by = h / 2 + blipR * Math.sin(blip.angle);

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, 9, 0, 2 * Math.PI);
      ctx.globalAlpha = fade * 0.84;
      ctx.fillStyle = "#00FFB3";
      ctx.shadowColor = "#00ff97";
      ctx.shadowBlur = 16;
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

  // Helpers for details
  const formatHex = (val: string | number | undefined) => {
    if (!val) return "N/A";
    if (typeof val === "string" && val.startsWith("0x")) return parseInt(val, 16).toLocaleString();
    if (typeof val === "number") return val.toLocaleString();
    return val.toString();
  };
  const formatShortHash = (hash: string) => (typeof hash === "string" ? hash.slice(0, 7) + "..." + hash.slice(-5) : "N/A");
  const formatDateTime = (hex: string) => {
    if (!hex) return "";
    const ms = parseInt(hex, 16) * 1000;
    const d = new Date(ms);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

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
        // Fade out popup on oldest detected blocks
        const age = (Date.now() - blip.detectedAt) % RADAR_SWEEP_TIME;
        if (age > RADAR_SWEEP_TIME * 0.82) return null;

        const { detail } = blip;
        return (
          <div
            key={blip.id}
            className={`absolute animate-fade-in-up pointer-events-none transition-all`}
            style={{
              top: pos.top - 66,
              left: pos.left + 18,
              minWidth: 158,
              zIndex: 10,
              opacity: 1.1 - age / (RADAR_SWEEP_TIME * 0.8),
              filter: "drop-shadow(0 0 6px #18ff94cc)"
            }}
          >
            <Card className="border-[1.5px] border-green-400/80 bg-black/80 rounded-lg px-2 py-2 backdrop-blur-[2px]">
              <div className="text-green-400 text-xs font-mono leading-[1.2] space-y-1">
                <div><b>Block</b> #{formatHex(detail.number)}</div>
                <div>{detail.transactions?.length ?? 0} txs &nbsp; <span className="text-green-700">by</span></div>
                <div>
                  <span className="text-green-600">Miner:</span>{" "}
                  <span className="text-green-400">{formatShortHash(detail.miner)}</span>
                </div>
                <div>
                  <span className="text-green-600">Hash:</span>{" "}
                  <span className="text-cyan-400">{formatShortHash(detail.hash)}</span>
                </div>
                <div>
                  <span className="text-green-600">Gas Used:</span>{" "}
                  <span className="">{formatHex(detail.gasUsed)}</span>
                  <span className="text-green-700"> / </span>
                  <span className="">{formatHex(detail.gasLimit)}</span>
                </div>
                <div className="text-green-600">{formatDateTime(detail.timestamp)}</div>
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

