import React, { useState, useEffect } from 'react';
import { Circle, Hexagon, Square, Brain, Zap, Calendar, ArrowRight, Send, Download, Code } from 'lucide-react';
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
  type: 'send' | 'receive' | 'contract' | 'native';
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
  txType: 'send' | 'receive' | 'contract';
}

const TransactionTimeline = ({ data, isDarkMode, isLoreMode }: TransactionTimelineProps) => {
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoomRange, setZoomRange] = useState({ start: 0, end: 100 });
  const [animationPhase, setAnimationPhase] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [floatingElements, setFloatingElements] = useState<Array<{id: string, x: number, y: number, type: string, delay: number, color: string}>>([]);

  // Group activities by day
  const activities = Array.isArray(data?.result?.data) ? data.result.data : [];
  const grouped = groupBy(activities, item => {
    const date = new Date(item.timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  });

  const memoryNodes: MemoryNode[] = Object.entries(grouped).map(([day, txs], idx, arr) => {
    const txArray = txs as any[];
    const date = new Date(txArray[0].timestamp);
    
    // Determine transaction type based on wallet interaction
    let txType: 'send' | 'receive' | 'contract' = 'contract';
    if (txArray.some(tx => tx.from)) txType = 'send';
    if (txArray.some(tx => tx.addTokens?.length > 0)) txType = 'receive';
    if (txArray.some(tx => tx.isContract || tx.type === 'contract')) txType = 'contract';
    
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
      type: txType,
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
      counterparties,
      txType
    };
  });

  // Generate floating elements with transaction-specific colors
  useEffect(() => {
    const generateFloatingElements = () => {
      const elements = [];
      const colors = ['#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#06b6d4'];
      for (let i = 0; i < 30; i++) {
        elements.push({
          id: `float-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          type: ['circle', 'diamond', 'triangle', 'star'][Math.floor(Math.random() * 4)],
          delay: Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      setFloatingElements(elements);
    };
    generateFloatingElements();
  }, []);

  // Enhanced animation cycles
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 200);
      setPulsePhase(prev => (prev + 1) % 60);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getNodeIcon = (type: string, size: number = 24) => {
    if (isLoreMode) {
      return <Brain className={`w-${size/4} h-${size/4}`} />;
    }
    
    switch (type) {
      case 'send':
        return <Send className={`w-${size/4} h-${size/4}`} />;
      case 'receive':
        return <Download className={`w-${size/4} h-${size/4}`} />;
      case 'contract':
        return <Code className={`w-${size/4} h-${size/4}`} />;
      default:
        return <Circle className={`w-${size/4} h-${size/4}`} />;
    }
  };

  const getNodeColor = (type: string, isHighlight: boolean = false) => {
    const colors = {
      send: {
        normal: isDarkMode ? '#ef4444' : '#dc2626',
        highlight: '#fca5a5',
        glow: '#ef444440'
      },
      receive: {
        normal: isDarkMode ? '#10b981' : '#059669',
        highlight: '#6ee7b7',
        glow: '#10b98140'
      },
      contract: {
        normal: isDarkMode ? '#8b5cf6' : '#7c3aed',
        highlight: '#c4b5fd',
        glow: '#8b5cf640'
      },
      native: {
        normal: isDarkMode ? '#f59e0b' : '#d97706',
        highlight: '#fbbf24',
        glow: '#f59e0b40'
      }
    };
    const colorSet = colors[type] || colors.native;
    return isHighlight ? colorSet.highlight : colorSet.normal;
  };

  const getNodeGlowColor = (type: string) => {
    const colors = {
      send: '#ef444440',
      receive: '#10b98140',
      contract: '#8b5cf640',
      native: '#f59e0b40'
    };
    return colors[type] || colors.native;
  };

  const getNodeLabel = (type: string) => {
    if (isLoreMode) {
      switch (type) {
        case 'send': return 'Mind Send';
        case 'receive': return 'Mind Receive';
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
    const rotateY = Math.sin((phase + node.x) * 0.1) * 20;
    const rotateX = Math.cos((phase + node.volume) * 0.08) * 15;
    const translateZ = Math.sin((phase + node.value) * 0.05) * 30;
    const scale = 1 + Math.sin((phase + node.gasUsed) * 0.03) * 0.15;
    
    return `${baseTransform} scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(${translateZ}px)`;
  };

  const getFloatingElementStyle = (element: any, phase: number) => {
    const x = element.x + Math.sin((phase + element.delay) * 0.02) * 15;
    const y = element.y + Math.cos((phase + element.delay) * 0.03) * 20;
    const rotation = (phase + element.delay) * 3;
    const scale = 0.3 + Math.sin((phase + element.delay) * 0.04) * 0.4;
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
      opacity: 0.15 + Math.sin((phase + element.delay) * 0.05) * 0.15,
      backgroundColor: element.color
    };
  };

  const getPulseIntensity = (node: MemoryNode, phase: number) => {
    const baseIntensity = 0.6;
    const pulseWave = Math.sin((phase + node.x * 2) * 0.1) * 0.4;
    return baseIntensity + pulseWave;
  };

  return (
    <div className="h-96 relative overflow-hidden" style={{ perspective: '1200px' }}>
      {/* Enhanced Background with transaction-colored floating elements */}
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900' 
          : 'bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50'
      } rounded-lg`} style={{ transformStyle: 'preserve-3d' }}>
        
        {/* Enhanced Floating 3D Elements with transaction colors */}
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
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: element.color }}
              />
            )}
            {element.type === 'diamond' && (
              <div 
                className="w-3 h-3 transform rotate-45"
                style={{ backgroundColor: element.color }}
              />
            )}
            {element.type === 'triangle' && (
              <div 
                className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent"
                style={{ borderBottomColor: element.color }}
              />
            )}
            {element.type === 'star' && (
              <div 
                className="w-3 h-3"
                style={{ 
                  backgroundColor: element.color,
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                }}
              />
            )}
          </div>
        ))}

        {/* Animated grid pattern with enhanced depth */}
        <div className="absolute inset-0 opacity-25" style={{ transformStyle: 'preserve-3d' }}>
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `linear-gradient(90deg, ${isDarkMode ? '#64748b' : '#94a3b8'} 1px, transparent 1px), linear-gradient(${isDarkMode ? '#64748b' : '#94a3b8'} 1px, transparent 1px)`,
              backgroundSize: '40px 25px',
              transform: `rotateX(${Math.sin(animationPhase * 0.02) * 8}deg) rotateY(${Math.cos(animationPhase * 0.015) * 3}deg)`,
              animation: `pulse 3s infinite`
            }} 
          />
        </div>
        
        {/* Enhanced neural connections with transaction-specific colors */}
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="sendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="receiveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="contractGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
              <filter id="enhancedGlow">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Multiple wave layers with transaction colors */}
            {[0, 1, 2, 3].map(layer => (
              <path
                key={layer}
                d={`M 20 ${200 + layer * 8} Q 100 ${180 + Math.sin(animationPhase * 0.05 + layer) * 25} 200 ${200 + layer * 8} Q 300 ${220 + Math.cos(animationPhase * 0.03 + layer) * 20} 380 ${200 + layer * 8}`}
                stroke={layer % 3 === 0 ? "url(#sendGradient)" : layer % 3 === 1 ? "url(#receiveGradient)" : "url(#contractGradient)"}
                strokeWidth={5 - layer}
                fill="none"
                filter="url(#enhancedGlow)"
                opacity={0.8 - layer * 0.15}
                style={{
                  transform: `translateZ(${layer * 15}px)`,
                  transformOrigin: 'center'
                }}
              />
            ))}
            
            {/* Enhanced sparkline trails with transaction-type colors */}
            {memoryNodes.slice(0, -1).map((node, index) => {
              const nextNode = memoryNodes[index + 1];
              const isActive = animationPhase % 30 === index % 30;
              const waveOffset = Math.sin(animationPhase * 0.1 + index) * 15;
              const gradientId = node.type === 'send' ? 'sendGradient' : node.type === 'receive' ? 'receiveGradient' : 'contractGradient';
              
              return (
                <g key={`trail-${index}`}>
                  <path
                    d={generateSparklinePath(node, nextNode)}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={isActive ? "4" : "2"}
                    fill="none"
                    opacity={isActive ? 1 : 0.5}
                    strokeDasharray="10,5"
                    transform={`translateY(${waveOffset})`}
                    style={{
                      animation: isActive ? 'dash 1.2s linear infinite' : 'none',
                      filter: 'drop-shadow(0 0 8px currentColor)'
                    }}
                  />
                  {/* Enhanced energy particles */}
                  {isActive && (
                    <>
                      <circle
                        cx={node.x + (nextNode.x - node.x) * ((animationPhase % 50) / 50)}
                        cy={200 + waveOffset}
                        r="4"
                        fill={getNodeColor(node.type)}
                        opacity="0.9"
                      >
                        <animate
                          attributeName="r"
                          values="2;8;2"
                          dur="0.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        cx={node.x + (nextNode.x - node.x) * ((animationPhase % 50) / 50)}
                        cy={200 + waveOffset}
                        r="8"
                        fill={getNodeGlowColor(node.type)}
                        opacity="0.4"
                      >
                        <animate
                          attributeName="r"
                          values="4;12;4"
                          dur="0.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Header with enhanced 3D text effect */}
      <div className="relative z-10 p-6" style={{ transformStyle: 'preserve-3d' }}>
        <h3 
          className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          style={{
            transform: `translateZ(40px) rotateX(${Math.sin(animationPhase * 0.02) * 3}deg)`,
            textShadow: isDarkMode ? '0 0 30px rgba(139, 92, 246, 0.6)' : '0 0 30px rgba(124, 58, 237, 0.4)'
          }}
        >
          {isLoreMode ? 'Enhanced Mind Trail Explorer' : 'Enhanced Transaction Timeline'}
        </h3>
      </div>

      {/* Enhanced Memory Nodes with transaction-specific styling */}
      <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
        <div className="relative w-full h-full">
          {memoryNodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;
            const nodeSize = 45 + (node.volume * 2.5);
            const pulseIntensity = getPulseIntensity(node, pulsePhase);
            
            return (
              <div
                key={node.id}
                className="absolute pointer-events-auto cursor-pointer transition-all duration-500"
                style={{
                  left: `${node.x}%`,
                  top: '50%',
                  transform: get3DTransform(node, animationPhase + (isHovered ? 15 : 0)),
                  transformStyle: 'preserve-3d'
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
              >
                {/* Enhanced node glow with transaction-specific colors */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: `${nodeSize + 40}px`,
                    height: `${nodeSize + 40}px`,
                    backgroundColor: getNodeColor(node.type, true),
                    opacity: (pulseIntensity * 0.4) + 0.3,
                    filter: 'blur(15px)',
                    transform: 'translate(-20px, -20px) translateZ(-15px)',
                    animation: 'pulse 2s infinite'
                  }}
                />
                
                {/* Pulsing ring effect */}
                <div
                  className="absolute inset-0 rounded-full border-4"
                  style={{
                    width: `${nodeSize + 60}px`,
                    height: `${nodeSize + 60}px`,
                    borderColor: getNodeColor(node.type),
                    opacity: pulseIntensity * 0.6,
                    transform: `translate(-30px, -30px) scale(${1 + Math.sin(pulsePhase * 0.2) * 0.2})`,
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }}
                />
                
                {/* Orbital rings for high-value transactions with flair */}
                {node.value > 50 && (
                  <>
                    <div
                      className="absolute inset-0 border-2 border-current rounded-full opacity-40"
                      style={{
                        width: `${nodeSize + 50}px`,
                        height: `${nodeSize + 50}px`,
                        transform: `translate(-25px, -25px) rotateX(60deg) rotateY(${animationPhase * 2.5}deg)`,
                        borderColor: getNodeColor(node.type),
                        boxShadow: `0 0 20px ${getNodeGlowColor(node.type)}`
                      }}
                    />
                    <div
                      className="absolute inset-0 border border-current rounded-full opacity-25"
                      style={{
                        width: `${nodeSize + 80}px`,
                        height: `${nodeSize + 80}px`,
                        transform: `translate(-40px, -40px) rotateX(30deg) rotateY(${-animationPhase * 2}deg)`,
                        borderColor: getNodeColor(node.type),
                        boxShadow: `0 0 30px ${getNodeGlowColor(node.type)}`
                      }}
                    />
                  </>
                )}
                
                {/* Main node with enhanced 3D effect and transaction-specific styling */}
                <div
                  className="relative rounded-full shadow-2xl flex items-center justify-center text-white font-bold"
                  style={{
                    width: `${nodeSize}px`,
                    height: `${nodeSize}px`,
                    backgroundColor: getNodeColor(node.type, node.isHighlight),
                    border: `4px solid ${node.isHighlight ? '#ffffff' : getNodeColor(node.type, true)}`,
                    boxShadow: `
                      0 0 40px ${getNodeColor(node.type, true)},
                      inset 0 3px 12px rgba(255,255,255,0.3),
                      0 12px 40px rgba(0,0,0,0.4),
                      0 0 60px ${getNodeGlowColor(node.type)}
                    `,
                    transform: `translateZ(${isHovered ? '30px' : '0px'}) scale(${isHovered ? '1.1' : '1'})`,
                    transition: 'all 0.4s ease',
                    opacity: pulseIntensity
                  }}
                >
                  <div style={{ transform: `rotateY(${animationPhase * 1.5}deg)` }}>
                    {getNodeIcon(node.type, nodeSize)}
                  </div>
                  
                  {/* Enhanced energy pulses for active transactions */}
                  {node.isHighlight && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-full border-3"
                        style={{
                          borderColor: getNodeColor(node.type, true),
                          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                          transform: 'translateZ(8px)'
                        }}
                      />
                      <div 
                        className="absolute inset-0 rounded-full border-2"
                        style={{
                          borderColor: getNodeColor(node.type),
                          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.3s',
                          transform: 'translateZ(5px)'
                        }}
                      />
                      <div className="absolute -top-3 -right-3" style={{ transform: 'translateZ(15px)' }}>
                        <Zap 
                          className="w-5 h-5"
                          style={{
                            color: getNodeColor(node.type, true),
                            animation: 'pulse 1s infinite',
                            filter: `drop-shadow(0 0 12px ${getNodeColor(node.type)})`
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
                
                {/* Enhanced hover tooltip with transaction-specific styling */}
                {isHovered && (
                  <div 
                    className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-4 rounded-xl shadow-2xl whitespace-nowrap ${
                      isDarkMode ? 'bg-slate-800/95 text-white border-2' : 'bg-white/95 text-gray-900 border-2'
                    } animate-fade-in backdrop-blur-md`}
                    style={{
                      transform: 'translate(-50%, 0) translateZ(35px)',
                      borderColor: getNodeColor(node.type),
                      boxShadow: `
                        0 25px 50px rgba(0,0,0,0.4),
                        0 0 30px ${getNodeGlowColor(node.type)},
                        inset 0 1px 0 rgba(255,255,255,0.1)
                      `
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {getNodeIcon(node.type, 16)}
                      <span className="text-sm font-semibold">{getNodeLabel(node.type)}</span>
                    </div>
                    <div className="text-sm font-semibold">{node.date}</div>
                    <div className="text-xs opacity-80">Value: ${node.value}</div>
                    <div className="text-xs opacity-80">Volume: {node.volume} TXs</div>
                    <div className="text-xs opacity-80">Gas: {node.gasUsed.toLocaleString()}</div>
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
              stroke-dashoffset: -15;
            }
          }
          @keyframes ping {
            75%, 100% {
              transform: scale(2.5) translateZ(8px);
              opacity: 0;
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TransactionTimeline;
