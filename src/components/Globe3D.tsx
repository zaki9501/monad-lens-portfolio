import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { validators } from '@/utils/validatorData';
import { Switch } from '@/components/ui/switch';

interface NodePoint {
  position: [number, number, number];
  id: string;
  label: string;
}

interface GlobeProps {
  blocks: any[]; // Pass recent blocks instead of transactions for block rays
  onBlockClick: (block: any) => void;
  isRotating: boolean;
  onValidatorClick: (country: string) => void;
}

interface ValidatorMarkerProps {
  position: [number, number, number];
  successRate: number;
  country: string;
  onClick: (country: string) => void;
}

const Globe = ({ blocks, onBlockClick, isRotating, onValidatorClick }: GlobeProps) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);
  const validatorsGroupRef = useRef<THREE.Group>(null);
  const rotationSpeed = 0.05;
  const lastRotationRef = useRef(0);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showValidators, setShowValidators] = useState(false);

  // Load textures for the Earth globe
  const [earthMap, earthSpecular, earthLights] = useLoader(TextureLoader, [
    '/textures/earth_daymap.jpg',
    '/textures/earth_specular.jpg',
    '/textures/earth_lights.jpg',
  ]);

  // Node positions on the globe sphere
  const nodes: NodePoint[] = useMemo(() => [
    { position: [0.8, 0.4, 0.4], id: 'node1', label: 'US-East' },
    { position: [-0.6, 0.6, 0.5], id: 'node2', label: 'Europe' },
    { position: [0.3, -0.7, 0.6], id: 'node3', label: 'Asia' },
    { position: [-0.4, -0.5, -0.7], id: 'node4', label: 'Australia' },
    { position: [0.7, 0.1, -0.7], id: 'node5', label: 'Africa' },
  ], []);

  // Generate connection paths between nodes
  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        try {
          const startPos = nodes[i].position;
          const endPos = nodes[j].position;
          
          if (!startPos || !endPos || startPos.length !== 3 || endPos.length !== 3) {
            console.warn('Invalid node positions:', startPos, endPos);
            continue;
          }
          
          const start = new THREE.Vector3(startPos[0], startPos[1], startPos[2]);
          const end = new THREE.Vector3(endPos[0], endPos[1], endPos[2]);
          
          const mid = start.clone().add(end).multiplyScalar(0.5);
          mid.normalize().multiplyScalar(1.3); 
          
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const points = curve.getPoints(50);
          
          conns.push({
            points,
            startNode: nodes[i].id,
            endNode: nodes[j].id,
            active: Math.random() > 0.3
          });
        } catch (error) {
          console.warn('Failed to create connection:', error);
        }
      }
    }
    return conns;
  }, [nodes]);

  // Corrected lat/long to 3D coordinates conversion
  const latLongToVector3 = (lat: number, long: number, radius: number = 1.02): [number, number, number] => {
    // Convert latitude and longitude to radians
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);
    
    // Convert spherical coordinates to Cartesian coordinates
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return [x, y, z];
  };

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Handle globe rotation
    if (globeRef.current) {
      if (isRotating) {
        globeRef.current.rotation.y = time * rotationSpeed;
        lastRotationRef.current = globeRef.current.rotation.y;
      } else {
        // Keep the last rotation position when stopped
        globeRef.current.rotation.y = lastRotationRef.current;
      }
    }
    
    // Handle validator markers rotation
    if (validatorsGroupRef.current) {
      if (isRotating) {
        validatorsGroupRef.current.rotation.y = -time * rotationSpeed;
      } else {
        // Keep validators fixed when rotation is stopped
        validatorsGroupRef.current.rotation.y = -lastRotationRef.current;
      }
    }
    
    // Handle ray animations (keep these running regardless of rotation)
    if (raysRef.current) {
      raysRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.material && !Array.isArray(child.material)) {
          const material = child.material as THREE.MeshBasicMaterial;
          if (material.opacity !== undefined) {
            const offset = (time + index * 0.5) % 2;
            material.opacity = Math.sin(offset * Math.PI) * 0.8 + 0.2;
          }
        }
      });
    }
  });

  // Add function to get block type
  function getBlockType(block: any) {
    if (!block) return 'regular';
    const txs = block.transactions || [];
    // "Empty" block (no user txs)
    if (txs.length === 0) return 'empty';
    // "Large" block: arbitrarily, >95% gas used
    let isLarge = false;
    if (block.gasLimit && block.gasUsed) {
      const gasLimit = parseInt(block.gasLimit, 16);
      const gasUsed = parseInt(block.gasUsed, 16);
      if (!isNaN(gasLimit) && !isNaN(gasUsed) && gasUsed > 0.95 * gasLimit) {
        isLarge = true;
      }
    }
    if (isLarge) return 'large';
    // "Contract deploy" block: all txs are contract creation (to === null or 0x0...0)
    if (
      txs.length > 0 &&
      txs.every((tx: any) =>
        !tx.to || tx.to === "0x" || /^0x0+$/.test(tx.to)
      )
    ) {
      return 'deployment';
    }
    return 'regular';
  }

  const handleValidatorClick = (country: string) => {
    setSelectedCountry(country);
    setShowValidators(true);
    onValidatorClick(country);
  };

  return (
    <group>
      {/* Main Globe */}
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          map={earthMap}
          specularMap={earthSpecular}
          emissiveMap={earthLights}
          emissive="#ffffff" // White emissive color to show texture's full brightness
          emissiveIntensity={1} // Intensity of the emissive map
          shininess={10} // Adjusted shininess
          color="#222222" // Base color, combines with texture
        />
      </Sphere>
      
      {/* Globe wireframe overlay (constellation-like) */}
      <Sphere args={[1.005, 128, 128]}>
        <meshBasicMaterial
          color="#00FFFF"
          transparent
          opacity={0.03}
          wireframe
        />
      </Sphere>
      
      {/* Validator Markers Group - Counter-rotating to stay fixed */}
      <group ref={validatorsGroupRef}>
        {validators.map((validator, index) => {
          if (!validator.coordinates) return null;
          const [lat, long] = validator.coordinates;
          const position = latLongToVector3(lat, long);
          return (
            <ValidatorMarker
              key={validator.name}
              position={position}
              successRate={validator.successRate}
              country={validator.country}
              onClick={handleValidatorClick}
            />
          );
        })}
      </group>
      
      {/* Node points */}
      {nodes.map((node, index) => (
        <group key={node.id}>
          <mesh position={node.position}>
            <sphereGeometry args={[index === 0 ? 0.05 : 0.02, 16, 16]} /> {/* Central node larger */}
            <meshBasicMaterial color={index === 0 ? "#00BFFF" : "#00ffff"} /> {/* Central node distinct color */}
          </mesh>
          {/* Node glow */}
          <mesh position={node.position}>
            <sphereGeometry args={[index === 0 ? 0.08 : 0.04, 16, 16]} /> {/* Central node glow larger */}
            <meshBasicMaterial
              color={index === 0 ? "#00BFFF" : "#00ffff"}
              transparent
              opacity={index === 0 ? 0.4 : 0.2} // Central node glow stronger
            />
          </mesh>
        </group>
      ))}
      
      {/* Connection rays (static background lines) */}
      <group ref={raysRef}>
        {connections.filter(connection => connection.active && connection.points && connection.points.length > 1).map((connection, index) => (
          <ConnectionRay
            key={index}
            points={connection.points}
            color="#00FF88" 
            opacity={0.01} 
          />
        ))}
      </group>

      {/* Block rays: For each recent block, show a traveling ray from main node to random */}
      {blocks.slice(0, 25).map((block, index) => {
        const originNode = { position: [0.8, 0.4, 0.4], id: 'node1', label: 'US-East' }; // same as your main node
        // Generate deterministic random using block hash for consistency
        const hash = typeof block.hash === 'string' ? block.hash : String(index);
        const hashSeed = parseInt(hash.slice(2, 10), 16) || index + 1;
        const phi = Math.acos((2 * ((hashSeed % 1000) / 999)) - 1);
        const theta = 2 * Math.PI * ((hashSeed % 997) / 997);

        const randomDestination = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        );

        const start = new THREE.Vector3(...originNode.position);
        const end = randomDestination;

        const mid = start.clone().add(end).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(1.3); 

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const path = curve.getPoints(50);

        // Choose color based on block type
        const blockType = getBlockType(block);
        let rayColor = "#00FFFF"; // default cyan
        if (blockType === "empty") rayColor = "#FFD600";
        else if (blockType === "large") rayColor = "#FF0055";
        else if (blockType === "deployment") rayColor = "#3B82F6";

        return path.length > 1 ? (
          <AnimatedConnectionRay
            key={block.hash + index}
            points={path}
            blockData={block}
            onClick={onBlockClick}
            color={rayColor}
            delay={index * 0.6}
            size={0.06}
          />
        ) : null;
      })}
    </group>
  );
};

interface ConnectionRayProps {
  points: THREE.Vector3[];
  color?: string;
  opacity?: number;
}

const ConnectionRay = ({ points, color = "#00FF88", opacity = 0.05 }: ConnectionRayProps) => {
  const geometry = useMemo(() => {
    if (!points || points.length < 2) {
      return null;
    }
    
    const validPoints = points.filter(point => 
      point instanceof THREE.Vector3 && 
      typeof point.x === 'number' && 
      typeof point.y === 'number' && 
      typeof point.z === 'number' &&
      !isNaN(point.x) && !isNaN(point.y) && !isNaN(point.z)
    );
    
    if (validPoints.length < 2) {
      return null;
    }
    
    try {
      const curve = new THREE.CatmullRomCurve3(validPoints);
      return new THREE.TubeGeometry(curve, 50, 0.005, 8, false);
    } catch (error) {
      console.warn('Failed to create tube geometry:', error);
      return null;
    }
  }, [points]);

  if (!geometry) {
    return null;
  }

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
};

interface AnimatedConnectionRayProps {
  points: THREE.Vector3[];
  color?: string;
  opacity?: number;
  blockData?: any;
  onClick?: (block: any) => void;
  delay?: number;
  size?: number;
}

const AnimatedConnectionRay = ({ points, blockData, onClick, color = "#00FFFF", delay = 0, size = 0.02 }: AnimatedConnectionRayProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    if (!points || points.length < 2) {
      return null;
    }
    const validPoints = points.filter(point =>
      point instanceof THREE.Vector3 &&
      typeof point.x === 'number' &&
      typeof point.y === 'number' &&
      typeof point.z === 'number' &&
      !isNaN(point.x) && !isNaN(point.y) && !isNaN(point.z)
    );
    if (validPoints.length < 2) {
      return null;
    }
    try {
      const curve = new THREE.CatmullRomCurve3(validPoints);
      return new THREE.TubeGeometry(curve, 50, 0.015, 32, false); // slightly bigger ray for blocks
    } catch (error) {
      console.warn('Failed to create animated tube geometry:', error);
      return null;
    }
  }, [points, size]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !geometry || !geometry.index) return;

    const totalIndices = geometry.index.count;

    const time = (clock.getElapsedTime() + delay);
    const animationDuration = 3;
    const progress = (time % animationDuration) / animationDuration;

    const segmentRatio = 0.3;
    const startRatio = progress;
    const endRatio = progress + segmentRatio;

    const drawStart = Math.floor(startRatio * totalIndices);
    const drawEnd = Math.floor(endRatio * totalIndices);

    geometry.setDrawRange(drawStart, drawEnd - drawStart);

    if (meshRef.current.material && !Array.isArray(meshRef.current.material)) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      const opacityCurve = Math.sin(progress * Math.PI);
      material.opacity = Math.max(0.2, opacityCurve * 0.8);
    }
  });

  if (!geometry) {
    return null;
  }

  return (
    <mesh ref={meshRef} onClick={() => onClick && blockData && onClick(blockData)}>
      <primitive object={geometry} attach="geometry" />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

// --- StarField Sub-component ---
const StarField = ({ count = 300 }) => {
  // Generate random positions for the stars just one time
  const positions = useMemo(() => {
    const positionsArr = [];
    const radius = 4.5; // far behind the main globe (radius=1)
    for (let i = 0; i < count; i++) {
      // Spherical coordinates: random point on sphere shell
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + (Math.random() - 0.5) * 0.2; // Slight jitter
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positionsArr.push([x, y, z]);
    }
    return positionsArr;
  }, [count]);

  return (
    <group>
      {positions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#fff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

interface Globe3DProps {
  blocks: any[]; // Now uses blocks, not transactions
  onBlockClick: (block: any) => void;
}

const Globe3D = ({ blocks, onBlockClick }: Globe3DProps) => {
  const [isRotating] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showValidators, setShowValidators] = useState(false);

  const handleValidatorClick = (country: string) => {
    setSelectedCountry(country);
    setShowValidators(true);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="relative flex-1">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Globe 
            blocks={blocks} 
            onBlockClick={onBlockClick} 
            isRotating={isRotating}
            onValidatorClick={handleValidatorClick}
          />
          <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            enableRotate={true}
            minDistance={1.2}
            maxDistance={5}
            zoomSpeed={0.8}
            panSpeed={0.5}
            rotateSpeed={0.5}
            autoRotate={false}
          />
        </Canvas>
      </div>

      {/* Validators List Panel */}
      {showValidators && selectedCountry && (
        <div className="w-full bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-md border-t border-purple-500/20 p-6 transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">
                Validators in {selectedCountry}
              </h3>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {validators.filter(v => v.country === selectedCountry).length} Validators
              </span>
            </div>
            <button 
              onClick={() => setShowValidators(false)}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-full"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto custom-scrollbar">
            {validators
              .filter(v => v.country === selectedCountry)
              .map(validator => (
                <div 
                  key={validator.name}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-white font-medium truncate max-w-[80%]">
                      {validator.name}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      validator.successRate >= 99 ? 'bg-green-500/20 text-green-300' :
                      validator.successRate >= 95 ? 'bg-blue-500/20 text-blue-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {validator.successRate}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{validator.stake} MONAD</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Update ValidatorMarker to be more visible
const ValidatorMarker = ({ position, successRate, country, onClick }: ValidatorMarkerProps) => {
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick(country);
  };

  return (
    <group position={position} onClick={handleClick}>
      {/* Main marker */}
      <mesh>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#9333EA" /> {/* Purple color */}
      </mesh>
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial
          color="#9333EA"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

// Add this CSS to your global styles or component
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(147, 51, 234, 0.5);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(147, 51, 234, 0.7);
  }
`;

export default Globe3D;
