
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Palette, Sparkles } from "lucide-react";

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
    const hash = walletAddress.slice(2);
    const seed = parseInt(hash.slice(0, 8), 16);
    
    let rng = seed;
    const random = () => {
      rng = (rng * 9301 + 49297) % 233280;
      return rng / 233280;
    };

    // Cosmic Pulse Pattern Implementation
    const scoreCategory = overallScore <= 30 ? 'low' : overallScore <= 70 ? 'medium' : 'high';
    
    // Core colors based on score
    const coreColor = '#6B21A8'; // Dark purple core
    const ringColors = {
      low: ['#6B21A8', '#8B5CF6', '#A855F7'],
      medium: ['#6B21A8', '#8B5CF6', '#A855F7', '#C084FC', '#E879F9'],
      high: ['#6B21A8', '#8B5CF6', '#A855F7', '#C084FC', '#E879F9', '#F0ABFC', '#FDE68A']
    };

    // Generate cosmic pulse rings based on score
    const numRings = Math.max(3, Math.floor(overallScore / 10));
    const pulseRings = [];
    
    for (let i = 0; i < numRings; i++) {
      const radius = 30 + (i * 25);
      const opacity = scoreCategory === 'low' ? 0.2 + (i * 0.1) : 
                     scoreCategory === 'medium' ? 0.3 + (i * 0.15) : 
                     0.4 + (i * 0.2);
      const strokeWidth = scoreCategory === 'low' ? 1 : 
                         scoreCategory === 'medium' ? 2 : 3;
      const animationDelay = i * 0.3;
      
      pulseRings.push({
        radius,
        opacity: Math.min(opacity, 0.8),
        strokeWidth,
        animationDelay,
        colorIndex: i % ringColors[scoreCategory].length,
        pulseIntensity: scoreCategory === 'high' ? 1.5 : scoreCategory === 'medium' ? 1.2 : 1
      });
    }

    // Generate star particles based on transaction frequency
    const starParticles = [];
    const numStars = Math.min(100, Math.max(10, metrics.transactionFrequency * 5));
    
    for (let i = 0; i < numStars; i++) {
      const distance = 50 + random() * 300;
      const angle = random() * Math.PI * 2;
      const x = 200 + Math.cos(angle) * distance;
      const y = 200 + Math.sin(angle) * distance;
      const size = scoreCategory === 'high' ? 1 + random() * 2 : 
                  scoreCategory === 'medium' ? 0.5 + random() * 1.5 : 
                  0.3 + random() * 1;
      const brightness = scoreCategory === 'high' ? 0.6 + random() * 0.4 : 
                        scoreCategory === 'medium' ? 0.4 + random() * 0.3 : 
                        0.2 + random() * 0.3;
      
      starParticles.push({
        x, y, size, brightness,
        twinkleDelay: random() * 2,
        color: ringColors[scoreCategory][Math.floor(random() * ringColors[scoreCategory].length)]
      });
    }

    // Generate DApp interaction nodes
    const dappNodes = [];
    const numNodes = Math.min(12, metrics.uniqueContracts);
    
    for (let i = 0; i < numNodes; i++) {
      const angle = (i / numNodes) * Math.PI * 2;
      const radius = 120 + random() * 100;
      const x = 200 + Math.cos(angle) * radius;
      const y = 200 + Math.sin(angle) * radius;
      const nodeSize = scoreCategory === 'high' ? 4 + random() * 3 : 
                      scoreCategory === 'medium' ? 3 + random() * 2 : 
                      2 + random() * 1.5;
      
      dappNodes.push({
        x, y, size: nodeSize,
        glowIntensity: scoreCategory === 'high' ? 6 : scoreCategory === 'medium' ? 4 : 2,
        connectionOpacity: scoreCategory === 'high' ? 0.6 : scoreCategory === 'medium' ? 0.4 : 0.2
      });
    }

    // Generate connection lines between nodes
    const connections = [];
    for (let i = 0; i < dappNodes.length; i++) {
      for (let j = i + 1; j < dappNodes.length; j++) {
        if (random() > 0.7) { // Only connect some nodes
          connections.push({
            x1: dappNodes[i].x,
            y1: dappNodes[i].y,
            x2: dappNodes[j].x,
            y2: dappNodes[j].y,
            opacity: dappNodes[i].connectionOpacity
          });
        }
      }
    }

    // Generate particle effects for high scores
    const particleEffects = [];
    if (scoreCategory === 'high') {
      const numParticles = 30;
      for (let i = 0; i < numParticles; i++) {
        const angle = random() * Math.PI * 2;
        const distance = 40 + random() * 150;
        const x = 200 + Math.cos(angle) * distance;
        const y = 200 + Math.sin(angle) * distance;
        
        particleEffects.push({
          x, y,
          size: 0.5 + random() * 1.5,
          opacity: 0.3 + random() * 0.4,
          animationDelay: random() * 3
        });
      }
    }

    return {
      scoreCategory,
      ringColors: ringColors[scoreCategory],
      pulseRings,
      starParticles,
      dappNodes,
      connections,
      particleEffects,
      coreColor,
      background: isDarkMode 
        ? `radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f0f23 40%, #000000 100%)`
        : `radial-gradient(circle at 50% 50%, #e0e7ff 0%, #f1f5f9 40%, #ffffff 100%)`
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
    link.download = `cosmic-pulse-${walletAddress.slice(0, 8)}.svg`;
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
            <span>{isLoreMode ? 'Cosmic Mind Pulse' : 'Cosmic Pulse Pattern'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {/* Generated Cosmic Pulse Art */}
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
                  {/* Core glow gradient */}
                  <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={artData.coreColor} stopOpacity="1" />
                    <stop offset="30%" stopColor="#8B5CF6" stopOpacity="0.8" />
                    <stop offset="70%" stopColor="#A855F7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#C084FC" stopOpacity="0.1" />
                  </radialGradient>
                  
                  {/* Ring gradients */}
                  {artData.ringColors.map((color, i) => (
                    <radialGradient key={`ring-grad-${i}`} id={`ringGradient${i}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={color} stopOpacity="0" />
                      <stop offset="50%" stopColor={color} stopOpacity="0.6" />
                      <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </radialGradient>
                  ))}

                  {/* Glow effects */}
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  <filter id="nodeGlow" x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  {/* Animation definitions */}
                  <animate id="pulseAnimation" attributeName="r" dur="2s" repeatCount="indefinite" />
                  <animate id="twinkleAnimation" attributeName="opacity" dur="1.5s" repeatCount="indefinite" />
                </defs>

                {/* Background cosmic field */}
                <rect width="400" height="400" fill="url(#coreGlow)" opacity="0.1" />

                {/* Connection lines between DApp nodes */}
                {artData.connections.map((conn, i) => (
                  <line
                    key={`conn-${i}`}
                    x1={conn.x1}
                    y1={conn.y1}
                    x2={conn.x2}
                    y2={conn.y2}
                    stroke="#8B5CF6"
                    strokeWidth="1"
                    opacity={conn.opacity}
                    strokeDasharray="2,4"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;6"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </line>
                ))}

                {/* Cosmic pulse rings */}
                {artData.pulseRings.map((ring, i) => (
                  <g key={`ring-${i}`}>
                    <circle
                      cx="200"
                      cy="200"
                      r={ring.radius}
                      fill="none"
                      stroke={artData.ringColors[ring.colorIndex]}
                      strokeWidth={ring.strokeWidth}
                      opacity={ring.opacity}
                      filter="url(#glow)"
                    >
                      <animate
                        attributeName="r"
                        values={`${ring.radius};${ring.radius + 10};${ring.radius}`}
                        dur="2s"
                        repeatCount="indefinite"
                        begin={`${ring.animationDelay}s`}
                      />
                      <animate
                        attributeName="opacity"
                        values={`${ring.opacity};${ring.opacity * ring.pulseIntensity};${ring.opacity}`}
                        dur="2s"
                        repeatCount="indefinite"
                        begin={`${ring.animationDelay}s`}
                      />
                    </circle>
                  </g>
                ))}

                {/* Central core */}
                <circle
                  cx="200"
                  cy="200"
                  r="15"
                  fill="url(#coreGlow)"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="r"
                    values="15;20;15"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Star particles (transaction frequency) */}
                {artData.starParticles.map((star, i) => (
                  <circle
                    key={`star-${i}`}
                    cx={star.x}
                    cy={star.y}
                    r={star.size}
                    fill={star.color}
                    opacity={star.brightness}
                    filter="url(#starGlow)"
                  >
                    <animate
                      attributeName="opacity"
                      values={`${star.brightness};${star.brightness * 0.3};${star.brightness}`}
                      dur="2s"
                      repeatCount="indefinite"
                      begin={`${star.twinkleDelay}s`}
                    />
                  </circle>
                ))}

                {/* DApp interaction nodes */}
                {artData.dappNodes.map((node, i) => (
                  <circle
                    key={`node-${i}`}
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill="#E879F9"
                    filter="url(#nodeGlow)"
                  >
                    <animate
                      attributeName="r"
                      values={`${node.size};${node.size + 2};${node.size}`}
                      dur="3s"
                      repeatCount="indefinite"
                      begin={`${i * 0.5}s`}
                    />
                  </circle>
                ))}

                {/* High score particle effects */}
                {artData.particleEffects.map((particle, i) => (
                  <circle
                    key={`particle-${i}`}
                    cx={particle.x}
                    cy={particle.y}
                    r={particle.size}
                    fill="#FDE68A"
                    opacity={particle.opacity}
                    filter="url(#starGlow)"
                  >
                    <animate
                      attributeName="opacity"
                      values={`${particle.opacity};0;${particle.opacity}`}
                      dur="2.5s"
                      repeatCount="indefinite"
                      begin={`${particle.animationDelay}s`}
                    />
                  </circle>
                ))}

                {/* Score display in center */}
                <text
                  x="200"
                  y="200"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="24"
                  fontWeight="bold"
                  fill="white"
                  filter="url(#glow)"
                  opacity="0.9"
                >
                  {overallScore}
                </text>

                {/* Signature */}
                <text
                  x="200"
                  y="380"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#8B5CF6"
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
                <div className="font-semibold">Pulse Rings</div>
                <div>{artData.pulseRings.length} layers</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                <div className="font-semibold">Star Field</div>
                <div>{artData.starParticles.length} particles</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <div className="font-semibold">DApp Nodes</div>
                <div>{artData.dappNodes.length} connections</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                <div className="font-semibold">Intensity</div>
                <div className={`font-bold ${
                  artData.scoreCategory === 'high' ? 'text-yellow-400' :
                  artData.scoreCategory === 'medium' ? 'text-purple-400' : 'text-blue-400'
                }`}>
                  {artData.scoreCategory === 'high' ? 'Cosmic' :
                   artData.scoreCategory === 'medium' ? 'Stellar' : 'Nebula'}
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
                Download Cosmic Art
              </Button>
              
              <EagerMintDialog
                walletAddress={walletAddress}
                overallScore={overallScore}
                artData={artData}
                isDarkMode={isDarkMode}
                isLoreMode={isLoreMode}
              />
            </div>

            {/* Enhanced Art Description */}
            <div className={`text-center max-w-lg text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            } p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5`}>
              <p className="font-medium mb-2">
                {isLoreMode 
                  ? '🌌 Cosmic Mind Pulse 🌌'
                  : '⭐ Cosmic Pulse Pattern ⭐'
                }
              </p>
              <p>
                {isLoreMode 
                  ? 'Your digital consciousness radiates through the cosmic void, with each pulse ring representing the depth of your blockchain journey. Star particles dance around your core essence, while glowing nodes mark your interactions across the digital universe.'
                  : 'A radial, pulsating pattern resembling a starfield blockchain network. The central core glows in deep purple, with concentric rings radiating outward. Ring density and particle effects directly reflect your wallet activity and reputation score.'
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
