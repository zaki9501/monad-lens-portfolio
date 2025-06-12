
import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  helixPosition: number;
  color: string;
}

interface HelixTransactionTimelineProps {
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
            <p className="text-red-500">Failed to load 3D visualization</p>
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

// Helix Structure Component
const HelixStructure: React.FC<{ isDarkMode: boolean; transactions: Transaction[] }> = ({ isDarkMode, transactions }) => {
  const helixRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y += 0.002;
    }
  });

  // Create helix curve points
  const helixPoints = useMemo(() => {
    const points = [];
    const radius = 4;
    const height = 20;
    const turns = 3;
    
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = t * turns * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (t - 0.5) * height;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, []);

  const helixCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(helixPoints);
  }, [helixPoints]);

  const helixGeometry = useMemo(() => {
    return new THREE.TubeGeometry(helixCurve, 100, 0.05, 8, false);
  }, [helixCurve]);

  return (
    <group ref={helixRef}>
      {/* Helix Structure */}
      <mesh>
        <primitive object={helixGeometry} />
        <meshBasicMaterial
          color={isDarkMode ? "#8b5cf6" : "#7c3aed"}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Particle Trail */}
      {helixPoints.map((point, index) => (
        index % 10 === 0 && (
          <mesh key={index} position={[point.x, point.y, point.z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial
              color={isDarkMode ? "#8b5cf6" : "#7c3aed"}
              transparent
              opacity={0.6}
            />
          </mesh>
        )
      ))}
    </group>
  );
};

// Transaction Node Component
const TransactionNode: React.FC<{
  transaction: Transaction;
  onClick: (tx: Transaction) => void;
  isDarkMode: boolean;
  isLoreMode: boolean;
  isHovered: boolean;
  onHover: (tx: Transaction | null) => void;
}> = ({ transaction, onClick, isDarkMode, isLoreMode, isHovered, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate position on helix
  const position = useMemo(() => {
    const radius = 4;
    const height = 20;
    const turns = 3;
    const t = transaction.helixPosition;
    const angle = t * turns * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (t - 0.5) * height;
    return [x, y, z] as [number, number, number];
  }, [transaction.helixPosition]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
      
      // Hover effect
      const scale = isHovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 5);
    }
  });

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'send': return <ArrowUp size={12} />;
      case 'receive': return <ArrowDown size={12} />;
      case 'contract': return <Code size={12} />;
      default: return <Zap size={12} />;
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(transaction)}
        onPointerEnter={() => onHover(transaction)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={transaction.color}
          emissive={transaction.color}
          emissiveIntensity={isHovered ? 0.5 : 0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Glow effect for hovered transaction */}
      {isHovered && (
        <mesh>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial
            color={transaction.color}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Hover Details */}
      {isHovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className={`p-2 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-slate-800 text-white border border-slate-600' : 'bg-white text-black border border-gray-200'
          } pointer-events-none z-50`}>
            <div className="flex items-center space-x-1 text-xs">
              {getTransactionIcon()}
              <span className="font-semibold">{transaction.amount} MON</span>
            </div>
            <div className="text-xs opacity-70">
              {transaction.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Main Scene Component
const HelixScene: React.FC<{
  transactions: Transaction[];
  onTransactionClick: (tx: Transaction) => void;
  isDarkMode: boolean;
  isLoreMode: boolean;
}> = ({ transactions, onTransactionClick, isDarkMode, isLoreMode }) => {
  const [hoveredTransaction, setHoveredTransaction] = useState<Transaction | null>(null);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <HelixStructure isDarkMode={isDarkMode} transactions={transactions} />
      
      {transactions.map((transaction) => (
        <TransactionNode
          key={transaction.id}
          transaction={transaction}
          onClick={onTransactionClick}
          isDarkMode={isDarkMode}
          isLoreMode={isLoreMode}
          isHovered={hoveredTransaction?.id === transaction.id}
          onHover={setHoveredTransaction}
        />
      ))}
      
      {/* Central Timeline Label */}
      <Text
        position={[0, 12, 0]}
        fontSize={0.8}
        color={isDarkMode ? "#ffffff" : "#000000"}
        anchorX="center"
        anchorY="middle"
      >
        {isLoreMode ? "Mind Timeline" : "Transaction History"}
      </Text>
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={1}
      />
    </>
  );
};

const HelixTransactionTimeline: React.FC<HelixTransactionTimelineProps> = ({
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
    
    activities.forEach((activity: any, index: number) => {
      // Determine transaction type and properties
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
        helixPosition: index / (activities.length - 1), // 0 to 1
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
            camera={{ position: [10, 5, 10], fov: 60 }}
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance'
            }}
            onCreated={({ gl }) => {
              gl.setClearColor(isDarkMode ? '#0f172a' : '#ffffff', 0);
            }}
          >
            <Suspense fallback={null}>
              <HelixScene
                transactions={transactions}
                onTransactionClick={handleTransactionClick}
                isDarkMode={isDarkMode}
                isLoreMode={isLoreMode}
              />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
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
          Drag to rotate • Scroll to zoom • Click nodes for details • Auto-rotation enabled
        </div>
      </div>
    </div>
  );
};

export default HelixTransactionTimeline;
