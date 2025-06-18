
import React, { useEffect, useRef } from 'react';
import { validators } from '@/utils/validatorData';

interface WorldValidatorMapProps {
  activeValidators: number;
  className?: string;
}

const WorldValidatorMap = ({ activeValidators, className = "" }: WorldValidatorMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for larger display
    canvas.width = 800;
    canvas.height = 400;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw detailed world map
    drawDetailedWorldMap(ctx, canvas.width, canvas.height);

    // Draw validator markers
    drawValidatorMarkers(ctx, canvas.width, canvas.height);

  }, [activeValidators]);

  const drawDetailedWorldMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#059669'; // emerald-600
    ctx.fillStyle = '#064e3b'; // emerald-900
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;

    // North America
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.25);
    ctx.lineTo(width * 0.08, height * 0.15);
    ctx.lineTo(width * 0.15, height * 0.12);
    ctx.lineTo(width * 0.22, height * 0.18);
    ctx.lineTo(width * 0.28, height * 0.15);
    ctx.lineTo(width * 0.32, height * 0.22);
    ctx.lineTo(width * 0.35, height * 0.32);
    ctx.lineTo(width * 0.28, height * 0.45);
    ctx.lineTo(width * 0.25, height * 0.55);
    ctx.lineTo(width * 0.18, height * 0.58);
    ctx.lineTo(width * 0.12, height * 0.52);
    ctx.lineTo(width * 0.08, height * 0.45);
    ctx.lineTo(width * 0.05, height * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // South America
    ctx.beginPath();
    ctx.moveTo(width * 0.25, height * 0.58);
    ctx.lineTo(width * 0.32, height * 0.55);
    ctx.lineTo(width * 0.38, height * 0.62);
    ctx.lineTo(width * 0.42, height * 0.72);
    ctx.lineTo(width * 0.38, height * 0.85);
    ctx.lineTo(width * 0.32, height * 0.88);
    ctx.lineTo(width * 0.28, height * 0.82);
    ctx.lineTo(width * 0.25, height * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Europe
    ctx.beginPath();
    ctx.moveTo(width * 0.45, height * 0.18);
    ctx.lineTo(width * 0.52, height * 0.15);
    ctx.lineTo(width * 0.58, height * 0.18);
    ctx.lineTo(width * 0.62, height * 0.25);
    ctx.lineTo(width * 0.58, height * 0.35);
    ctx.lineTo(width * 0.52, height * 0.38);
    ctx.lineTo(width * 0.45, height * 0.35);
    ctx.lineTo(width * 0.42, height * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Africa
    ctx.beginPath();
    ctx.moveTo(width * 0.48, height * 0.38);
    ctx.lineTo(width * 0.55, height * 0.35);
    ctx.lineTo(width * 0.62, height * 0.42);
    ctx.lineTo(width * 0.65, height * 0.55);
    ctx.lineTo(width * 0.62, height * 0.72);
    ctx.lineTo(width * 0.55, height * 0.78);
    ctx.lineTo(width * 0.48, height * 0.75);
    ctx.lineTo(width * 0.45, height * 0.65);
    ctx.lineTo(width * 0.46, height * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Asia
    ctx.beginPath();
    ctx.moveTo(width * 0.62, height * 0.15);
    ctx.lineTo(width * 0.75, height * 0.12);
    ctx.lineTo(width * 0.88, height * 0.18);
    ctx.lineTo(width * 0.92, height * 0.28);
    ctx.lineTo(width * 0.88, height * 0.42);
    ctx.lineTo(width * 0.82, height * 0.48);
    ctx.lineTo(width * 0.75, height * 0.45);
    ctx.lineTo(width * 0.68, height * 0.42);
    ctx.lineTo(width * 0.62, height * 0.35);
    ctx.lineTo(width * 0.60, height * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Australia
    ctx.beginPath();
    ctx.arc(width * 0.82, height * 0.75, 25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Greenland
    ctx.beginPath();
    ctx.moveTo(width * 0.32, height * 0.08);
    ctx.lineTo(width * 0.38, height * 0.05);
    ctx.lineTo(width * 0.42, height * 0.12);
    ctx.lineTo(width * 0.38, height * 0.18);
    ctx.lineTo(width * 0.32, height * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1;
  };

  const drawValidatorMarkers = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Country to pixel mapping for the larger map
    const countryToPixel: { [key: string]: [number, number] } = {
      'US': [width * 0.22, height * 0.35],
      'CA': [width * 0.18, height * 0.25],
      'RO': [width * 0.56, height * 0.32],
      'FR': [width * 0.48, height * 0.32],
      'DE': [width * 0.52, height * 0.28],
      'IE': [width * 0.44, height * 0.25],
      'KR': [width * 0.85, height * 0.38],
      'SG': [width * 0.78, height * 0.52],
      'FI': [width * 0.55, height * 0.18],
      'NL': [width * 0.50, height * 0.25],
      'LT': [width * 0.58, height * 0.22],
      'SE': [width * 0.54, height * 0.15],
      'AT': [width * 0.53, height * 0.30],
      'IN': [width * 0.72, height * 0.45],
      'ZA': [width * 0.58, height * 0.78],
      'JP': [width * 0.90, height * 0.38],
      'PL': [width * 0.55, height * 0.25],
      'AU': [width * 0.82, height * 0.75],
      'TR': [width * 0.60, height * 0.38],
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
      const baseSize = 4;
      const size = baseSize + Math.log(count) * 3;

      // Animated pulse ring
      const time = Date.now() * 0.002;
      const pulseSize = size + Math.sin(time + x * 0.1) * 3;
      
      // Outer glow
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#06b6d4';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, 2 * Math.PI);
      ctx.fill();

      // Main marker
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#06b6d4';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();

      // Inner bright dot
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.4, 0, 2 * Math.PI);
      ctx.fill();

      // Validator count label
      if (count > 1) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(count.toString(), x, y - size - 8);
      }
    });

    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-emerald-900/30 rounded-lg bg-gray-900/20"
        style={{ imageRendering: 'auto' }}
      />
      <div className="absolute top-3 left-3 text-sm text-emerald-400 font-mono">
        Global Validator Network
      </div>
      <div className="absolute top-3 right-3 text-sm text-cyan-400 font-mono">
        {Object.keys(validators.reduce((acc, v) => {
          if (v.status === 'active') acc[v.country] = true;
          return acc;
        }, {} as Record<string, boolean>)).length} countries
      </div>
      <div className="absolute bottom-3 left-3 text-sm text-emerald-600 font-mono">
        {activeValidators} active validators
      </div>
    </div>
  );
};

export default WorldValidatorMap;
