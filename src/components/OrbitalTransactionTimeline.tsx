import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, ArrowUp, ArrowDown, Send, Download, Code } from "lucide-react";

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'contract';
  amount: number;
  timestamp: Date;
  hash: string;
  from?: string;
  to?: string;
  gasUsed: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  color: string;
}

interface OrbitalTransactionTimelineProps {
  data: any;
  isDarkMode: boolean;
  isLoreMode: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Scene Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
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

interface WebGLContextHandlerProps {
  children: React.ReactNode;
}

// WebGL Context Handler
const WebGLContextHandler: React.FC<WebGLContextHandlerProps> = ({ children }) => {
  const { gl, scene, camera } = useThree();
  
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log('WebGL Context Lost');
    };

    const handleContextRestored = () => {
      console.log('WebGL Context Restored');
      if (scene && camera) {
        gl.render(scene, camera);
      }
    };

    gl.domElement.addEventListener('webglcontextlost', handleContextLost);
    gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      gl.domElement.removeEventListener('webglcontextlost', handleContextLost);
      gl.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, scene, camera]);

  return <>{children}</>;
};

// Scene Setup Component
const SceneSetup: React.FC = () => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    // Initialize scene
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 20, 100);

    // Initialize camera
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Initialize renderer
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(window.innerWidth, window.innerHeight);
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    // Handle resize
    const handleResize = () => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      } else if (camera instanceof THREE.OrthographicCamera) {
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 10;
        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();
      }
      gl.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gl, scene, camera]);

  return null;
};

// Modified WalletSun Component
const WalletSun: React.FC<{ isDarkMode: boolean; isLoreMode: boolean }> = ({ isDarkMode, isLoreMode }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color={isDarkMode ? "#8b5cf6" : "#7c3aed"}
          emissive={isDarkMode ? "#4c1d95" : "#5b21b6"}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2, 2.5, 64]} />
        <meshBasicMaterial
          color={isDarkMode ? "#8b5cf6" : "#7c3aed"}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color={isDarkMode ? "#ffffff" : "#000000"}
        anchorX="center"
        anchorY="middle"
      >
        {isLoreMode ? "Mind Core" : "Wallet"}
      </Text>
    </group>
  );
};

// Transaction Orb Component
const TransactionOrb: React.FC<{
  transaction: Transaction;
  onClick: (tx: Transaction) => void;
  isDarkMode: boolean;
  isLoreMode: boolean;
  isHovered: boolean;
  onHover: (tx: Transaction | null) => void;
}> = ({ transaction, onClick, isDarkMode, isLoreMode, isHovered, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentAngle, setCurrentAngle] = useState(transaction.angle);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Orbital movement
      setCurrentAngle(prev => prev + transaction.speed * delta);
      const x = Math.cos(currentAngle) * transaction.radius;
      const z = Math.sin(currentAngle) * transaction.radius;
      meshRef.current.position.set(x, 0, z);
      
      // Rotation
      meshRef.current.rotation.y += delta * 2;
      
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
    <group>
      <Sphere
        ref={meshRef}
        args={[transaction.size, 16, 16]}
        onClick={() => onClick(transaction)}
        onPointerEnter={() => onHover(transaction)}
        onPointerLeave={() => onHover(null)}
      >
        <meshStandardMaterial
          color={transaction.color}
          emissive={transaction.color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {/* Orbital Trail */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[transaction.radius - 0.05, transaction.radius + 0.05, 64]} />
        <meshBasicMaterial
          color={transaction.color}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hover Details */}
      {isHovered && (
        <Html position={[0, transaction.size + 0.5, 0]} center>
          <div className={`p-2 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-slate-800 text-white border border-slate-600' : 'bg-white text-black border border-gray-200'
          } pointer-events-none`}>
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

// Modified ParticleField Component
const ParticleField: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={isDarkMode ? "#8b5cf6" : "#7c3aed"}
        transparent
        opacity={0.5}
      />
    </points>
  );
};

// Main 3D Scene Component
const Scene3D: React.FC<{
  transactions: Transaction[];
  onTransactionClick: (tx: Transaction) => void;
  isDarkMode: boolean;
  isLoreMode: boolean;
}> = ({ transactions, onTransactionClick, isDarkMode, isLoreMode }) => {
  const [hoveredTransaction, setHoveredTransaction] = useState<Transaction | null>(null);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <ParticleField isDarkMode={isDarkMode} />
      <WalletSun isDarkMode={isDarkMode} isLoreMode={isLoreMode} />
      
      {transactions.map((transaction) => (
        <TransactionOrb
          key={transaction.id}
          transaction={transaction}
          onClick={onTransactionClick}
          isDarkMode={isDarkMode}
          isLoreMode={isLoreMode}
          isHovered={hoveredTransaction?.id === transaction.id}
          onHover={setHoveredTransaction}
        />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const OrbitalTransactionTimeline: React.FC<OrbitalTransactionTimelineProps> = ({
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
      const age = Date.now() - new Date(activity.timestamp).getTime();
      const daysSinceTransaction = age / (1000 * 60 * 60 * 24);
      
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
      
      // Calculate orbital properties
      const radius = Math.min(3 + daysSinceTransaction * 0.5, 15); // Newer = closer
      const size = Math.max(0.1, Math.min(amount / 100, 0.8)); // Size based on amount
      const speed = Math.max(0.1, 2 / radius); // Closer orbits = faster
      
      txs.push({
        id: activity.hash,
        type,
        amount,
        timestamp: new Date(activity.timestamp),
        hash: activity.hash,
        from: activity.from,
        to: activity.to,
        gasUsed: Number(activity.transactionFee || 0),
        angle: (index * 0.5) % (Math.PI * 2), // Spread transactions around
        radius,
        speed,
        size,
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
            camera={{ position: [0, 5, 10], fov: 50 }}
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              failIfMajorPerformanceCaveat: true,
              preserveDrawingBuffer: true,
              logarithmicDepthBuffer: true
            }}
            onCreated={({ gl }) => {
              gl.setClearColor(isDarkMode ? '#0f172a' : '#ffffff', 0);
            }}
            dpr={[1, 2]}
          >
            <WebGLContextHandler>
              <Suspense fallback={null}>
                <SceneSetup />
                <Scene3D
                  transactions={transactions}
                  onTransactionClick={handleTransactionClick}
                  isDarkMode={isDarkMode}
                  isLoreMode={isLoreMode}
                />
              </Suspense>
            </WebGLContextHandler>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Transaction Details Panel */}
      {selectedTransaction && (
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
      )}

      {/* Legend */}
      <div className="flex justify-center space-x-6">
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

      {/* Instructions */}
      <div className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        Drag to rotate • Scroll to zoom • Click orbs for details • Auto-rotation enabled
      </div>
    </div>
  );
};

export default OrbitalTransactionTimeline;
