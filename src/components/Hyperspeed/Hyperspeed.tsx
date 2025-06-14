import { useEffect, useRef, FC, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
} from "postprocessing";

import "./Hyperspeed.css";

interface Distortion {
  uniforms: Record<string, { value: any }>;
  getDistortion: string;
  getJS?: (progress: number, time: number) => THREE.Vector3;
}

interface Colors {
  roadColor: number;
  islandColor: number;
  background: number;
  shoulderLines: number;
  brokenLines: number;
  leftCars: number[];
  rightCars: number[];
  sticks: number;
}

interface HyperspeedOptions {
  onSpeedUp?: (ev: MouseEvent) => void;
  onSlowDown?: (ev: MouseEvent) => void;
  distortion?: string | Distortion;
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
  colors: Colors;
  isHyper?: boolean;
}

interface HyperspeedProps {
  effectOptions?: Partial<HyperspeedOptions>;
}

export interface HyperspeedRef {
  addBlockLightRay: (blockData: any) => void;
}

const defaultOptions: HyperspeedOptions = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xffffff,
    brokenLines: 0xffffff,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3,
  },
};

function nsin(val: number) {
  return Math.sin(val) * 0.5 + 0.5;
}

const turbulentUniforms = {
  uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
  uAmp: { value: new THREE.Vector4(25, 5, 10, 10) },
};

const distortions: Record<string, Distortion> = {
  turbulentDistortion: {
    uniforms: turbulentUniforms,
    getDistortion: `
      uniform vec4 uFreq;
      uniform vec4 uAmp;
      float nsin(float val){
        return sin(val) * 0.5 + 0.5;
      }
      #define PI 3.14159265358979
      float getDistortionX(float progress){
        return (
          cos(PI * progress * uFreq.r + uTime) * uAmp.r +
          pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
        );
      }
      float getDistortionY(float progress){
        return (
          -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
          -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
        );
      }
      vec3 getDistortion(float progress){
        return vec3(
          getDistortionX(progress) - getDistortionX(0.0125),
          getDistortionY(progress) - getDistortionY(0.0125),
          0.
        );
      }
    `,
    getJS: (progress: number, time: number) => {
      const uFreq = turbulentUniforms.uFreq.value;
      const uAmp = turbulentUniforms.uAmp.value;

      const getX = (p: number) =>
        Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
        Math.pow(
          Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)),
          2
        ) *
          uAmp.y;

      const getY = (p: number) =>
        -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
        Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) *
          uAmp.w;

      const distortion = new THREE.Vector3(
        getX(progress) - getX(progress + 0.007),
        getY(progress) - getY(progress + 0.007),
        0
      );
      const lookAtAmp = new THREE.Vector3(-2, -5, 0);
      const lookAtOffset = new THREE.Vector3(0, 0, -10);
      return distortion.multiply(lookAtAmp).add(lookAtOffset);
    },
  },
};

class BlockLightRays {
  webgl: App;
  options: HyperspeedOptions;
  mesh!: THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>;
  blockRays: Array<{
    id: string;
    createdAt: number;
    position: THREE.Vector3;
    color: THREE.Color;
    speed: number;
    size: number;
  }> = [];
  maxRays = 50;

  constructor(webgl: App, options: HyperspeedOptions) {
    this.webgl = webgl;
    this.options = options;
  }

  init() {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 20, 8);
    const instanced = new THREE.InstancedBufferGeometry().copy(geometry as any) as THREE.InstancedBufferGeometry;
    instanced.instanceCount = this.maxRays;

    // Initialize arrays for instance attributes
    const aOffset = new Float32Array(this.maxRays * 3);
    const aColor = new Float32Array(this.maxRays * 3);
    const aMetrics = new Float32Array(this.maxRays * 4); // size, speed, createdAt, active

    // Initialize with inactive rays
    for (let i = 0; i < this.maxRays; i++) {
      aMetrics[i * 4 + 3] = 0; // inactive
    }

    instanced.setAttribute("aOffset", new THREE.InstancedBufferAttribute(aOffset, 3, false));
    instanced.setAttribute("aColor", new THREE.InstancedBufferAttribute(aColor, 3, false));
    instanced.setAttribute("aMetrics", new THREE.InstancedBufferAttribute(aMetrics, 4, false));

