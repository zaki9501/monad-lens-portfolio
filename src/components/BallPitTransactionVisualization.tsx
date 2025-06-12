
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
  mousePosition: THREE.Vector3;
}> = ({ transaction, position, onClick, isDarkMode, isLoreMode, mousePosition }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const [currentPosition, setCurrentPosition] = useState(new THREE.Vector3(...position));
  const [isHovered, setIsHovered] = useState(false);
  
  const ballSize = useMemo(() => {
    // Size based on transaction amount
    const baseSize = 0.3;
    const sizeMultiplier = Math.min(transaction.amount / 1000, 2);
    return baseSize + sizeMultiplier * 0.2;
  }, [transaction.amount]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const gravity = -9.8;
    const bounce = 0.7;
    const friction = 0.98;
    const repelForce = 5;
    const repelDistance = 2;

    // Mouse repulsion effect
    const mouseWorldPos = mousePosition.clone();
    const distance = mesh.position.distanceTo(mouseWorldPos);
    
    if (distance < repelDistance) {
      const direction = new THREE.Vector3()
        .subVectors(mesh.position, mouseWorldPos)
        .normalize();
      const force = (repelDistance - distance) / repelDistance * repelForce;
      velocityRef.current.add(direction.multiplyScalar(force * delta));
    }

    // Apply gravity
    velocityRef.current.y += gravity * delta;

    // Update position
    mesh.position.add(velocityRef.current.clone().multiplyScalar(delta));

    // Boundary collision (ball pit walls)
    const bounds = { x: 8, y: 2, z: 8 };
    
    // Floor collision
    if (mesh.position.y - ballSize <= -bounds.y) {
      mesh.position.y = -bounds.y + ballSize;
      velocityRef.current.y *= -bounce;
      velocityRef.current.x *= friction;
      velocityRef.current.z *= friction;
    }

    // Wall collisions
    if (Math.abs(mesh.position.x) + ballSize >= bounds.x) {
      mesh.position.x = Math.sign(mesh.position.x) * (bounds.x - ballSize);
      velocityRef.current.x *= -bounce;
    }
    
    if (Math.abs(mesh.position.z) + ballSize >= bounds.z) {
      mesh.position.z = Math.sign(mesh.position.z) * (bounds.z - ballSize);
      velocityRef.current.z *= -bounce;
    }

    // Rotation based on velocity
    mesh.rotation.x += velocityRef.current.z * delta;
    mesh.rotation.z -= velocityRef.current.x * delta;

    // Hover effect
    const targetScale = isHovered ? 1.2 : 1;
    mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
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
          emissiveIntensity={isHovered ? 0.3 : 0.1}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Hover Details */}
      {isHovered && (
        <Html position={[0, ballSize + 0.5, 0]} center>
          <div className={`p-3 rounded-lg shadow-lg max-w-xs ${
            isDarkMode ? 'bg-slate-800 text-white border border-slate-600' : 'bg-white text-black border border-gray-200'
          } pointer-events-none z-50`}>
            <div className="flex items-center space-x-2 text-sm">
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
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[16, 0.2, 16]} />
        <meshStandardMaterial
          color={isDarkMode ? "#1e293b" : "#f1f5f9"}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Walls */}
      {[
        { pos: [8, 0, 0], rot: [0, 0, 0], size: [0.2, 4, 16] },
        { pos: [-8, 0, 0], rot: [0, 0, 0], size: [0.2, 4, 16] },
        { pos: [0, 0, 8], rot: [0, 0, 0], size: [16, 4, 0.2] },
        { pos: [0, 0, -8], rot: [0, 0, 0], size: [16, 4, 0.2] }
      ].map((wall, index) => (
        <mesh key={index} position={wall.pos as [number, number, number]}>
          <boxGeometry args={wall.size as [number, number, number]} />
          <meshStandardMaterial
            color={isDarkMode ? "#334155" : "#e2e8f0"}
            transparent
            opacity={0.3}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

// Mouse Tracker
const MouseTracker: React.FC<{ onMouseMove: (pos: THREE.Vector3) => void }> = ({ onMouseMove }) => {
  const { camera, size } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / size.width) * 2 - 1;
      mouse.y = -(event.clientY / size.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      
      // Create an invisible plane at y = 0 for mouse intersection
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      onMouseMove(intersection);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera, size, mouse, raycaster, onMouseMove]);

  return null;
};

// Main Ball Pit Scene
const BallPitScene: React.FC<{
  transactions: Transaction[];
  onTransactionClick: (tx: Transaction) => void;
  isDarkMode: boolean;
  isLoreMode: boolean;
}> = ({ transactions, onTransactionClick, isDarkMode, isLoreMode }) => {
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3(0, 0, 0));

  const ballPositions = useMemo(() => {
    return transactions.map((_, index) => {
      const angle = (index / transactions.length) * Math.PI * 2;
      const radius = 3 + Math.random() * 3;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
      const y = 2 + Math.random() * 4;
      return [x, y, z] as [number, number, number];
    });
  }, [transactions]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#8b5cf6" />
      
      <BallPitEnvironment isDarkMode={isDarkMode} />
      
      <MouseTracker onMouseMove={setMousePosition} />
      
      {transactions.map((transaction, index) => (
        <TransactionBall
          key={transaction.id}
          transaction={transaction}
          position={ballPositions[index]}
          onClick={onTransactionClick}
          isDarkMode={isDarkMode}
          isLoreMode={isLoreMode}
          mousePosition={mousePosition}
        />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
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
            camera={{ position: [15, 10, 15], fov: 60 }}
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
          Move mouse to interact • Drag to rotate • Scroll to zoom • Click balls for details
        </div>
      </div>
    </div>
  );
};

export default BallPitTransactionVisualization;
