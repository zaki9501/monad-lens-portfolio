import React, { useState, useEffect } from 'react';
import { Circle, Hexagon, Square, Brain, Zap, Calendar, ArrowRight } from 'lucide-react';

interface TransactionTimelineProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
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
}

const TransactionTimeline = ({ data, isDarkMode, isLoreMode }: TransactionTimelineProps) => {
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoomRange, setZoomRange] = useState({ start: 0, end: 100 });
  const [animationPhase, setAnimationPhase] = useState(0);

  // Enhanced memory nodes data
  const memoryNodes: MemoryNode[] = [
    { id: '1', type: 'native', date: '2024-01', value: 850, volume: 5, x: 10, gasUsed: 21000, from: '0xabc...def', to: '0x123...456', hash: '0x1234...abcd', isHighlight: true },
    { id: '2', type: 'token', date: '2024-02', value: 1200, volume: 12, x: 25, gasUsed: 45000, from: '0x123...456', to: '0x789...abc', hash: '0x5678...efgh', isHighlight: false },
    { id: '3', type: 'contract', date: '2024-03', value: 950, volume: 3, x: 40, gasUsed: 180000, from: '0x789...abc', to: '0xdef...ghi', hash: '0x9012...ijkl', isHighlight: false },
    { id: '4', type: 'token', date: '2024-04', value: 1800, volume: 15, x: 55, gasUsed: 52000, from: '0xdef...ghi', to: '0x456...jkl', hash: '0x3456...mnop', isHighlight: true },
    { id: '5', type: 'native', date: '2024-05', value: 2200, volume: 20, x: 70, gasUsed: 21000, from: '0x456...jkl', to: '0xmno...pqr', hash: '0x7890...qrst', isHighlight: false },
    { id: '6', type: 'contract', date: '2024-06', value: 1400, volume: 2, x: 85, gasUsed: 215000, from: '0xmno...pqr', to: '0xstu...vwx', hash: '0xabcd...uvwx', isHighlight: true },
  ];

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

  return (
    <div className="h-96 relative overflow-hidden">
      {/* Background with animated grid */}
      <div className={`absolute inset-0 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900' 
          : 'bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50'
      } rounded-lg`}>
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(90deg, ${isDarkMode ? '#64748b' : '#94a3b8'} 1px, transparent 1px), linear-gradient(${isDarkMode ? '#64748b' : '#94a3b8'} 1px, transparent 1px)`,
            backgroundSize: '50px 30px',
            animation: `pulse 4s infinite`
          }} />
        </div>
        
        {/* Shimmering neural connections */}
        <div className="absolute inset-0">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isDarkMode ? '#8b5cf6' : '#7c3aed'} stopOpacity="0" />
                <stop offset="50%" stopColor={isDarkMode ? '#8b5cf6' : '#7c3aed'} stopOpacity="0.6" />
                <stop offset="100%" stopColor={isDarkMode ? '#8b5cf6' : '#7c3aed'} stopOpacity="0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Background timeline path */}
            <path
              d="M 5% 200 Q 25% 180 50% 200 Q 75% 220 95% 200"
              stroke="url(#neuralGradient)"
              strokeWidth="3"
              fill="none"
              filter="url(#glow)"
              opacity="0.7"
            />
            
            {/* Sparkline trails between nodes */}
            {memoryNodes.slice(0, -1).map((node, index) => {
              const nextNode = memoryNodes[index + 1];
              const isActive = animationPhase % 20 === index % 20;
              
              return (
                <path
                  key={`trail-${index}`}
                  d={generateSparklinePath(node, nextNode)}
                  stroke={getNodeColor(node.type)}
                  strokeWidth={isActive ? "2" : "1"}
                  fill="none"
                  opacity={isActive ? 0.8 : 0.3}
                  strokeDasharray="5,5"
                  style={{
                    animation: isActive ? 'dash 2s linear infinite' : 'none'
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <h3 className={`text-xl font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {isLoreMode ? 'Mind Trail Explorer' : 'Transaction Timeline'}
        </h3>
        
        {/* Zoom controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Zoom: {zoomRange.start}% - {zoomRange.end}%
          </span>
          <button
            onClick={() => setZoomRange({ start: 0, end: 100 })}
            className={`px-3 py-1 rounded-lg text-xs ${
              isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition-colors`}
          >
            Reset Zoom
          </button>
        </div>
      </div>

      {/* Memory Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full">
          {memoryNodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode?.id === node.id;
            const nodeSize = 40 + (node.volume * 2);
            const glowIntensity = node.value / 100;
            
            return (
              <div
                key={node.id}
                className="absolute pointer-events-auto cursor-pointer transition-all duration-300"
                style={{
                  left: `${node.x}%`,
                  top: '50%',
                  transform: `translate(-50%, -50%) scale(${isHovered || isSelected ? 1.2 : 1})`,
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
              >
                {/* Node glow effect */}
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    width: `${nodeSize + 20}px`,
                    height: `${nodeSize + 20}px`,
                    backgroundColor: getNodeColor(node.type, node.isHighlight),
                    opacity: (glowIntensity / 100) + 0.1,
                    filter: 'blur(8px)',
                    transform: 'translate(-10px, -10px)'
                  }}
                />
                
                {/* Main node */}
                <div
                  className="relative rounded-full shadow-lg flex items-center justify-center text-white font-bold"
                  style={{
                    width: `${nodeSize}px`,
                    height: `${nodeSize}px`,
                    backgroundColor: getNodeColor(node.type, node.isHighlight),
                    border: `3px solid ${node.isHighlight ? '#ffffff' : 'transparent'}`,
                    boxShadow: node.isHighlight ? `0 0 20px ${getNodeColor(node.type, true)}` : 'none'
                  }}
                >
                  {getNodeIcon(node.type, nodeSize)}
                  
                  {/* Highlight indicator */}
                  {node.isHighlight && (
                    <div className="absolute -top-2 -right-2">
                      <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </div>
                
                {/* Node label */}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {getNodeLabel(node.type)}
                </div>
                
                {/* Hover tooltip */}
                {isHovered && (
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 rounded-lg shadow-lg whitespace-nowrap ${
                    isDarkMode ? 'bg-slate-800 text-white border border-slate-600' : 'bg-white text-gray-900 border border-gray-200'
                  } animate-fade-in`}>
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
          <div className={`p-4 rounded-xl backdrop-blur-sm ${
            isDarkMode ? 'bg-slate-800/90 border border-slate-600' : 'bg-white/90 border border-gray-200'
          } shadow-xl animate-scale-in`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: getNodeColor(selectedNode.type, selectedNode.isHighlight) }}
                >
                  {getNodeIcon(selectedNode.type, 16)}
                </div>
                <div>
                  <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getNodeLabel(selectedNode.type)} - {selectedNode.date}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedNode.volume} transactions • ${selectedNode.value} volume
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>From:</span>
                <p className={`font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedNode.from}</p>
              </div>
              <div>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>To:</span>
                <p className={`font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedNode.to}</p>
              </div>
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

      {/* Timeline markers */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex justify-between text-xs">
          {['Jan 2024', 'Feb', 'Mar', 'Apr', 'May', 'Jun 2024'].map((label, index) => (
            <div key={index} className={`flex flex-col items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3 mb-1" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -10;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TransactionTimeline;
