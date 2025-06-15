import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Ship } from "lucide-react";

interface BlockRadarBlip {
  id: string;
  angle: number; // radians
  radius: number; // [0, 1], 1=at edge, 0=at center
  detail: any;
  detectedAt: number;
  startingRadius: number;
}

interface RadarOverlayProps {
  recentBlocks: any[];
  onSelectBlock: (block: any) => void;
  selectedBlockHash: string | null;
}

const RADAR_SWEEP_TIME = 4000;
const SHIP_MOVE_TIME = 7000;

function useFakeWaveData(maxPoints: number = 30) {
  const [data, setData] = useState<{ t: number; v: number }[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      setData((old) => [
        ...old.slice(-(maxPoints - 1)),
        {
          t: Date.now(),
          v: Math.floor(16 + Math.random() * 11 + 7 * Math.sin(Math.random() * 3.14)),
        },
      ]);
    }, 340);
    return () => clearInterval(interval);
  }, [maxPoints]);
  return data;
}

// Helper: deterministic angle and radius for block
const getBlockAngle = (b: any) => {
  const blockNum = typeof b.number === "string" ? parseInt(b.number, 16) : b.number || 0;
  const time = typeof b.timestamp === "string" ? parseInt(b.timestamp, 16) : 0;
  return (((blockNum || 1) * 117 + (time || 1) * 47) % 1000) / 1000 * 2 * Math.PI;
};
const getInitBlockRadius = (b: any) =>
  0.91 + 0.09 * (((typeof b.number === "string" ? parseInt(b.number, 16) : b.number || 7) % 700) / 700); // start near edge
const finalRadius = 0.49; // ships go toward center to this limit

