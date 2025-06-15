
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
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
        const start = new THREE.Vector3(...nodes[i].position);
        const end = new THREE.Vector3(...nodes[j].position);
        
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
        if (child.material) {
          const offset = (time + index * 0.5) % 2;
          child.material.opacity = Math.sin(offset * Math.PI) * 0.8 + 0.2;
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
      
      {/* Connection rays */}
      <group ref={raysRef}>
        {connections.map((connection, index) => (
          connection.active && (
            <Line
              key={index}
              points={connection.points}
              color="#00ff88"
              lineWidth={2}
              transparent
              opacity={0.6}
            />
          )
        ))}
      </group>
      
      {/* Animated particles */}
      {transactions.slice(0, 5).map((tx, index) => (
        <AnimatedParticle
          key={tx.hash + index}
          path={connections[index % connections.length]?.points || []}
          delay={index * 0.5}
        />
      ))}
    </group>
  );
};

const AnimatedParticle = ({ path, delay }: { path: THREE.Vector3[]; delay: number }) => {
  const particleRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!particleRef.current || !path.length) return;
    
    const time = (clock.getElapsedTime() + delay) % 3;
    const progress = time / 3;
    const index = Math.floor(progress * (path.length - 1));
    const nextIndex = Math.min(index + 1, path.length - 1);
    const localProgress = (progress * (path.length - 1)) % 1;
    
    if (path[index] && path[nextIndex]) {
      const position = path[index].clone().lerp(path[nextIndex], localProgress);
      particleRef.current.position.copy(position);
      
      // Fade in/out
      if (particleRef.current.material) {
        particleRef.current.material.opacity = Math.sin(progress * Math.PI) * 0.8 + 0.2;
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
