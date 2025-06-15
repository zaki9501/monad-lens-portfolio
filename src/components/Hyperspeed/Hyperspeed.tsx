
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3, Group } from 'three';
import './Hyperspeed.css';

interface HyperspeedEffectOptions {
  distortion: 'turbulentDistortion' | 'none';
  length: number;
  roadWidth: number;
  islandWidth: number;
  lanesPerRoad: number;
  fov: number;
  fovSpeedUp: number;
  speedUp: number;
  carLightsFade: number;
  totalSideLightSticks: number;
  lightPairsPerRoadWay: number;
  shoulderLinesWidthPercentage: number;
  brokenLinesWidthPercentage: number;
  brokenLinesLengthPercentage: number;
  lightStickWidth: [number, number];
  lightStickHeight: [number, number];
  movingAwaySpeed: [number, number];
  movingCloserSpeed: [number, number];
  carLightsLength: [number, number];
  carLightsRadius: [number, number];
  carWidthPercentage: [number, number];
  carShiftX: [number, number];
  carFloorSeparation: [number, number];
  colors: {
    roadColor: number;
    islandColor: number;
    background: number;
    shoulderLines: number;
    brokenLines: number;
    leftCars: number[];
    rightCars: number[];
    sticks: number;
  };
  blockData?: BlockRay[];
  onRayHover?: (ray: BlockRay | null) => void;
}

const getRandomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

const Road: React.FC<HyperspeedEffectOptions> = (options) => {
  const road = useRef<Mesh>(null!);
  useFrame(() => {
    road.current.position.z += options.speedUp;
    if (road.current.position.z > 0) {
      road.current.position.z = -options.length;
    }
  });
  return (
    <mesh ref={road} position={[0, -0.5, -options.length / 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[options.roadWidth, options.length]} />
      <meshBasicMaterial color={options.colors.roadColor} />
    </mesh>
  );
};

const Island: React.FC<HyperspeedEffectOptions> = (options) => {
  const island = useRef<Mesh>(null!);
  useFrame(() => {
    island.current.position.z += options.speedUp;
    if (island.current.position.z > 0) {
      island.current.position.z = -options.length;
    }
  });
  return (
    <mesh ref={island} position={[0, -0.49, -options.length / 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[options.islandWidth, options.length]} />
      <meshBasicMaterial color={options.colors.islandColor} />
    </mesh>
  );
};

const Lines: React.FC<HyperspeedEffectOptions> = (options) => {
  const lines = useRef<Group>(null!);
  const totalLines = options.lanesPerRoad;
  const lineWidth = options.roadWidth / totalLines;
  const lineOffset = lineWidth / 2;
  const linesArray = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= totalLines; i++) {
      arr.push(-options.roadWidth / 2 + lineOffset + (i - 1) * lineWidth);
    }
    return arr;
  }, [options.roadWidth, totalLines, lineWidth, lineOffset]);

  useFrame(() => {
    lines.current.children.forEach((line) => {
      line.position.z += options.speedUp;
      if (line.position.z > 0) {
        line.position.z = -options.length;
      }
    });
  });

  return (
    <group ref={lines}>
      {linesArray.map((x, i) => (
        <mesh key={i} position={[x, -0.48, -options.length / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[options.shoulderLinesWidthPercentage * options.roadWidth, options.length]} />
          <meshBasicMaterial color={options.colors.shoulderLines} />
        </mesh>
      ))}
    </group>
  );
};