    const material = new THREE.ShaderMaterial({
      fragmentShader: blockRayFragment,
      vertexShader: blockRayVertex,
      transparent: true,
      uniforms: Object.assign(
        {
          uTime: { value: 0 },
          uTravelLength: { value: this.options.length },
        },
        this.webgl.fogUniforms,
        (typeof this.options.distortion === "object"
          ? this.options.distortion.uniforms
          : {}) || {}
      ),
    });

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <getDistortion_vertex>",
        typeof this.options.distortion === "object"
          ? this.options.distortion.getDistortion
          : ""
      );
    };

    const mesh = new THREE.Mesh(instanced, material);
    mesh.frustumCulled = false;
    this.webgl.scene.add(mesh);
    this.mesh = mesh;
  }

  addBlockRay(blockData: any) {
    const now = this.webgl.clock.elapsedTime;
    
    // Find an inactive ray slot or replace the oldest one
    let targetIndex = -1;
    for (let i = 0; i < this.maxRays; i++) {
      const metricsArray = this.mesh.geometry.attributes.aMetrics.array as Float32Array;
      if (metricsArray[i * 4 + 3] === 0) { // inactive
        targetIndex = i;
        break;
      }
    }
    
    if (targetIndex === -1) {
      // Find oldest ray to replace
      let oldestTime = Infinity;
      for (let i = 0; i < this.maxRays; i++) {
        const metricsArray = this.mesh.geometry.attributes.aMetrics.array as Float32Array;
        const createdAt = metricsArray[i * 4 + 2];
        if (createdAt < oldestTime) {
          oldestTime = createdAt;
          targetIndex = i;
        }
      }
    }

    if (targetIndex >= 0) {
      // Generate random properties for the new ray
      const x = (Math.random() - 0.5) * (this.options.roadWidth + this.options.islandWidth);
      const y = Math.random() * 5 + 1;
      const z = -this.options.length + Math.random() * 50;
      
      const colors = [0x00ff88, 0xff0066, 0x0088ff, 0xffaa00, 0xaa00ff];
      const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
      
      const speed = 100 + Math.random() * 100;
      const size = 0.5 + Math.random() * 1.5;

      // Update instance attributes
      const offsetArray = this.mesh.geometry.attributes.aOffset.array as Float32Array;
      const colorArray = this.mesh.geometry.attributes.aColor.array as Float32Array;
      const metricsArray = this.mesh.geometry.attributes.aMetrics.array as Float32Array;

      offsetArray[targetIndex * 3] = x;
      offsetArray[targetIndex * 3 + 1] = y;
      offsetArray[targetIndex * 3 + 2] = z;

      colorArray[targetIndex * 3] = color.r;
      colorArray[targetIndex * 3 + 1] = color.g;
      colorArray[targetIndex * 3 + 2] = color.b;

      metricsArray[targetIndex * 4] = size;
      metricsArray[targetIndex * 4 + 1] = speed;
      metricsArray[targetIndex * 4 + 2] = now;
      metricsArray[targetIndex * 4 + 3] = 1; // active

      // Mark attributes as needing update
      this.mesh.geometry.attributes.aOffset.needsUpdate = true;
      this.mesh.geometry.attributes.aColor.needsUpdate = true;
      this.mesh.geometry.attributes.aMetrics.needsUpdate = true;

      console.log(`Added block ray for block ${blockData?.number || 'unknown'} at position (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    }
  }

  update(time: number) {
    if (this.mesh.material.uniforms.uTime) {
      this.mesh.material.uniforms.uTime.value = time;
    }

    // Deactivate rays that have traveled too far
    const metricsArray = this.mesh.geometry.attributes.aMetrics.array as Float32Array;
    const offsetArray = this.mesh.geometry.attributes.aOffset.array as Float32Array;
    let needsUpdate = false;

    for (let i = 0; i < this.maxRays; i++) {
      const active = metricsArray[i * 4 + 3];
      if (active > 0) {
        const speed = metricsArray[i * 4 + 1];
        const createdAt = metricsArray[i * 4 + 2];
        const age = time - createdAt;
        const currentZ = offsetArray[i * 3 + 2] + speed * age;
        
        if (currentZ > 100) { // Ray has traveled beyond view
          metricsArray[i * 4 + 3] = 0; // deactivate
          needsUpdate = true;
        }
      }
    }

    if (needsUpdate) {
      this.mesh.geometry.attributes.aMetrics.needsUpdate = true;
    }
  }
}

const blockRayVertex = `
  #define USE_FOG;
  ${THREE.ShaderChunk["fog_pars_vertex"]}
  attribute vec3 aOffset;
  attribute vec3 aColor;
  attribute vec4 aMetrics; // size, speed, createdAt, active
  uniform float uTime;
  uniform float uTravelLength;
  varying vec3 vColor;
  varying float vActive;
  #include <getDistortion_vertex>
  void main() {
    if (aMetrics.a < 0.5) {
      gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
      vActive = 0.0;
      return;
    }
    
    vActive = 1.0;
    vec3 transformed = position.xyz;
    
    float size = aMetrics.x;
    float speed = aMetrics.y;
    float createdAt = aMetrics.z;
    float age = uTime - createdAt;
    
    transformed.xyz *= size;
    transformed.z += aOffset.z + speed * age;
    transformed.xy += aOffset.xy;
    
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);
    
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    ${THREE.ShaderChunk["fog_vertex"]}
  }
`;

const blockRayFragment = `
  #define USE_FOG;
  ${THREE.ShaderChunk["fog_pars_fragment"]}
  varying vec3 vColor;
  varying float vActive;
  void main() {
    if (vActive < 0.5) discard;
    
    vec3 color = vColor * 2.0; // Brighten the colors
    float alpha = 0.8;
    gl_FragColor = vec4(color, alpha);
    ${THREE.ShaderChunk["fog_fragment"]}
  }
`;

class App {
  container: HTMLElement;
  options: HyperspeedOptions;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  clock: THREE.Clock;
  disposed: boolean;
  fogUniforms: Record<string, { value: any }>;
  blockLightRays: BlockLightRays;

  constructor(container: HTMLElement, options: HyperspeedOptions) {
    this.options = options;
    this.container = container;
    this.disposed = false;

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
    });
    this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.composer = new EffectComposer(this.renderer);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      options.fov,
      container.offsetWidth / container.offsetHeight,
      0.1,
      10000
    );
    this.camera.position.z = -5;
    this.camera.position.y = 8;
    this.camera.position.x = 0;

    this.scene = new THREE.Scene();
    this.scene.background = null;

    const fog = new THREE.Fog(
      options.colors.background,
      options.length * 0.2,
      options.length * 500
    );
    this.scene.fog = fog;

    this.fogUniforms = {
      fogColor: { value: fog.color },
      fogNear: { value: fog.near },
      fogFar: { value: fog.far },
    };

    this.clock = new THREE.Clock();
    this.blockLightRays = new BlockLightRays(this, options);
    this.tick = this.tick.bind(this);
  }

  init() {
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass = new EffectPass(
      this.camera,
      new BloomEffect({
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0,
        resolutionScale: 1,
      })
    );

    const smaaPass = new EffectPass(
      this.camera,
      new SMAAEffect({
        preset: SMAAPreset.MEDIUM
      })
    );

    renderPass.renderToScreen = false;
    bloomPass.renderToScreen = false;
    smaaPass.renderToScreen = true;

    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
    this.composer.addPass(smaaPass);

    // Add basic road geometry
    const geometry = new THREE.PlaneGeometry(20, 400, 20, 100);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.8
    });
    const road = new THREE.Mesh(geometry, material);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -200;
    this.scene.add(road);

    // Initialize block light rays
    this.blockLightRays.init();

    this.tick();
  }

  addBlockLightRay(blockData: any) {
    this.blockLightRays.addBlockRay(blockData);
  }

  tick() {
    if (this.disposed) return;
    
    const delta = this.clock.getDelta();
    const time = this.clock.elapsedTime;
    
    this.blockLightRays.update(time);
    this.composer.render(delta);
    requestAnimationFrame(this.tick);
  }

  dispose() {
    this.disposed = true;
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

const Hyperspeed = forwardRef<HyperspeedRef, HyperspeedProps>(({ effectOptions = {} }, ref) => {
  const mergedOptions: HyperspeedOptions = {
    ...defaultOptions,
    ...effectOptions,
  };
  const hyperspeed = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);

  useImperativeHandle(ref, () => ({
    addBlockLightRay: (blockData: any) => {
      if (appRef.current) {
        appRef.current.addBlockLightRay(blockData);
      }
    }
  }));

  useEffect(() => {
    const container = hyperspeed.current;
    if (!container) return;

    if (typeof mergedOptions.distortion === "string") {
      mergedOptions.distortion = distortions[mergedOptions.distortion];
    }

    const myApp = new App(container, mergedOptions);
    appRef.current = myApp;
    myApp.init();

    return () => {
      if (appRef.current) {
        appRef.current.dispose();
      }
    };
  }, []);

  return <div id="lights" ref={hyperspeed}></div>;
});

Hyperspeed.displayName = 'Hyperspeed';

export default Hyperspeed;
