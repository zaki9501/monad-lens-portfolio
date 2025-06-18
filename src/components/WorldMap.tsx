
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { validators } from '@/utils/validatorData';

const WorldMap = () => {
  // Group validators by country for display
  const validatorsByCountry = validators.reduce((acc, validator) => {
    if (!acc[validator.country]) {
      acc[validator.country] = [];
    }
    acc[validator.country].push(validator);
    return acc;
  }, {} as Record<string, typeof validators>);

  // Convert latitude/longitude to SVG coordinates
  const latLngToSvg = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  return (
    <Card className="bg-gray-900/30 border-green-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-400 text-sm">GLOBAL VALIDATOR NETWORK</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-96 bg-gradient-to-b from-blue-950/50 to-blue-900/30 rounded-lg overflow-hidden">
          <svg
            viewBox="0 0 800 400"
            className="w-full h-full"
          >
            {/* World map paths - simplified continents with glowing green outline */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* North America */}
            <path
              d="M 120 80 Q 140 70 180 80 Q 220 85 240 100 Q 250 120 245 140 Q 240 160 230 180 Q 220 200 200 210 Q 180 215 160 210 Q 140 200 130 180 Q 120 160 115 140 Q 110 120 115 100 Q 118 90 120 80 Z"
              fill="none"
              stroke="#00ff41"
              strokeWidth="2"
              filter="url(#glow)"
              className="animate-pulse"
            />
            
            {/* South America */}
            <path
              d="M 180 220 Q 200 215 210 235 Q 215 255 210 275 Q 205 295 195 315 Q 185 335 175 350 Q 165 340 160 320 Q 155 300 160 280 Q 165 260 170 240 Q 175 225 180 220 Z"
              fill="none"
              stroke="#00ff41"
              strokeWidth="2"
              filter="url(#glow)"
              className="animate-pulse"
            />
            
            {/* Europe */}
            <path
              d="M 380 80 Q 400 75 420 80 Q 440 85 450 100 Q 455 115 450 130 Q 445 145 435 155 Q 425 160 415 155 Q 405 150 395 145 Q 385 135 380 120 Q 375 105 375 90 Q 377 85 380 80 Z"
              fill="none"
              stroke="#00ff41"
              strokeWidth="2"
              filter="url(#glow)"
              className="animate-pulse"
            />
            
            {/* Africa */}
            <path
              d="M 370 160 Q 390 155 410 165 Q 425 175 430 195 Q 435 215 430 235 Q 425 255 415 270 Q 405 285 390 290 Q 375 285 365 270 Q 355 255 360 235 Q 365 215 370 195 Q 372 175 370 160 Z"
              fill="none"
              stroke="#00ff41"
              strokeWidth="2"
              filter="url(#glow)"
              className="animate-pulse"
            />
            
            {/* Asia */}
            <path
              d="M 460 70 Q 500 65 540 75 Q 580 85 610 100 Q 630 115 635 135 Q 640 155 630 170 Q 620 185 600 190 Q 580 185 560 180 Q 540 175 520 165 Q 500 155 485 140 Q 470 125 465 105 Q 462 85 460 70 Z"
              fill="none"
              stroke="#00ff41"
              strokeWidth="2"
              filter="url(#glow)"
              className="animate-pulse"
            />
            
            {/* Australia */}
            <path
              d="M 580 280 Q 610 275 635 285 Q 650 295 655 310 Q 650 325 635 330 Q 620 325 605 320 Q 590 315 585 300 Q 582 290 580 280 Z"
              fill="none"
              stroke="#00ff41"
              strokeWidth="2"
              filter="url(#glow)"
              className="animate-pulse"
            />

            {/* Validator markers */}
            {Object.entries(validatorsByCountry).map(([country, countryValidators]) => {
              if (countryValidators.length > 0 && countryValidators[0].coordinates) {
                const [lat, lng] = countryValidators[0].coordinates;
                const { x, y } = latLngToSvg(lat, lng);
                
                return (
                  <g key={country}>
                    {/* Pulsing circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="#00ff41"
                      opacity="0.3"
                      className="animate-ping"
                    />
                    {/* Main marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#00ff41"
                      stroke="#ffffff"
                      strokeWidth="1"
                      filter="url(#glow)"
                    />
                    {/* Validator count */}
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="text-xs fill-green-400 font-mono"
                      filter="url(#glow)"
                    >
                      {countryValidators.length}
                    </text>
                  </g>
                );
              }
              return null;
            })}
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Active Validators</span>
            </div>
            <div className="text-green-600">
              Total: {validators.length} validators across {Object.keys(validatorsByCountry).length} regions
            </div>
          </div>
          
          {/* Stats */}
          <div className="absolute top-4 right-4 space-y-1">
            <Badge variant="outline" className="border-green-600 text-green-400">
              Global Coverage: {Object.keys(validatorsByCountry).length} Countries
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldMap;