const BrokenLines: React.FC<HyperspeedEffectOptions> = (options) => {
  const brokenLines = useRef<Group>(null!);
  const totalLines = options.lanesPerRoad;
  const lineWidth = options.roadWidth / totalLines;
  const lineOffset = lineWidth / 2;
  const linesArray = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= totalLines; i++) {
      arr.push(-options.roadWidth / 2 + lineOffset + (i - 1) * lineWidth);
    }
    return arr;
  }, [options.roadWidth, totalLines, lineWidth, lineOffset]);

  useFrame(() => {
    brokenLines.current.children.forEach((line) => {
      line.position.z += options.speedUp;
      if (line.position.z > 0) {
        line.position.z = -options.length;
      }
    });
  });

  return (
    <group ref={brokenLines}>
      {linesArray.map((x, i) => (
        <mesh key={i} position={[x, -0.47, -options.length / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[options.brokenLinesWidthPercentage * options.roadWidth, options.brokenLinesLengthPercentage * options.length]} />
          <meshBasicMaterial color={options.colors.brokenLines} />
        </mesh>
      ))}
    </group>
  );
};

const Lights: React.FC<HyperspeedEffectOptions> = (options) => {
  const lights = useRef<Group>(null!);
  const totalLights = options.lightPairsPerRoadWay;
  const lightsArray = useMemo(() => {
    const arr = [];
    for (let i = 0; i < totalLights; i++) {
      arr.push(i);
    }
    return arr;
  }, [totalLights]);

  useFrame(() => {
    lights.current.children.forEach((light) => {
      light.position.z += options.speedUp;
      if (light.position.z > 0) {
        light.position.z = -options.length;
      }
    });
  });

  return (
    <group ref={lights}>
      {lightsArray.map((i) => (
        <group key={i}>
          <mesh position={[-options.roadWidth / 2 - 1, getRandomFloat(options.lightStickHeight[0], options.lightStickHeight[1]), -options.length / 2 + (i / totalLights) * options.length]}>
            <boxGeometry args={[getRandomFloat(options.lightStickWidth[0], options.lightStickWidth[1]), 0.1, 0.1]} />
            <meshBasicMaterial color={options.colors.sticks} />
          </mesh>
          <mesh position={[options.roadWidth / 2 + 1, getRandomFloat(options.lightStickHeight[0], options.lightStickHeight[1]), -options.length / 2 + (i / totalLights) * options.length]}>
            <boxGeometry args={[getRandomFloat(options.lightStickWidth[0], options.lightStickWidth[1]), 0.1, 0.1]} />
            <meshBasicMaterial color={options.colors.sticks} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Cars: React.FC<HyperspeedEffectOptions> = (options) => {
  const carsLeft = useRef<Group>(null!);
  const carsRight = useRef<Group>(null!);
  const totalCars = options.totalSideLightSticks / 2;

  const carsLeftArray = useMemo(() => {
    const arr = [];
    for (let i = 0; i < totalCars; i++) {
      arr.push(i);
    }
    return arr;
  }, [totalCars]);

  const carsRightArray = useMemo(() => {
    const arr = [];
    for (let i = 0; i < totalCars; i++) {
      arr.push(i);
    }
    return arr;
  }, [totalCars]);

  useFrame(() => {
    carsLeft.current.children.forEach((car) => {
      car.position.z += getRandomFloat(options.movingAwaySpeed[0], options.movingAwaySpeed[1]);
      const mesh1 = car.children[0] as Mesh;
      const mesh2 = car.children[1] as Mesh;
      if (mesh1?.material) {
        (mesh1.material as any).opacity = Math.abs(Math.sin(car.position.z / options.length * Math.PI)) * options.carLightsFade;
      }
      if (mesh2?.material) {
        (mesh2.material as any).opacity = Math.abs(Math.sin(car.position.z / options.length * Math.PI)) * options.carLightsFade;
      }
      if (car.position.z > options.length / 2) {
        car.position.z = -options.length / 2;
      }
    });
    carsRight.current.children.forEach((car) => {
      car.position.z += getRandomFloat(options.movingCloserSpeed[0], options.movingCloserSpeed[1]);
      const mesh1 = car.children[0] as Mesh;
      const mesh2 = car.children[1] as Mesh;
      if (mesh1?.material) {
        (mesh1.material as any).opacity = Math.abs(Math.sin(car.position.z / options.length * Math.PI)) * options.carLightsFade;
      }
      if (mesh2?.material) {
        (mesh2.material as any).opacity = Math.abs(Math.sin(car.position.z / options.length * Math.PI)) * options.carLightsFade;
      }
      if (car.position.z < -options.length / 2) {
        car.position.z = options.length / 2;
      }
    });
  });

  return (
    <>
      <group ref={carsLeft}>
        {carsLeftArray.map((i) => {
          const carColor = options.colors.leftCars[i % options.colors.leftCars.length];
          return (
            <group key={i} position={[getRandomFloat(options.carShiftX[0], options.carShiftX[1]), -options.carFloorSeparation[0], getRandomFloat(-options.length / 2, options.length / 2)]}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[getRandomFloat(options.carLightsRadius[0], options.carLightsRadius[1]), getRandomFloat(options.carLightsRadius[0], options.carLightsRadius[1]), getRandomFloat(options.carLightsLength[0], options.carLightsLength[1]), 32]} />
                <meshBasicMaterial color={carColor} transparent={true} opacity={0} />
              </mesh>
              <mesh position={[getRandomFloat(options.carWidthPercentage[0] * options.roadWidth / 2, options.carWidthPercentage[1] * options.roadWidth / 2), 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <cylinderGeometry args={[getRandomFloat(options.carLightsRadius[0], options.carLightsRadius[1]), getRandomFloat(options.carLightsRadius[0], options.carLightsRadius[1]), getRandomFloat(options.carLightsLength[0], options.carLightsLength[1]), 32]} />
                <meshBasicMaterial color={carColor} transparent={true} opacity={0} />
              </mesh>
            </group>
          );
        })}
      </group>
      <group ref={carsRight}>
        {carsRightArray.map((i) => {
          const carColor = options.colors.rightCars[i % options.colors.rightCars.length];
          return (
            <group key={i} position={[getRandomFloat(options.carShiftX[0], options.carShiftX[1]), -options.carFloorSeparation[0], getRandomFloat(-options.length / 2, options.length / 2)]}>
              <mesh rotation={[0, -Math.PI / 2, 0]}>
                <cylinderGeometry args={[getRandomFloat(options.carLightsRadius[0], options.carLightsRadius[1]), getRandomFloat(options.carLightsRadius[0], options.carLightsRadius[1]), getRandomFloat(options.carLightsLength[0], options.carLightsLength[1]), 32]} />
                <meshBasicMaterial color={carColor} transparent={true} opacity={0} />
              </mesh>
              <mesh position={[getRandomFloat(options.carWidthPercentage[0] * options.roadWidth / 2, options.carWidthPercentage[1] * options.roadWidth / 2), 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <cylinderGeometry args={[getRandomFloat(options.carLightsRadius[0], options.carLightsRadius[1]), getRandomFloat(options.carLightsRadius[0], options.carLightsRadius[1]), getRandomFloat(options.carLightsLength[0], options.carLightsLength[1]), 32]} />
                <meshBasicMaterial color={carColor} transparent={true} opacity={0} />
              </mesh>
            </group>
          );
        })}
      </group>
    </>
  );
};

// Add new interface for block data
interface BlockRay {
  id: string;
  block: any;
  position: { x: number; y: number };
  side: 'left' | 'right';
  active: boolean;
  createdAt: number;
}

// New component to render blocks on the highway
const BlocksOnHighway: React.FC<{ blockData: BlockRay[]; onRayHover: (ray: BlockRay | null) => void }> = ({ blockData, onRayHover }) => {
  const groupRef = useRef<Group>();
  const { camera } = useThree();

  console.log('BlocksOnHighway rendering with', blockData.length, 'blocks');

  const blockMeshes = useMemo(() => {
    return blockData.map((ray, index) => ({
      ...ray,
      position3D: new Vector3(
        (ray.side === 'left' ? -3 : 3) + (Math.random() - 0.5) * 1,
        1 + Math.random() * 2,
        -index * 15 - 20
      )
    }));
  }, [blockData]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child: Mesh, index: number) => {
        // Move blocks toward camera
        child.position.z += 1.5;
        
        // Reset position when block passes camera
        if (child.position.z > 10) {
          child.position.z = -200 - Math.random() * 100;
        }
        
        // Add floating animation
        child.position.y += Math.sin(state.clock.elapsedTime * 3 + index) * 0.02;
        
        // Add slight rotation
        child.rotation.y += 0.02;
        child.rotation.x += 0.01;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {blockMeshes.map((ray, index) => (
        <mesh
          key={ray.id}
          position={ray.position3D}
          onPointerEnter={() => onRayHover(ray)}
          onPointerLeave={() => onRayHover(null)}
          scale={[0.8, 0.8, 0.8]}
        >
          <boxGeometry args={[1, 0.6, 2]} />
          <meshStandardMaterial
            color={ray.active ? 0x9333ea : 0x6366f1}
            emissive={ray.active ? 0x4c1d95 : 0x312e81}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
          {/* Add a glowing outline */}
          <mesh>
            <boxGeometry args={[1.1, 0.7, 2.1]} />
            <meshBasicMaterial
              color={ray.active ? 0x9333ea : 0x6366f1}
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
        </mesh>
      ))}
    </group>
  );
};

const HyperspeedScene: React.FC<HyperspeedEffectOptions> = (options) => {
  const { distortion } = options;
  const distortionRef = useRef<any>(null);

  console.log('HyperspeedScene rendering with blockData:', options.blockData?.length || 0, 'blocks');

  useFrame((state, delta) => {
    if (distortion === 'turbulentDistortion' && distortionRef.current) {
      distortionRef.current.time = state.clock.getElapsedTime();
    }
  });

  return (
    <>
      {/* Add proper lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      {distortion === 'turbulentDistortion' && (
        <shaderMaterial ref={distortionRef} key={distortion} args={[
          {
            uniforms: {
              time: { value: 0 },
              speed: { value: options.speedUp },
            },
            vertexShader: `
              uniform float time;
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform float time;
              uniform float speed;
              varying vec2 vUv;
              float turbulence(vec2 uv) {
                float scale = 10.0;
                float value = 0.0;
                value += sin(scale * uv.x + time) * 0.05;
                value += cos(scale * uv.y + time) * 0.05;
                value += sin(scale * 2.0 * uv.x + time * 1.5) * 0.025;
                value += cos(scale * 2.0 * uv.y + time * 1.5) * 0.025;
                return value;
              }
              void main() {
                vec2 distortedUV = vUv + turbulence(vUv);
                gl_FragColor = vec4(distortedUV.x, distortedUV.y, 0.0, 1.0);
              }
            `,
          }
        ]} />
      )}

      <Road {...options} />
      <Island {...options} />
      <Lines {...options} />
      <BrokenLines {...options} />
      <Lights {...options} />
      <Cars {...options} />
      
      {/* Add blocks on highway */}
      {options.blockData && options.onRayHover && (
        <BlocksOnHighway 
          blockData={options.blockData} 
          onRayHover={options.onRayHover} 
        />
      )}
    </>
  );
};

const Hyperspeed: React.FC<{ effectOptions: HyperspeedEffectOptions }> = ({ effectOptions }) => {
  useEffect(() => {
    document.body.style.backgroundColor = `#${effectOptions.colors.background.toString(16).padStart(6, '0')}`;
  }, [effectOptions.colors.background]);

  console.log('Hyperspeed component rendering with blockData:', effectOptions.blockData?.length || 0);
  
  return (
    <Canvas
      camera={{
        fov: effectOptions.fov,
        near: 0.1,
        far: 1000,
        position: [0, 1.5, 0]
      }}
      style={{ background: `#${effectOptions.colors.background.toString(16).padStart(6, '0')}` }}
    >
      <HyperspeedScene {...effectOptions} />
    </Canvas>
  );
};

export default Hyperspeed;
