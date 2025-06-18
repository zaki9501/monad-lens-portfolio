
import React, { useEffect, useRef } from 'react';
import { validators } from '@/utils/validatorData';

interface ValidatorWorldMapProps {
  activeValidators: number;
  className?: string;
}

const ValidatorWorldMap = ({ activeValidators, className = "" }: ValidatorWorldMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 300;
    canvas.height = 180;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw world map outline (simplified continents)
    drawWorldOutline(ctx, canvas.width, canvas.height);

    // Draw validator markers
    drawValidatorMarkers(ctx, canvas.width, canvas.height);

  }, [activeValidators]);

  const drawWorldOutline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#10b981'; // green-500
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    // Simple world map outline
    // North America
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.3);
    ctx.lineTo(width * 0.25, height * 0.25);
    ctx.lineTo(width * 0.35, height * 0.35);
    ctx.lineTo(width * 0.3, height * 0.5);
    ctx.lineTo(width * 0.15, height * 0.45);
    ctx.closePath();
    ctx.stroke();

    // Europe
    ctx.beginPath();
    ctx.moveTo(width * 0.45, height * 0.25);
    ctx.lineTo(width * 0.55, height * 0.22);
    ctx.lineTo(width * 0.58, height * 0.35);
    ctx.lineTo(width * 0.52, height * 0.4);
    ctx.lineTo(width * 0.45, height * 0.35);
    ctx.closePath();
    ctx.stroke();

    // Asia
    ctx.beginPath();
    ctx.moveTo(width * 0.6, height * 0.2);
    ctx.lineTo(width * 0.85, height * 0.18);
    ctx.lineTo(width * 0.9, height * 0.4);
    ctx.lineTo(width * 0.75, height * 0.45);
    ctx.lineTo(width * 0.6, height * 0.4);
    ctx.closePath();
    ctx.stroke();

    // Australia
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.75, 15, 0, 2 * Math.PI);
    ctx.stroke();

    // Africa
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.45);
    ctx.lineTo(width * 0.58, height * 0.42);
    ctx.lineTo(width * 0.6, height * 0.7);
    ctx.lineTo(width * 0.52, height * 0.75);
    ctx.lineTo(width * 0.47, height * 0.65);
    ctx.closePath();
    ctx.stroke();

    // South America
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.52);
    ctx.lineTo(width * 0.35, height * 0.5);
    ctx.lineTo(width * 0.38, height * 0.8);
    ctx.lineTo(width * 0.32, height * 0.85);
    ctx.lineTo(width * 0.28, height * 0.75);
    ctx.closePath();
    ctx.stroke();

    ctx.globalAlpha = 1;
  };

  const drawValidatorMarkers = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Country to pixel mapping (approximate)
    const countryToPixel: { [key: string]: [number, number] } = {
      'US': [width * 0.22, height * 0.4],
      'CA': [width * 0.18, height * 0.25],
      'RO': [width * 0.54, height * 0.32],
      'FR': [width * 0.48, height * 0.35],
      'DE': [width * 0.52, height * 0.3],
      'IE': [width * 0.44, height * 0.28],
      'KR': [width * 0.82, height * 0.38],
      'SG': [width * 0.78, height * 0.58],
      'FI': [width * 0.55, height * 0.18],
      'NL': [width * 0.5, height * 0.28],
      'LT': [width * 0.56, height * 0.25],
      'SE': [width * 0.54, height * 0.15],
      'AT': [width * 0.53, height * 0.33],
      'IN': [width * 0.72, height * 0.48],
      'ZA': [width * 0.55, height * 0.78],
      'JP': [width * 0.87, height * 0.38],
      'PL': [width * 0.55, height * 0.28],
      'AU': [width * 0.8, height * 0.75],
      'TR': [width * 0.58, height * 0.4],
    };

    // Group validators by country and count them
    const countryValidatorCount: { [key: string]: number } = {};
    validators.forEach(validator => {
      if (validator.status === 'active') {
        countryValidatorCount[validator.country] = (countryValidatorCount[validator.country] || 0) + 1;
      }
    });

    // Draw markers for each country
    Object.entries(countryValidatorCount).forEach(([country, count]) => {
      const position = countryToPixel[country];
      if (!position) return;

      const [x, y] = position;
      
      // Marker size based on validator count
      const baseSize = 3;
      const size = baseSize + Math.log(count) * 2;

      // Glow effect
      ctx.shadowColor = '#06b6d4'; // cyan
      ctx.shadowBlur = 8;
      
      // Main marker
      ctx.fillStyle = '#06b6d4'; // cyan
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();

      // Inner bright dot
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.4, 0, 2 * Math.PI);
      ctx.fill();

      // Pulse animation ring
      const time = Date.now() * 0.003;
      const pulseSize = size + Math.sin(time + x * 0.1) * 2;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-green-900/30 rounded-lg bg-gray-900/20"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="absolute top-2 left-2 text-xs text-green-400 font-mono">
        Global Network
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-cyan-400 font-mono">
        {Object.keys(validators.reduce((acc, v) => {
          if (v.status === 'active') acc[v.country] = true;
          return acc;
        }, {} as Record<string, boolean>)).length} regions
      </div>
    </div>
  );
};

export default ValidatorWorldMap;
