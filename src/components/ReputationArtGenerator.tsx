
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Palette, Sparkles } from "lucide-react";

interface ReputationArtProps {
  walletAddress: string;
  overallScore: number;
  metrics: {
    totalTransactions: number;
    totalVolume: number;
    gasSpent: number;
    uniqueContracts: number;
    activeDays: number;
    diversityScore: number;
    transactionFrequency: number;
    firstTransactionAge: number;
  };
  scoreBreakdown: {
    activity: number;
    volume: number;
    consistency: number;
    diversity: number;
    longevity: number;
    gasEfficiency: number;
  };
  isDarkMode?: boolean;
  isLoreMode?: boolean;
}

const ReputationArtGenerator = ({ 
  walletAddress, 
  overallScore, 
  metrics, 
  scoreBreakdown, 
  isDarkMode = true,
  isLoreMode = false 
}: ReputationArtProps) => {

  const artData = useMemo(() => {
    // Generate deterministic "random" values based on wallet address
    const hash = walletAddress.slice(2); // Remove 0x
    const seed = parseInt(hash.slice(0, 8), 16);
    
    // Pseudo-random number generator
    let rng = seed;
    const random = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    // Generate colors based on scores
    const primaryHue = (scoreBreakdown.activity / 100) * 360;
    const secondaryHue = (scoreBreakdown.diversity / 100) * 360;
    const tertiaryHue = (scoreBreakdown.longevity / 100) * 360;

    // Generate geometric patterns
    const patterns = [];
    const numShapes = Math.max(5, Math.min(20, Math.floor(metrics.totalTransactions / 10)));
    
    for (let i = 0; i < numShapes; i++) {
      const x = random() * 400;
      const y = random() * 400;
      const size = (scoreBreakdown.volume / 100) * 30 + 10;
      const rotation = random() * 360;
      const opacity = 0.3 + (scoreBreakdown.consistency / 100) * 0.7;
      
      patterns.push({
        x,
        y,
        size,
        rotation,
        opacity,
        hue: primaryHue + (random() - 0.5) * 60,
        type: random() > 0.5 ? 'circle' : 'polygon'
      });
    }

    // Generate connection lines based on contract interactions
    const connections = [];
    const numConnections = Math.min(15, metrics.uniqueContracts);
    
    for (let i = 0; i < numConnections; i++) {
      connections.push({
        x1: random() * 400,
        y1: random() * 400,
        x2: random() * 400,
        y2: random() * 400,
        opacity: 0.1 + (scoreBreakdown.gasEfficiency / 100) * 0.4
      });
    }

    // Generate central mandala based on overall score
    const mandalaRings = [];
    const numRings = Math.max(3, Math.min(8, Math.floor(overallScore / 15)));
    
    for (let i = 0; i < numRings; i++) {
      const radius = 30 + (i * 20);
      const segments = 6 + (i * 2);
      mandalaRings.push({
        radius,
        segments,
        hue: (primaryHue + (i * 30)) % 360,
        opacity: 0.4 + (i / numRings) * 0.6
      });
    }

    return {
      patterns,
      connections,
      mandalaRings,
      primaryHue,
      secondaryHue,
      tertiaryHue,
      background: `hsl(${primaryHue}, 20%, ${isDarkMode ? '10%' : '95%'})`
    };
  }, [walletAddress, overallScore, metrics, scoreBreakdown, isDarkMode]);

  const downloadSVG = () => {
    const svgElement = document.getElementById('reputation-art-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallet-reputation-${walletAddress.slice(0, 8)}.svg`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className={`${
        isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Palette className="w-6 h-6 text-purple-400" />
            <span>{isLoreMode ? 'Mind Essence Art' : 'Reputation Pattern'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {/* Generated Art */}
            <div className={`relative rounded-lg p-4 ${
              isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'
            }`}>
              <svg
                id="reputation-art-svg"
                width="400"
                height="400"
                viewBox="0 0 400 400"
                className="border rounded-lg"
                style={{ background: artData.background }}
              >
                {/* Background gradient */}
                <defs>
                  <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={`hsl(${artData.primaryHue}, 30%, ${isDarkMode ? '20%' : '90%'})`} />
                    <stop offset="100%" stopColor={`hsl(${artData.secondaryHue}, 20%, ${isDarkMode ? '10%' : '95%'})`} />
                  </radialGradient>
                  
                  {/* Pattern for textures */}
                  <pattern id="texture" patternUnits="userSpaceOnUse" width="4" height="4">
                    <circle cx="2" cy="2" r="0.5" fill={`hsl(${artData.tertiaryHue}, 50%, 50%)`} opacity="0.1" />
                  </pattern>
                </defs>

                {/* Background */}
                <rect width="400" height="400" fill="url(#bgGradient)" />
                <rect width="400" height="400" fill="url(#texture)" />

                {/* Connection lines (representing contract interactions) */}
                {artData.connections.map((conn, i) => (
                  <line
                    key={`conn-${i}`}
                    x1={conn.x1}
                    y1={conn.y1}
                    x2={conn.x2}
                    y2={conn.y2}
                    stroke={`hsl(${artData.secondaryHue}, 60%, 60%)`}
                    strokeWidth="1"
                    opacity={conn.opacity}
                  />
                ))}

                {/* Central mandala (based on overall score) */}
                <g transform="translate(200, 200)">
                  {artData.mandalaRings.map((ring, i) => (
                    <g key={`ring-${i}`}>
                      {Array.from({ length: ring.segments }).map((_, j) => {
                        const angle = (j / ring.segments) * 2 * Math.PI;
                        const x = Math.cos(angle) * ring.radius;
                        const y = Math.sin(angle) * ring.radius;
                        return (
                          <circle
                            key={`ring-${i}-${j}`}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={`hsl(${ring.hue}, 70%, 60%)`}
                            opacity={ring.opacity}
                          />
                        );
                      })}
                    </g>
                  ))}
                </g>

                {/* Scattered patterns (based on transaction data) */}
                {artData.patterns.map((pattern, i) => (
                  <g key={`pattern-${i}`} transform={`translate(${pattern.x}, ${pattern.y}) rotate(${pattern.rotation})`}>
                    {pattern.type === 'circle' ? (
                      <circle
                        r={pattern.size}
                        fill={`hsl(${pattern.hue}, 60%, 60%)`}
                        opacity={pattern.opacity}
                      />
                    ) : (
                      <polygon
                        points={`0,${-pattern.size} ${pattern.size * 0.866},${pattern.size * 0.5} ${-pattern.size * 0.866},${pattern.size * 0.5}`}
                        fill={`hsl(${pattern.hue}, 60%, 60%)`}
                        opacity={pattern.opacity}
                      />
                    )}
                  </g>
                ))}

                {/* Score text overlay */}
                <text
                  x="200"
                  y="350"
                  textAnchor="middle"
                  fontSize="24"
                  fontWeight="bold"
                  fill={`hsl(${artData.primaryHue}, 80%, 70%)`}
                  opacity="0.8"
                >
                  {overallScore}
                </text>
                <text
                  x="200"
                  y="370"
                  textAnchor="middle"
                  fontSize="12"
                  fill={`hsl(${artData.primaryHue}, 60%, 60%)`}
                  opacity="0.6"
                >
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
                </text>
              </svg>
            </div>

            {/* Art Metadata */}
            <div className={`grid grid-cols-2 gap-4 w-full max-w-md text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <div className="text-center">
                <div className="font-semibold">Pattern Complexity</div>
                <div>{artData.patterns.length} elements</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Connection Density</div>
                <div>{artData.connections.length} links</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Mandala Rings</div>
                <div>{artData.mandalaRings.length} layers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Rarity Score</div>
                <div className={`font-bold ${
                  overallScore >= 80 ? 'text-yellow-400' :
                  overallScore >= 60 ? 'text-purple-400' :
                  overallScore >= 40 ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {overallScore >= 80 ? 'Legendary' :
                   overallScore >= 60 ? 'Epic' :
                   overallScore >= 40 ? 'Rare' : 'Common'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={downloadSVG}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Art
              </Button>
              <Button
                variant="outline"
                className={`${
                  isDarkMode 
                    ? 'border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700/50' 
                    : 'border-gray-300 bg-white/80 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoreMode ? 'Mint Mind Essence' : 'Mint as NFT'}
              </Button>
            </div>

            {/* Art Description */}
            <div className={`text-center max-w-md text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p>
                {isLoreMode 
                  ? 'This unique mind essence pattern represents the digital consciousness of your wallet, with each element reflecting your blockchain journey and authenticity.'
                  : 'This unique pattern is generated from your wallet\'s transaction history, reputation score, and on-chain behavior. Each element is deterministic and represents different aspects of your blockchain activity.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReputationArtGenerator;
