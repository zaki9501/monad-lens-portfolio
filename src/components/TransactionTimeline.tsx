
import React, { useState, useEffect } from 'react';
import { Circle, Hexagon, Square, Brain, Zap, Calendar, ArrowRight } from 'lucide-react';
import { groupBy } from 'lodash';

interface TransactionTimelineProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

interface TokenMovement {
  symbol: string;
  amount: number;
  direction: 'in' | 'out';
  logo?: string;
}

interface Counterparty {
  address: string;
  direction: 'in' | 'out';
  count: number;
}

interface MemoryNode {
  id: string;
  type: 'native' | 'token' | 'contract';
  date: string;
  value: number;
  volume: number;
  x: number;
  gasUsed: number;
  from: string;
  to: string;
  hash: string;
  isHighlight: boolean;
  tokens: TokenMovement[];
  counterparties: Counterparty[];
}

const TransactionTimeline = ({ data, isDarkMode, isLoreMode }: TransactionTimelineProps) => {
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoomRange, setZoomRange] = useState({ start: 0, end: 100 });
  const [animationPhase, setAnimationPhase] = useState(0);
  const [floatingElements, setFloatingElements] = useState<Array<{id: string, x: number, y: number, type: string, delay: number}>>([]);

  // Group activities by day
  const activities = Array.isArray(data?.result?.data) ? data.result.data : [];
  const grouped = groupBy(activities, item => {
    const date = new Date(item.timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  });

  const memoryNodes: MemoryNode[] = Object.entries(grouped).map(([day, txs], idx, arr) => {
    const txArray = txs as any[];
    const date = new Date(txArray[0].timestamp);
    // Aggregate token movement for this period
    const tokens: TokenMovement[] = [];
    const tokenMap: Record<string, TokenMovement> = {};
    txArray.forEach(tx => {
      (tx.addTokens || []).forEach(t => {
        if (!tokenMap[`${t.symbol}-in`]) tokenMap[`${t.symbol}-in`] = { symbol: t.symbol, amount: 0, direction: 'in', logo: t.logo };
        tokenMap[`${t.symbol}-in`].amount += Number(t.amount || 0);
      });
      (tx.subTokens || []).forEach(t => {
        if (!tokenMap[`${t.symbol}-out`]) tokenMap[`${t.symbol}-out`] = { symbol: t.symbol, amount: 0, direction: 'out', logo: t.logo };
        tokenMap[`${t.symbol}-out`].amount += Math.abs(Number(t.amount || 0));
      });
    });
    Object.values(tokenMap).forEach(t => tokens.push(t));
    // Aggregate counterparties
    const counterpartyMap: Record<string, Counterparty> = {};
    txArray.forEach(tx => {
      if (tx.from) {
        if (!counterpartyMap[`${tx.from}-out`]) counterpartyMap[`${tx.from}-out`] = { address: tx.from, direction: 'out', count: 0 };
        counterpartyMap[`${tx.from}-out`].count++;
      }
      if (tx.to) {
        if (!counterpartyMap[`${tx.to}-in`]) counterpartyMap[`${tx.to}-in`] = { address: tx.to, direction: 'in', count: 0 };
        counterpartyMap[`${tx.to}-in`].count++;
      }
    });
    const counterparties = Object.values(counterpartyMap);
    return {
      id: day,
      type: tokens.length ? 'token' : (txArray[0].isContract ? 'contract' : 'native'),
      date: date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      value: tokens.reduce((sum, t) => sum + t.amount, 0),
      volume: txArray.length,
      x: (idx / (arr.length - 1 || 1)) * 90 + 5,
      gasUsed: txArray.reduce((sum, tx) => sum + Number(tx.transactionFee || 0), 0),
      from: '',
      to: '',
      hash: txArray[0].hash,
      isHighlight: idx === 0,
      tokens,
      counterparties
    };
  });

  // Generate floating elements for 3D effect
  useEffect(() => {
    const generateFloatingElements = () => {
      const elements = [];
      for (let i = 0; i < 20; i++) {
        elements.push({
          id: `float-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          type: ['circle', 'diamond', 'triangle'][Math.floor(Math.random() * 3)],
          delay: Math.random() * 5
        });
      }
      setFloatingElements(elements);
    };
    generateFloatingElements();
  }, []);

  // Animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getNodeIcon = (type: string, size: number = 24) => {
    if (isLoreMode) {
      return <Brain className={`w-${size/4} h-${size/4}`} />;
    }
    
    switch (type) {
      case 'native':
        return <Circle className={`w-${size/4} h-${size/4}`} />;
      case 'token':
        return <Hexagon className={`w-${size/4} h-${size/4}`} />;
      case 'contract':
        return <Square className={`w-${size/4} h-${size/4}`} />;
      default:
        return <Circle className={`w-${size/4} h-${size/4}`} />;
    }
  };

  const getNodeColor = (type: string, isHighlight: boolean = false) => {
    const colors = {
      native: isHighlight ? '#fbbf24' : (isDarkMode ? '#f59e0b' : '#d97706'),
      token: isHighlight ? '#34d399' : (isDarkMode ? '#10b981' : '#059669'),
      contract: isHighlight ? '#a78bfa' : (isDarkMode ? '#8b5cf6' : '#7c3aed')
    };
    return colors[type] || colors.native;
  };

  const getNodeLabel = (type: string) => {
    if (isLoreMode) {
      switch (type) {
        case 'native': return 'Core Memory';
        case 'token': return 'Token Echo';
        case 'contract': return 'Mind Bridge';
        default: return 'Memory Node';
      }
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const generateSparklinePath = (startNode: MemoryNode, endNode: MemoryNode) => {
    const startX = startNode.x;
    const endX = endNode.x;
    const midX = (startX + endX) / 2;
    const curve = Math.abs(endNode.volume - startNode.volume) * 2;
    
    return `M ${startX} 200 Q ${midX} ${200 - curve} ${endX} 200`;
  };

  const get3DTransform = (node: MemoryNode, phase: number) => {
    const baseTransform = 'translate(-50%, -50%)';
    const rotateY = Math.sin((phase + node.x) * 0.1) * 15;
    const rotateX = Math.cos((phase + node.volume) * 0.08) * 10;
    const translateZ = Math.sin((phase + node.value) * 0.05) * 20;
    const scale = 1 + Math.sin((phase + node.gasUsed) * 0.03) * 0.1;
    
    return `${baseTransform} scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(${translateZ}px)`;
  };

  const getFloatingElementStyle = (element: any, phase: number) => {
    const x = element.x + Math.sin((phase + element.delay) * 0.02) * 10;
    const y = element.y + Math.cos((phase + element.delay) * 0.03) * 15;
    const rotation = (phase + element.delay) * 2;
    const scale = 0.5 + Math.sin((phase + element.delay) * 0.04) * 0.3;
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
      opacity: 0.1 + Math.sin((phase + element.delay) * 0.05) * 0.1
    };
  };

  return (
    <div className="h-96 relative overflow-hidden" style={{ perspective: '1000px' }}>
      {/* Enhanced Background with 3D floating elements */}
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900' 
          : 'bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50'
      } rounded-lg`} style={{ transformStyle: 'preserve-3d' }}>
        
        {/* Floating 3D Elements */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute"
            style={{
              ...getFloatingElementStyle(element, animationPhase),
              transformStyle: 'preserve-3d'
            }}
          >
            {element.type === 'circle' && (
              <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-purple-400/30' : 'bg-blue-400/30'}`} />
            )}
            {element.type === 'diamond' && (
              <div className={`w-2 h-2 transform rotate-45 ${isDarkMode ? 'bg-pink-400/30' : 'bg-purple-400/30'}`} />
            )}
            {element.type === 'triangle' && (
              <div 
                className={`w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent ${
                  isDarkMode ? 'border-b-cyan-400/30' : 'border-b-indigo-400/30'
                }`}
              />
            )}
          </div>
        ))}

        {/* Animated grid pattern with 3D depth */}
        <div className="absolute inset-0 opacity-20" style={{ transformStyle: 'preserve-3d' }}>
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `linear-gradient(90deg, ${isDarkMode ? '#64748b' : '#94a3b8'} 1px, transparent 1px), linear-gradient(${isDarkMode ? '#64748b' : '#94a3b8'} 1px, transparent 1px)`,
              backgroundSize: '50px 30px',
              transform: `rotateX(${Math.sin(animationPhase * 0.02) * 5}deg)`,
              animation: `pulse 4s infinite`
            }} 
          />
        </div>
        
        {/* Enhanced neural connections with 3D waves */}
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="neuralGradient3D" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isDarkMode ? '#8b5cf6' : '#7c3aed'} stopOpacity="0" />
                <stop offset="50%" stopColor={isDarkMode ? '#8b5cf6' : '#7c3aed'} stopOpacity="0.8" />
                <stop offset="100%" stopColor={isDarkMode ? '#8b5cf6' : '#7c3aed'} stopOpacity="0" />
              </linearGradient>
              <filter id="glow3D">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Multiple wave layers for depth */}
            {[0, 1, 2].map(layer => (
              <path
                key={layer}
                d={`M 20 ${200 + layer * 10} Q 100 ${180 + Math.sin(animationPhase * 0.05 + layer) * 20} 200 ${200 + layer * 10} Q 300 ${220 + Math.cos(animationPhase * 0.03 + layer) * 15} 380 ${200 + layer * 10}`}
                stroke="url(#neuralGradient3D)"
                strokeWidth={4 - layer}
                fill="none"
                filter="url(#glow3D)"
                opacity={0.7 - layer * 0.2}
                style={{
                  transform: `translateZ(${layer * 10}px)`,
                  transformOrigin: 'center'
                }}
              />
            ))}
            
            {/* Enhanced sparkline trails with 3D movement */}
            {memoryNodes.slice(0, -1).map((node, index) => {
              const nextNode = memoryNodes[index + 1];
              const isActive = animationPhase % 20 === index % 20;
              const waveOffset = Math.sin(animationPhase * 0.1 + index) * 10;
              
              return (
                <g key={`trail-${index}`}>
                  <path
                    d={generateSparklinePath(node, nextNode)}
                    stroke={getNodeColor(node.type)}
                    strokeWidth={isActive ? "3" : "2"}
                    fill="none"
                    opacity={isActive ? 0.9 : 0.4}
                    strokeDasharray="8,4"
                    transform={`translateY(${waveOffset})`}
                    style={{
                      animation: isActive ? 'dash 1.5s linear infinite' : 'none',
                      filter: 'drop-shadow(0 0 6px currentColor)'
                    }}
                  />
                  {/* Energy particles along the path */}
                  {isActive && (
                    <circle
                      cx={node.x + (nextNode.x - node.x) * ((animationPhase % 40) / 40)}
                      cy={200 + waveOffset}
                      r="3"
                      fill={getNodeColor(node.type)}
                      opacity="0.8"
                    >
                      <animate
                        attributeName="r"
                        values="2;6;2"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Header with 3D text effect */}
      <div className="relative z-10 p-6" style={{ transformStyle: 'preserve-3d' }}>
        <h3 
          className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          style={{
            transform: `translateZ(30px) rotateX(${Math.sin(animationPhase * 0.02) * 2}deg)`,
            textShadow: isDarkMode ? '0 0 20px rgba(139, 92, 246, 0.5)' : '0 0 20px rgba(124, 58, 237, 0.3)'
          }}
        >
          {isLoreMode ? 'Mind Trail Explorer' : 'Transaction Timeline'}
        </h3>
      </div>

      {/* Enhanced Memory Nodes with 3D transforms */}
      <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        <div className="relative w-full h-full">
          {memoryNodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;
            const nodeSize = 40 + (node.volume * 2);
            const glowIntensity = node.value / 100;
            
            return (
              <div
                key={node.id}
                className="absolute pointer-events-auto cursor-pointer transition-all duration-500"
                style={{
                  left: `${node.x}%`,
                  top: '50%',
                  transform: get3DTransform(node, animationPhase + (isHovered ? 10 : 0)),
                  transformStyle: 'preserve-3d'
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
              >
                {/* Enhanced node glow with 3D depth */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: `${nodeSize + 30}px`,
                    height: `${nodeSize + 30}px`,
                    backgroundColor: getNodeColor(node.type, node.isHighlight),
                    opacity: (glowIntensity / 100) + 0.2,
                    filter: 'blur(12px)',
                    transform: 'translate(-15px, -15px) translateZ(-10px)',
                    animation: 'pulse 3s infinite'
                  }}
                />
                
                {/* Orbital rings for high-value transactions */}
                {node.value > 50 && (
                  <>
                    <div
                      className="absolute inset-0 border-2 border-current rounded-full opacity-30"
                      style={{
                        width: `${nodeSize + 40}px`,
                        height: `${nodeSize + 40}px`,
                        transform: `translate(-20px, -20px) rotateX(60deg) rotateY(${animationPhase * 2}deg)`,
                        borderColor: getNodeColor(node.type)
                      }}
                    />
                    <div
                      className="absolute inset-0 border border-current rounded-full opacity-20"
                      style={{
                        width: `${nodeSize + 60}px`,
                        height: `${nodeSize + 60}px`,
                        transform: `translate(-30px, -30px) rotateX(30deg) rotateY(${-animationPhase * 1.5}deg)`,
                        borderColor: getNodeColor(node.type)
                      }}
                    />
                  </>
                )}
                
                {/* Main node with enhanced 3D effect */}
                <div
                  className="relative rounded-full shadow-2xl flex items-center justify-center text-white font-bold"
                  style={{
                    width: `${nodeSize}px`,
                    height: `${nodeSize}px`,
                    backgroundColor: getNodeColor(node.type, node.isHighlight),
                    border: `3px solid ${node.isHighlight ? '#ffffff' : 'transparent'}`,
                    boxShadow: `
                      0 0 30px ${getNodeColor(node.type, true)},
                      inset 0 2px 8px rgba(255,255,255,0.2),
                      0 8px 32px rgba(0,0,0,0.3)
                    `,
                    transform: `translateZ(${isHovered ? '20px' : '0px'})`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ transform: `rotateY(${animationPhase}deg)` }}>
                    {getNodeIcon(node.type, nodeSize)}
                  </div>
                  
                  {/* Energy pulses for active transactions */}
                  {node.isHighlight && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-full border-2 border-yellow-400"
                        style={{
                          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                          transform: 'translateZ(5px)'
                        }}
                      />
                      <div className="absolute -top-2 -right-2" style={{ transform: 'translateZ(10px)' }}>
                        <Zap 
                          className="w-4 h-4 text-yellow-400" 
                          style={{
                            animation: 'pulse 1s infinite',
                            filter: 'drop-shadow(0 0 8px #fbbf24)'
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
                
                {/* Floating label with 3D positioning */}
                <div 
                  className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                  style={{
                    transform: 'translate(-50%, 0) translateZ(15px)',
                    textShadow: isDarkMode ? '0 0 10px rgba(0,0,0,0.8)' : '0 0 10px rgba(255,255,255,0.8)'
                  }}
                >
                  {getNodeLabel(node.type)}
                </div>
                
                {/* Enhanced hover tooltip with 3D depth */}
                {isHovered && (
                  <div 
                    className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 rounded-lg shadow-2xl whitespace-nowrap ${
                      isDarkMode ? 'bg-slate-800/95 text-white border border-slate-600' : 'bg-white/95 text-gray-900 border border-gray-200'
                    } animate-fade-in backdrop-blur-sm`}
                    style={{
                      transform: 'translate(-50%, 0) translateZ(25px)',
                      boxShadow: `
                        0 20px 40px rgba(0,0,0,0.3),
                        0 0 20px ${getNodeColor(node.type)}40
                      `
                    }}
                  >
                    <div className="text-sm font-semibold">{node.date}</div>
                    <div className="text-xs opacity-80">Value: ${node.value}</div>
                    <div className="text-xs opacity-80">Volume: {node.volume} TXs</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Node Details */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className={`p-4 rounded-xl backdrop-blur-sm ${isDarkMode ? 'bg-slate-800/90 border border-slate-600' : 'bg-white/90 border border-gray-200'} shadow-xl animate-scale-in`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: getNodeColor(selectedNode.type, selectedNode.isHighlight) }}>
                  {getNodeIcon(selectedNode.type, 16)}
                </div>
                <div>
                  <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getNodeLabel(selectedNode.type)} - {selectedNode.date}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedNode.volume} transactions • {selectedNode.value} volume
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                ✕
              </button>
            </div>
            {/* Token Movement */}
            <div className="mb-2">
              <span className="font-semibold">Token Movement:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedNode.tokens.length === 0 && <span className="text-xs text-gray-400">No token movement</span>}
                {selectedNode.tokens.map((token, i) => (
                  <span key={i} className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono ${token.direction === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {token.logo && <img src={token.logo} alt={token.symbol} className="w-4 h-4 mr-1 rounded-full" />}
                    {token.direction === 'in' ? '+' : '-'}{token.amount} {token.symbol}
                  </span>
                ))}
              </div>
            </div>
            {/* Counterparties */}
            <div className="mb-2">
              <span className="font-semibold">Counterparties:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedNode.counterparties.length === 0 && <span className="text-xs text-gray-400">No counterparties</span>}
                {selectedNode.counterparties.map((cp, i) => (
                  <span key={i} className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono ${cp.direction === 'in' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {cp.direction === 'in' ? '⬇️' : '⬆️'} {cp.address.slice(0, 6)}...{cp.address.slice(-4)} ({cp.count})
                  </span>
                ))}
              </div>
            </div>
            {/* Other Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gas Used:</span>
                <p className={`font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedNode.gasUsed.toLocaleString()}</p>
              </div>
              <div>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hash:</span>
                <p className={`font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedNode.hash}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline markers with 3D effect */}
      <div className="absolute bottom-0 left-0 right-0 p-4" style={{ transformStyle: 'preserve-3d' }}>
        <div className="flex justify-between text-xs">
          {Object.values(memoryNodes).map((node, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              style={{
                transform: `translateZ(10px) rotateX(${Math.sin(animationPhase * 0.03 + index) * 3}deg)`,
                transition: 'transform 0.5s ease'
              }}
            >
              <Calendar className="w-3 h-3 mb-1" />
              <span>{node.date}</span>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -12;
            }
          }
          @keyframes ping {
            75%, 100% {
              transform: scale(2) translateZ(5px);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TransactionTimeline;