const RadarOverlay: React.FC<RadarOverlayProps> = ({
  recentBlocks,
  onSelectBlock,
  selectedBlockHash,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ships, setShips] = useState<BlockRadarBlip[]>([]);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [dimensions, setDimensions] = useState({ w: 400, h: 400 });
  const waveData = useFakeWaveData();
  const [selectedShip, setSelectedShip] = useState<BlockRadarBlip | null>(null);

  useEffect(() => {
    function handleResize() {
      const size = Math.min(window.innerWidth, 400, window.innerHeight * 0.6);
      setDimensions({ w: size, h: size });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sweep animation
  useEffect(() => {
    let id: number;
    let last = performance.now();
    function animate(now: number) {
      const elapsed = now - last;
      last = now;
      setSweepAngle((prev) => (prev + (2 * Math.PI * elapsed) / RADAR_SWEEP_TIME) % (2 * Math.PI));
      id = requestAnimationFrame(animate);
    }
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  // We will adapt the contract data to look like blocks for radar purposes
  useEffect(() => {
    if (!recentBlocks.length) return;
    const seen: { [hash: string]: boolean } = {};
    const ret: BlockRadarBlip[] = [];
    let n = 0;
    for (let b of recentBlocks) {
      if (n > 6) break;
      // Use contract address as equivalent to block hash for uniqueness
      const id = b.contract_address || b.hash;
      if (!id || seen[id]) continue;
      seen[id] = true;
      ret.push({
        id: id,
        angle: getBlockAngle(b),
        radius: getInitBlockRadius(b),
        startingRadius: getInitBlockRadius(b),
        detail: b,
        detectedAt: Date.now(),
      });
      n++;
    }
    setShips(ret);
  }, [recentBlocks]);

  // Animate ships moving toward the center
  useEffect(() => {
    let animId: number;
    function step() {
      setShips((oldShips) =>
        oldShips.map((ship) => {
          const elapsed = Math.min(Date.now() - ship.detectedAt, SHIP_MOVE_TIME);
          // Slow move to center: easeOutQuad
          const r = ship.startingRadius - (ship.startingRadius - finalRadius) * (elapsed / SHIP_MOVE_TIME) ** 0.7;
          return { ...ship, radius: r };
        })
      );
      animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Draw radar & ships
  useEffect(() => {
    const { w, h } = dimensions;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    // Radar grid/circles
    ctx.save();
    ctx.strokeStyle = "#00FF66";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.19;
    for (let r = 1; r <= 4; r++) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, (w / 2) * (r / 4), 0, 2 * Math.PI);
      ctx.stroke();
    }
    // cross lines
    for (let l = 0; l < 4; l++) {
      ctx.beginPath();
      const a = l * (Math.PI / 2);
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + (w / 2) * Math.cos(a), h / 2 + (h / 2) * Math.sin(a));
      ctx.stroke();
    }
    ctx.restore();

    // Radar sweep arc
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

    // Draw SHIP for each blip
    for (let shipData of ships) {
      // Fades out at the center
      const finished = shipData.radius <= finalRadius + 0.01;
      const fade = finished ? 0.25 : 0.9;

      const shipR = (w / 2) * shipData.radius;
      const bx = w / 2 + shipR * Math.cos(shipData.angle);
      const by = h / 2 + shipR * Math.sin(shipData.angle);

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(shipData.angle - Math.PI / 2); // up points to radar center
      ctx.globalAlpha = fade * (shipData.id === selectedBlockHash ? 1 : 0.85);

      // Draw "ship" icon using vector equivalent (as before, triangle+tail)
      ctx.beginPath();
      ctx.moveTo(0, -14); // nose
      ctx.lineTo(8, 10);
      ctx.lineTo(0, 4);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fillStyle = shipData.id === selectedBlockHash ? "#fff" : "#00ffb9";
      ctx.shadowColor = "#00ffd0";
      ctx.shadowBlur = shipData.id === selectedBlockHash ? 18 : 10;
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(3, 16);
      ctx.lineTo(-3, 16);
      ctx.closePath();
      ctx.fillStyle = "#24e7b6";
      ctx.globalAlpha = fade * 0.61;
      ctx.shadowBlur = 0;
      ctx.fill();

      ctx.restore();
    }
  }, [ships, sweepAngle, dimensions, selectedBlockHash]);

  // Register click to select block by ship position and set selected ship
  const handleRadarClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const { w, h } = dimensions;
    let found: BlockRadarBlip | null = null;
    ships.forEach((ship) => {
      const shipR = (w / 2) * ship.radius;
      const bx = w / 2 + shipR * Math.cos(ship.angle);
      const by = h / 2 + shipR * Math.sin(ship.angle);
      const dist = Math.sqrt((x - bx) ** 2 + (y - by) ** 2);
      if (dist < 18 && (!found || ship.detectedAt > found.detectedAt)) found = ship;
    });
    if (found) {
      onSelectBlock(found.detail);
      setSelectedShip(found);
    }
  };

  // Calculate latitude, longitude, radius of selected ship (if present)
  let latitude = "--", longitude = "--", radiusPct = "--";
  if (ships.length && selectedBlockHash) {
    const sel = ships.find(s => s.id === selectedBlockHash);
    if (sel) {
      // Longitude: angle (radians) converted to degrees [-180, 180]
      longitude = ((sel.angle * 180) / Math.PI - 180).toFixed(1);
      // Latitude: simulate as "vertical" angle from center, scaling by radius
      // For this radar, it's "0" at equator, so for demo:
      latitude = (90 * sel.radius * Math.sin(sel.angle)).toFixed(1);
      // Radius %: how close to edge
      radiusPct = (100 * sel.radius).toFixed(1);
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto min-h-[400px] relative gap-3">
      {/* Centered Radar canvas */}
      <div className="relative flex justify-center items-center" style={{ width: dimensions.w, height: dimensions.h }}>
        <canvas
          ref={canvasRef}
          width={dimensions.w}
          height={dimensions.h}
          className="rounded-full border border-green-700/60 bg-black shadow-2xl hover-scale"
          style={{
            width: dimensions.w,
            height: dimensions.h,
            boxShadow: '0 0 50px #00ff88, 0 0 4px #111'
          }}
          onClick={handleRadarClick}
        />
        <div className="absolute left-2 bottom-1 text-green-400 text-xs font-mono uppercase select-none opacity-70 pointer-events-none">Live Block Radar</div>
      </div>

      {/* Overlays for geographic/radar details */}
      <div className="w-full flex flex-row items-center justify-center gap-8 mt-2">
        <div className="flex flex-col items-center font-mono text-xs text-green-400">
          <span className="text-green-700">Longitude</span>
          <span>{longitude}°</span>
        </div>
        <div className="flex flex-col items-center font-mono text-xs text-green-400">
          <span className="text-green-700">Latitude</span>
          <span>{latitude}°</span>
        </div>
        <div className="flex flex-col items-center font-mono text-xs text-green-400">
          <span className="text-green-700">Radar Radius</span>
          <span>{radiusPct}%</span>
        </div>
      </div>

      {/* Right: block details panel not rendered here; it's shown by caller */}
    </div>
  );
};

export default RadarOverlay;
