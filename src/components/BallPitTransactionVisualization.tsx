
import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Send, Download, Code, Zap } from "lucide-react";

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'contract';
  amount: number;
  timestamp: Date;
  hash: string;
  from?: string;
  to?: string;
  gasUsed: number;
  color: string;
}

interface BallPitTransactionVisualizationProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

// Simple Error Boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center p-4">
            <p className="text-red-500">Failed to load 3D ball pit</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Ball Physics Component
const TransactionBall: React.FC<{
  transaction: Transaction;
  position: [number, number, number];
  onClick: (tx: Transaction) => void;
  isDarkMode: boolean;
  isLoreMode: boolean;
  index: number;
}> = ({ transaction, position, onClick, isDarkMode, isLoreMode, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentY, setCurrentY] = useState(position[1]);
  const [settled, setSettled] = useState(false);
  const velocityRef = useRef(0);
  const bounceHeightRef = useRef(0);
  
  const ballSize = useMemo(() => {
    const baseSize = 0.2;
    const sizeMultiplier = Math.min(transaction.amount / 1000, 1.5);
    return baseSize + sizeMultiplier * 0.15;
  }, [transaction.amount]);

  // Calculate settling position based on ball pit physics
  const settleY = useMemo(() => {
    const floorY = -2;
    const layers = Math.floor(index / 8); // 8 balls per layer roughly
    const layerHeight = ballSize * 2;
    return floorY + ballSize + (layers * layerHeight) + Math.random() * 0.1;
  }, [ballSize, index]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;

    // Settling physics - balls fall and settle at bottom
    if (!settled) {
      const gravity = -12;
      velocityRef.current += gravity * delta;
      setCurrentY(prev => {
        const newY = prev + velocityRef.current * delta;
        if (newY <= settleY) {
          setSettled(true);
          velocityRef.current = 0;
          return settleY;
        }
        return newY;
      });
      mesh.position.y = currentY;
    } else {
      // Hover bounce effect - only when hovered
      if (isHovered) {
        const bounceTime = state.clock.getElapsedTime() * 8;
        const bounceAmount = Math.sin(bounceTime) * 0.3;
        mesh.position.y = settleY + Math.max(0, bounceAmount);
      } else {
        // Return to settled position
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, settleY, delta * 5);
      }
    }

    // Hover scale effect
    const targetScale = isHovered ? 1.15 : 1;
    mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
  });

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'send': return <ArrowUp size={10} />;
      case 'receive': return <ArrowDown size={10} />;
      case 'contract': return <Code size={10} />;
      default: return <Zap size={10} />;
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={() => onClick(transaction)}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        <sphereGeometry args={[ballSize, 16, 16]} />
        <meshStandardMaterial
          color={transaction.color}
          emissive={transaction.color}
          emissiveIntensity={isHovered ? 0.4 : 0.05}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Hover Details */}
      {isHovered && (
        <Html position={[0, ballSize + 0.8, 0]} center>
          <div className={`p-2 rounded-lg shadow-lg max-w-xs ${
            isDarkMode ? 'bg-slate-800 text-white border border-slate-600' : 'bg-white text-black border border-gray-200'
          } pointer-events-none z-50`}>
            <div className="flex items-center space-x-2 text-xs">
              {getTransactionIcon()}
              <span className="font-semibold">{transaction.amount} MON</span>
            </div>
            <div className="text-xs opacity-70 mt-1">
              {transaction.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Ball Pit Environment
const BallPitEnvironment: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -2.1, 0]}>
        <boxGeometry args={[12, 0.2, 12]} />
        <meshStandardMaterial
          color={isDarkMode ? "#1e293b" : "#f1f5f9"}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Walls */}
      {[
        { pos: [6, -0.5, 0], size: [0.2, 3, 12] },
        { pos: [-6, -0.5, 0], size: [0.2, 3, 12] },
        { pos: [0, -0.5, 6], size: [12, 3, 0.2] },
        { pos: [0, -0.5, -6], size: [12, 3, 0.2] }
      ].map((wall, index) => (
        <mesh key={index} position={wall.pos as [number, number, number]}>
          <boxGeometry args={wall.size as [number, number, number]} />
          <meshStandardMaterial
            color={isDarkMode ? "#334155" : "#e2e8f0"}
            transparent
            opacity={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

// Main Ball Pit Scene
const BallPitScene: React.FC<{
  transactions: Transaction[];
  onTransactionClick: (tx: Transaction) => void;
  isDarkMode: boolean;
  isLoreMode: boolean;
}> = ({ transactions, onTransactionClick, isDarkMode, isLoreMode }) => {

  const ballPositions = useMemo(() => {
    return transactions.map((_, index) => {
      // Spread balls across the pit floor area randomly
      const x = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      const y = 3 + Math.random() * 2; // Start higher so they fall
      return [x, y, z] as [number, number, number];
    });
  }, [transactions]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-8, 4, -8]} intensity={0.4} color="#8b5cf6" />
      
      <BallPitEnvironment isDarkMode={isDarkMode} />
      
      {transactions.map((transaction, index) => (
        <TransactionBall
          key={transaction.id}
          transaction={transaction}
          position={ballPositions[index]}
          onClick={onTransactionClick}
          isDarkMode={isDarkMode}
          isLoreMode={isLoreMode}
          index={index}
        />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, -1, 0]}
      />
    </>
  );
};

const BallPitTransactionVisualization: React.FC<BallPitTransactionVisualizationProps> = ({
  data,
  isDarkMode,
  isLoreMode
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const transactions = useMemo(() => {
    if (!data?.result?.data) return [];
    
    const activities = data.result.data;
    const txs: Transaction[] = [];
    
    activities.forEach((activity: any) => {
      let type: 'send' | 'receive' | 'contract' = 'contract';
      let amount = Number(activity.transactionFee || 0);
      let color = '#8b5cf6';
      
      if (activity.from) {
        type = 'send';
        color = '#ef4444';
      } else if (activity.addTokens?.length > 0) {
        type = 'receive';
        color = '#10b981';
        amount = activity.addTokens.reduce((sum: number, token: any) => sum + Number(token.amount || 0), 0);
      }
      
      txs.push({
        id: activity.hash,
        type,
        amount,
        timestamp: new Date(activity.timestamp),
        hash: activity.hash,
        from: activity.from,
        to: activity.to,
        gasUsed: Number(activity.transactionFee || 0),
        color
      });
    });
    
    return txs;
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send': return <Send className="w-4 h-4" />;
      case 'receive': return <Download className="w-4 h-4" />;
      case 'contract': return <Code className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    if (isLoreMode) {
      switch (type) {
        case 'send': return 'Mind Send';
        case 'receive': return 'Mind Receive';
        case 'contract': return 'Mind Bridge';
        default: return 'Memory';
      }
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      <div className="absolute inset-0">
        <ErrorBoundary>
          <Canvas
            camera={{ position: [12, 8, 12], fov: 60 }}
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance'
            }}
            onCreated={({ gl }) => {
              gl.setClearColor(isDarkMode ? '#0f172a' : '#ffffff', 0);
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }}
          >
            <Suspense fallback={null}>
              <BallPitScene
                transactions={transactions}
                onTransactionClick={handleTransactionClick}
                isDarkMode={isDarkMode}
                isLoreMode={isLoreMode}
              />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Ball Pit Label Overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} bg-black/20 backdrop-blur-sm rounded px-3 py-1`}>
          {isLoreMode ? "Mind Ball Pit" : "Transaction Ball Pit"}
        </h3>
      </div>

      {/* Transaction Details Panel */}
      {selectedTransaction && (
        <div className="absolute top-4 left-4 max-w-sm">
          <Card className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} animate-scale-in`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedTransaction.color }}
                  >
                    {getTypeIcon(selectedTransaction.type)}
                  </div>
                  <div>
                    <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getTypeLabel(selectedTransaction.type)}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedTransaction.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount:</span>
                  <p className={`font-mono font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedTransaction.amount} MON
                  </p>
                </div>
                <div>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gas Used:</span>
                  <p className={`font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedTransaction.gasUsed}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hash:</span>
                  <p className={`font-mono text-xs break-all ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {selectedTransaction.hash}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
        <div className="flex justify-center space-x-6 bg-black/20 backdrop-blur-sm rounded-lg p-3">
          {[
            { type: 'send', color: '#ef4444', label: isLoreMode ? 'Mind Send' : 'Sent' },
            { type: 'receive', color: '#10b981', label: isLoreMode ? 'Mind Receive' : 'Received' },
            { type: 'contract', color: '#8b5cf6', label: isLoreMode ? 'Mind Bridge' : 'Contract' }
          ].map((item) => (
            <div key={item.type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} bg-black/20 backdrop-blur-sm rounded px-3 py-1`}>
          Hover over balls to make them bounce • Drag to rotate • Scroll to zoom • Click balls for details
        </div>
      </div>
    </div>
  );
};

export default BallPitTransactionVisualization;
