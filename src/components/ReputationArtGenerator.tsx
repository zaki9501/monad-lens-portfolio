
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Palette, Sparkles, AlertTriangle, Wallet } from "lucide-react";

import EagerMintDialog from "@/components/EagerMintDialog";

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
  isOwner?: boolean;  // New prop
  connectedWallet?: string;  // New prop
  onWalletConnect?: () => void;  // New prop
}

const ReputationArtGenerator = ({ 
  walletAddress, 
  overallScore, 
  metrics, 
  scoreBreakdown, 
  isDarkMode = true,
  isLoreMode = false,
  isOwner = false,
  connectedWallet,
  onWalletConnect
}: ReputationArtProps) => {

  const artData = useMemo(() => {
    // Generate deterministic "random" values based on wallet address
    const hash = walletAddress.slice(2);
    const seed = parseInt(hash.slice(0, 8), 16);
    
    let rng = seed;
    const random = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    // Enhanced color palette based on scores
    const primaryHue = (scoreBreakdown.activity / 100) * 360;
    const secondaryHue = (scoreBreakdown.diversity / 100) * 360;
    const tertiaryHue = (scoreBreakdown.longevity / 100) * 360;
    const accentHue = (scoreBreakdown.volume / 100) * 360;

    // Generate sophisticated geometric patterns with varying complexity
    const patterns = [];
    const numShapes = Math.max(8, Math.min(30, Math.floor(metrics.totalTransactions / 5)));
    
    for (let i = 0; i < numShapes; i++) {
      const x = 50 + random() * 300; // Keep within bounds
      const y = 50 + random() * 300;
      const size = (scoreBreakdown.volume / 100) * 40 + 8;
      const rotation = random() * 360;
      const opacity = 0.4 + (scoreBreakdown.consistency / 100) * 0.6;
      const complexity = Math.floor(random() * 4) + 3; // 3-6 sided polygons
      
      patterns.push({
        x, y, size, rotation, opacity, complexity,
        hue: primaryHue + (random() - 0.5) * 120,
        saturation: 60 + random() * 40,
        lightness: 50 + random() * 30,
        type: random() > 0.3 ? 'polygon' : 'circle'
      });
    }

    // Generate flowing connection lines with curves
    const connections = [];
    const numConnections = Math.min(25, metrics.uniqueContracts * 2);
    
    for (let i = 0; i < numConnections; i++) {
      const x1 = 50 + random() * 300;
      const y1 = 50 + random() * 300;
      const x2 = 50 + random() * 300;
      const y2 = 50 + random() * 300;
      
      // Create flowing curves
      const cp1x = x1 + (random() - 0.5) * 100;
      const cp1y = y1 + (random() - 0.5) * 100;
      const cp2x = x2 + (random() - 0.5) * 100;
      const cp2y = y2 + (random() - 0.5) * 100;
      
      connections.push({
        x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y,
        opacity: 0.15 + (scoreBreakdown.gasEfficiency / 100) * 0.4,
        strokeWidth: 1 + random() * 2,
        hue: secondaryHue + (random() - 0.5) * 60
      });
    }

    // Generate elaborate central mandala
    const mandalaRings = [];
    const numRings = Math.max(4, Math.min(12, Math.floor(overallScore / 10)));
    
    for (let i = 0; i < numRings; i++) {
      const radius = 20 + (i * 15);
      const segments = 8 + (i * 3);
      const ringRotation = (i * 15) % 360;
      
      mandalaRings.push({
        radius,
        segments,
        ringRotation,
        hue: (primaryHue + (i * 25)) % 360,
        saturation: 70 + (i * 5),
        lightness: 45 + (i * 3),
        opacity: 0.6 + (i / numRings) * 0.4,
        shape: i % 3 === 0 ? 'diamond' : i % 2 === 0 ? 'circle' : 'star'
      });
    }

    // Generate particle effects
    const particles = [];
    const numParticles = Math.floor(overallScore / 2);
    
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: random() * 400,
        y: random() * 400,
        size: 1 + random() * 3,
        opacity: 0.3 + random() * 0.7,
        hue: accentHue + (random() - 0.5) * 180
      });
    }

    // Generate energy waves
    const waves = [];
    const numWaves = Math.floor(scoreBreakdown.activity / 20);
    
    for (let i = 0; i < numWaves; i++) {
      waves.push({
        centerX: 200,
        centerY: 200,
        radius: 30 + i * 40,
        opacity: 0.1 + (0.3 / (i + 1)),
        strokeWidth: 2,
        hue: tertiaryHue
      });
    }

    return {
      patterns,
      connections,
      mandalaRings,
      particles,
      waves,
      primaryHue,
      secondaryHue,
      tertiaryHue,
      accentHue,
      background: isDarkMode 
        ? `radial-gradient(circle at 30% 70%, hsl(${primaryHue}, 25%, 8%) 0%, hsl(${secondaryHue}, 20%, 5%) 50%, hsl(${tertiaryHue}, 15%, 3%) 100%)`
        : `radial-gradient(circle at 30% 70%, hsl(${primaryHue}, 30%, 95%) 0%, hsl(${secondaryHue}, 25%, 97%) 50%, hsl(${tertiaryHue}, 20%, 99%) 100%)`
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

  const handleConnectWallet = () => {
    if (onWalletConnect) {
      onWalletConnect();
    }
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
            <span>{isLoreMode ? 'Mind Essence Art' : 'Reputation Masterpiece'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {/* Generated High-Quality Art */}
            <div className={`relative rounded-xl p-6 shadow-2xl ${
              isDarkMode ? 'bg-slate-900/80' : 'bg-gray-50/80'
            }`}>
              <svg
                id="reputation-art-svg"
                width="400"
                height="400"
                viewBox="0 0 400 400"
                className="border-2 border-purple-400/30 rounded-lg shadow-inner"
                style={{ background: artData.background }}
              >
                <defs>
                  {/* Advanced gradients */}
                  <radialGradient id="primaryGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={`hsl(${artData.primaryHue}, 80%, 70%)`} stopOpacity="0.8" />
                    <stop offset="70%" stopColor={`hsl(${artData.secondaryHue}, 60%, 50%)`} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={`hsl(${artData.tertiaryHue}, 40%, 30%)`} stopOpacity="0.2" />
                  </radialGradient>
                  
                  <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={`hsl(${artData.accentHue}, 70%, 60%)`} />
                    <stop offset="100%" stopColor={`hsl(${artData.primaryHue}, 60%, 50%)`} />
                  </linearGradient>

                  {/* Enhanced texture patterns */}
                  <pattern id="particleTexture" patternUnits="userSpaceOnUse" width="20" height="20">
                    <circle cx="10" cy="10" r="1" fill={`hsl(${artData.accentHue}, 70%, 70%)`} opacity="0.3" />
                    <circle cx="5" cy="15" r="0.5" fill={`hsl(${artData.primaryHue}, 60%, 60%)`} opacity="0.4" />
                    <circle cx="15" cy="5" r="0.8" fill={`hsl(${artData.secondaryHue}, 65%, 65%)`} opacity="0.2" />
                  </pattern>

                  {/* Glow effects */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  <filter id="softGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Background with texture */}
                <rect width="400" height="400" fill="url(#primaryGradient)" />
                <rect width="400" height="400" fill="url(#particleTexture)" opacity="0.5" />

                {/* Energy waves */}
                {artData.waves.map((wave, i) => (
                  <circle
                    key={`wave-${i}`}
                    cx={wave.centerX}
                    cy={wave.centerY}
                    r={wave.radius}
                    fill="none"
                    stroke={`hsl(${wave.hue}, 60%, 60%)`}
                    strokeWidth={wave.strokeWidth}
                    opacity={wave.opacity}
                    filter="url(#softGlow)"
                  />
                ))}

                {/* Flowing connection curves */}
                {artData.connections.map((conn, i) => (
                  <path
                    key={`conn-${i}`}
                    d={`M ${conn.x1} ${conn.y1} C ${conn.cp1x} ${conn.cp1y}, ${conn.cp2x} ${conn.cp2y}, ${conn.x2} ${conn.y2}`}
                    stroke={`hsl(${conn.hue}, 60%, 60%)`}
                    strokeWidth={conn.strokeWidth}
                    fill="none"
                    opacity={conn.opacity}
                    filter="url(#softGlow)"
                  />
                ))}

                {/* Elaborate central mandala */}
                <g transform="translate(200, 200)">
                  {artData.mandalaRings.map((ring, i) => (
                    <g key={`ring-${i}`} transform={`rotate(${ring.ringRotation})`}>
                      {Array.from({ length: ring.segments }).map((_, j) => {
                        const angle = (j / ring.segments) * 2 * Math.PI;
                        const x = Math.cos(angle) * ring.radius;
                        const y = Math.sin(angle) * ring.radius;
                        
                        if (ring.shape === 'diamond') {
                          return (
                            <polygon
                              key={`ring-${i}-${j}`}
                              points={`${x},${y-4} ${x+3},${y} ${x},${y+4} ${x-3},${y}`}
                              fill={`hsl(${ring.hue}, ${ring.saturation}%, ${ring.lightness}%)`}
                              opacity={ring.opacity}
                              filter="url(#glow)"
                            />
                          );
                        } else if (ring.shape === 'star') {
                          return (
                            <polygon
                              key={`ring-${i}-${j}`}
                              points={`${x},${y-3} ${x+1},${y-1} ${x+3},${y} ${x+1},${y+1} ${x},${y+3} ${x-1},${y+1} ${x-3},${y} ${x-1},${y-1}`}
                              fill={`hsl(${ring.hue}, ${ring.saturation}%, ${ring.lightness}%)`}
                              opacity={ring.opacity}
                              filter="url(#glow)"
                            />
                          );
                        } else {
                          return (
                            <circle
                              key={`ring-${i}-${j}`}
                              cx={x}
                              cy={y}
                              r="3"
                              fill={`hsl(${ring.hue}, ${ring.saturation}%, ${ring.lightness}%)`}
                              opacity={ring.opacity}
                              filter="url(#glow)"
                            />
                          );
                        }
                      })}
                    </g>
                  ))}
                </g>

                {/* Sophisticated scattered patterns */}
                {artData.patterns.map((pattern, i) => (
                  <g key={`pattern-${i}`} transform={`translate(${pattern.x}, ${pattern.y}) rotate(${pattern.rotation})`}>
                    {pattern.type === 'circle' ? (
                      <circle
                        r={pattern.size}
                        fill={`hsl(${pattern.hue}, ${pattern.saturation}%, ${pattern.lightness}%)`}
                        opacity={pattern.opacity}
                        filter="url(#glow)"
                      />
                    ) : (
                      <polygon
                        points={Array.from({ length: pattern.complexity }, (_, j) => {
                          const angle = (j / pattern.complexity) * 2 * Math.PI;
                          const x = Math.cos(angle) * pattern.size;
                          const y = Math.sin(angle) * pattern.size;
                          return `${x},${y}`;
                        }).join(' ')}
                        fill={`hsl(${pattern.hue}, ${pattern.saturation}%, ${pattern.lightness}%)`}
                        opacity={pattern.opacity}
                        filter="url(#glow)"
                      />
                    )}
                  </g>
                ))}

                {/* Floating particles */}
                {artData.particles.map((particle, i) => (
                  <circle
                    key={`particle-${i}`}
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.size}
                    fill={`hsl(${particle.hue}, 80%, 70%)`}
                    opacity={particle.opacity}
                    filter="url(#softGlow)"
                  />
                ))}

                {/* Elegant score display */}
                <g transform="translate(200, 350)">
                  <circle cx="0" cy="0" r="25" fill="url(#accentGradient)" opacity="0.8" filter="url(#glow)" />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="20"
                    fontWeight="bold"
                    fill="white"
                    filter="url(#glow)"
                  >
                    {overallScore}
                  </text>
                </g>

                {/* Signature */}
                <text
                  x="200"
                  y="380"
                  textAnchor="middle"
                  fontSize="10"
                  fill={`hsl(${artData.primaryHue}, 60%, 60%)`}
                  opacity="0.7"
                  fontFamily="monospace"
                >
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
                </text>
              </svg>
            </div>

            {/* Enhanced Art Metadata */}
            <div className={`grid grid-cols-2 gap-4 w-full max-w-md text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <div className="font-semibold">Visual Elements</div>
                <div>{artData.patterns.length + artData.particles.length} pieces</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                <div className="font-semibold">Complexity Score</div>
                <div>{artData.mandalaRings.length}x mandala layers</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <div className="font-semibold">Energy Flows</div>
                <div>{artData.connections.length + artData.waves.length} paths</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                <div className="font-semibold">Rarity Tier</div>
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

            {/* Enhanced Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={downloadSVG}
                variant="outline"
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-gray-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Masterpiece
              </Button>
              
              {!connectedWallet ? (
                <Button
                  onClick={handleConnectWallet}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect to Mint NFT
                </Button>
              ) : !isOwner ? (
                <Button
                  disabled
                  variant="outline"
                  className="bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Owner Only Minting
                </Button>
              ) : (
                <EagerMintDialog
                  walletAddress={walletAddress}
                  overallScore={overallScore}
                  artData={artData}
                  isDarkMode={isDarkMode}
                  isLoreMode={isLoreMode}
                />
              )}
            </div>

            {/* Ownership Notice */}
            {connectedWallet && !isOwner && (
              <div className={`text-center text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-600'} p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 max-w-md`}>
                <AlertTriangle className="w-4 h-4 inline-block mr-1 mb-1" />
                Only the owner of this wallet can mint this art as an NFT
              </div>
            )}

            {/* Enhanced Art Description */}
            <div className={`text-center max-w-lg text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5`}>
              <p className="font-medium mb-2">
                {isLoreMode 
                  ? '✨ Ethereal Mind Essence ✨'
                  : '🎨 Unique Digital Masterpiece 🎨'
                }
              </p>
              <p>
                {isLoreMode 
                  ? 'A transcendent visualization of your digital consciousness, where each flowing curve and radiant particle represents the essence of your blockchain journey through space and time.'
                  : 'This one-of-a-kind artwork is algorithmically generated from your complete on-chain history. Every element - from the flowing energy patterns to the intricate mandala core - tells the story of your unique blockchain identity.'
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
