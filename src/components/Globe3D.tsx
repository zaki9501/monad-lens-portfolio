
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface NodePoint {
  position: [number, number, number];
  id: string;
  label: string;
}

interface GlobeProps {
  transactions: any[];
}

const Globe = ({ transactions }: GlobeProps) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);

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
          // Ensure we have valid position arrays
          const startPos = nodes[i].position;
          const endPos = nodes[j].position;
          
          if (!startPos || !endPos || startPos.length !== 3 || endPos.length !== 3) {
            console.warn('Invalid node positions:', startPos, endPos);
            continue;
          }
          
          const start = new THREE.Vector3(startPos[0], startPos[1], startPos[2]);
          const end = new THREE.Vector3(endPos[0], endPos[1], endPos[2]);
          
          // Create curved path using quadratic bezier
          const mid = start.clone().add(end).multiplyScalar(0.5);
          mid.normalize().multiplyScalar(1.3); // Push outward for curve
          
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
    
    // Rotate globe slowly
    if (globeRef.current) {
      globeRef.current.rotation.y = time * 0.1;
    }
    
    // Animate rays
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

  return (
    <group>
      {/* Main Globe */}
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          color="#001122"
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </Sphere>
      
      {/* Globe wireframe overlay */}
      <Sphere args={[1.01, 32, 32]}>
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0.1}
          wireframe
        />
      </Sphere>
      
      {/* Node points */}
      {nodes.map((node) => (
        <group key={node.id}>
          <mesh position={node.position}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
          {/* Node glow */}
          <mesh position={node.position}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      ))}
      
      {/* Connection rays using tube geometry */}
      <group ref={raysRef}>
        {connections.filter(connection => connection.active && connection.points && connection.points.length > 1).map((connection, index) => (
          <ConnectionRay
            key={index}
            points={connection.points}
          />
        ))}
      </group>
      
      {/* Animated particles */}
      {transactions.slice(0, 5).map((tx, index) => {
        const validConnections = connections.filter(conn => conn.points && conn.points.length > 1);
        const connectionIndex = index % validConnections.length;
        const path = validConnections[connectionIndex]?.points || [];
        
        return path.length > 1 ? (
          <AnimatedParticle
            key={tx.hash + index}
            path={path}
            delay={index * 0.5}
          />
        ) : null;
      })}
    </group>
  );
};

const ConnectionRay = ({ points }: { points: THREE.Vector3[] }) => {
  const geometry = useMemo(() => {
    // Ensure we have valid points
    if (!points || points.length < 2) {
      return null;
    }
    
    // Validate that all points are proper Vector3 objects
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

  // Don't render if we don't have a valid geometry
  if (!geometry) {
    return null;
  }

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color="#00ff88"
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

const AnimatedParticle = ({ path, delay }: { path: THREE.Vector3[]; delay: number }) => {
  const particleRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!particleRef.current || !path || path.length < 2) return;
    
    const time = (clock.getElapsedTime() + delay) % 3;
    const progress = time / 3;
    const index = Math.floor(progress * (path.length - 1));
    const nextIndex = Math.min(index + 1, path.length - 1);
    const localProgress = (progress * (path.length - 1)) % 1;
    
    if (path[index] && path[nextIndex]) {
      const position = path[index].clone().lerp(path[nextIndex], localProgress);
      particleRef.current.position.copy(position);
      
      // Fade in/out
      if (particleRef.current.material && !Array.isArray(particleRef.current.material)) {
        const material = particleRef.current.material as THREE.MeshBasicMaterial;
        if (material.opacity !== undefined) {
          material.opacity = Math.sin(progress * Math.PI) * 0.8 + 0.2;
        }
      }
    }
  });
  
  return (
    <mesh ref={particleRef}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshBasicMaterial
        color="#ffff00"
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const Globe3D = ({ transactions }: GlobeProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00ff88" />
        
        <Globe transactions={transactions} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minDistance={2}
          maxDistance={5}
        />
      </Canvas>
    </div>
  );
};

export default Globe3D;
