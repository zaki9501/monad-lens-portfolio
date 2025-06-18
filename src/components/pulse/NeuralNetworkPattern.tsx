import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap } from "lucide-react";

// Configuration constants
const CONFIG = {
  CANVAS_WIDTH: 300,
  CANVAS_HEIGHT: 200,
  MIN_NODES: 8,
  MAX_NODES: 20,
  BASE_NODE_SIZE: 4,
  PULSE_SPEED: 0.008,
  CONNECTION_MIN: 2,
  CONNECTION_MAX: 4,
  RANDOM_OFFSET: 50,
  VALIDATOR_COLOR: 'rgba(34, 197, 94, ',
  NETWORK_COLOR: 'rgba(59, 130, 246, ',
  BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.1)',
};

// Types
interface Validator {
  address: string;
  status: string;
  blocksProduced: number;
  successRate: number;
}

interface Node {
  id: string;
  x: number;
  y: number;
  connections: string[];
  activity: number;
  isValidator: boolean;
  validatorData?: Validator;
}

interface NeuralNetworkPatternProps {
  validators: Validator[];
  activeValidators: number;
  averageSuccessRate: number;
}

const NeuralNetworkPattern: React.FC<NeuralNetworkPatternProps> = ({
  validators,
  activeValidators,
  averageSuccessRate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: CONFIG.CANVAS_WIDTH, height: CONFIG.CANVAS_HEIGHT });

  // Handle canvas resizing
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const height = width * (CONFIG.CANVAS_HEIGHT / CONFIG.CANVAS_WIDTH);
        setDimensions({ width, height });
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Initialize nodes based on validator data
  useEffect(() => {
    const nodeCount = Math.min(CONFIG.MAX_NODES, Math.max(CONFIG.MIN_NODES, validators.length));
    const newNodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * 2 * Math.PI;
      const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * CONFIG.RANDOM_OFFSET;
      const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * CONFIG.RANDOM_OFFSET;

      const connections: string[] = [];
      const connectionCount = Math.floor(Math.random() * (CONFIG.CONNECTION_MAX - CONFIG.CONNECTION_MIN + 1)) + CONFIG.CONNECTION_MIN;
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = (i + j + 1) % nodeCount;
        connections.push(`node-${targetIndex}`);
      }

      newNodes.push({
        id: `node-${i}`,
        x,
        y,
        connections,
        activity: validators[i]?.successRate ? validators[i].successRate / 100 : Math.random(),
        isValidator: i < activeValidators && validators[i]?.status === 'active',
        validatorData: validators[i],
      });
    }

    setNodes(newNodes);
  }, [validators, activeValidators, dimensions]);

  // Animation loop
  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || nodes.length === 0) return;

      // Clear canvas
      ctx.fillStyle = CONFIG.BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update node activities
      const updatedNodes = nodes.map(node => ({
        ...node,
        activity: node.isValidator
          ? (averageSuccessRate / 100) * (0.5 + Math.sin(timestamp * 0.005 + Math.random()) * 0.5)
          : Math.sin(timestamp * 0.003 + Math.random()) * 0.3 + 0.7,
      }));

      // Draw connections
      updatedNodes.forEach(node => {
        node.connections.forEach(connectionId => {
          const targetNode = updatedNodes.find(n => n.id === connectionId);
          if (targetNode) {
            const activity = (node.activity + targetNode.activity) / 2;
            const alpha = activity * 0.8;

            ctx.strokeStyle = node.isValidator || targetNode.isValidator
              ? `${CONFIG.VALIDATOR_COLOR}${alpha})`
              : `${CONFIG.NETWORK_COLOR}${alpha})`;
            ctx.lineWidth = activity * 3 + 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.stroke();

            if (activity > 0.7) {
              const pulseSize = Math.sin(timestamp * 0.01) * 3 + 2;
              ctx.strokeStyle = node.isValidator || targetNode.isValidator
                ? `${CONFIG.VALIDATOR_COLOR}${alpha * 0.5})`
                : `${CONFIG.NETWORK_COLOR}${alpha * 0.5})`;
              ctx.lineWidth = pulseSize;
              ctx.stroke();
            }
          }
        });
      });

      // Draw nodes
      updatedNodes.forEach(node => {
        const baseSize = node.isValidator ? CONFIG.BASE_NODE_SIZE : CONFIG.BASE_NODE_SIZE + 1;
        const pulseSize = Math.sin(timestamp * CONFIG.PULSE_SPEED + Math.random()) * 2;
        const size = baseSize + node.activity * 4 + pulseSize;

        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2);
        gradient.addColorStop(0, node.isValidator
          ? `${CONFIG.VALIDATOR_COLOR}${node.activity})`
          : `${CONFIG.NETWORK_COLOR}${node.activity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = node.isValidator
          ? `${CONFIG.VALIDATOR_COLOR}${0.8 + node.activity * 0.2})`
          : `${CONFIG.NETWORK_COLOR}${0.8 + node.activity * 0.2})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (node.isValidator) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    },
    [nodes, averageSuccessRate, dimensions]
  );

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  return (
    <Card className="bg-gray-900/30 border-green-900/50" aria-label="Neural network visualization of blockchain validators">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-400 text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" aria-hidden="true" />
          NEURAL NETWORK PATTERN
          <div className="flex items-center gap-1 text-xs font-normal text-gray-400">
            <Zap className="h-3 w-3" aria-hidden="true" />
            <span>{activeValidators} active nodes</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={containerRef} className="relative">
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto bg-black/50 rounded-b-lg"
            style={{ display: 'block' }}
            aria-describedby="network-description"
          />
          <div id="network-description" className="sr-only">
            Visualization of {activeValidators} active blockchain validator nodes with an average success rate of {averageSuccessRate.toFixed(1)}%.
          </div>

          {/* Overlay stats */}
          <div className="absolute top-2 right-2 text-xs space-y-1 bg-black/50 p-2 rounded">
            <div className="text-green-400">
              Network Health: <span className="text-cyan-400">{averageSuccessRate.toFixed(1)}%</span>
            </div>
            <div className="text-green-400">
              Active Nodes: <span className="text-cyan-400">{activeValidators}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 text-xs space-y-1 bg-black/50 p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
              <span className="text-green-400">Validator Nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-400">Network Nodes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeuralNetworkPattern;