import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';

interface NodePoint {
  position: [number, number, number];
  id: string;
  label: string;
}

interface GlobeProps {
  blocks: any[]; // Pass recent blocks instead of transactions for block rays
  onBlockClick: (block: any) => void;
}

const Globe = ({ blocks, onBlockClick }: GlobeProps) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);

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

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (globeRef.current) {
      globeRef.current.rotation.y = time * 0.05;
    }
    
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
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        {/* --- Add StarField before lights and the Globe --- */}
        <StarField count={300} />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#00BFFF" />
        <pointLight position={[10, 10, 10]} intensity={1.8} color="#00FFFF" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#00FF88" />
        {/* Pass blocks to Globe, not transactions */}
        <Globe blocks={blocks} onBlockClick={onBlockClick} />
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={true} autoRotateSpeed={0.5} minDistance={2} maxDistance={5} /> 
      </Canvas>
    </div>
  );
};

export default Globe3D;
