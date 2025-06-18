
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap } from "lucide-react";

interface Node {
  id: string;
  x: number;
  y: number;
  connections: string[];
  activity: number;
  isValidator: boolean;
}

interface NeuralNetworkPatternProps {
  validators: any[];
  activeValidators: number;
  averageSuccessRate: number;
}

const NeuralNetworkPattern: React.FC<NeuralNetworkPatternProps> = ({
  validators,
  activeValidators,
  averageSuccessRate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const animationRef = useRef<number>();

  // Initialize nodes based on validator data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const nodeCount = Math.min(20, Math.max(8, validators.length));

    const newNodes: Node[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Add some randomness to create organic pattern
      const randomOffset = 50;
      const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * randomOffset;
      const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * randomOffset;

      const connections: string[] = [];
      // Connect to 2-4 nearby nodes
      const connectionCount = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = (i + j + 1) % nodeCount;
        connections.push(`node-${targetIndex}`);
      }

      newNodes.push({
        id: `node-${i}`,
        x,
        y,
        connections,
        activity: Math.random(),
        isValidator: i < activeValidators && validators[i]?.status === 'active'
      });
    }

    setNodes(newNodes);
  }, [validators, activeValidators]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update node activities based on validator performance
      const updatedNodes = nodes.map(node => ({
        ...node,
        activity: node.isValidator 
          ? (averageSuccessRate / 100) * (0.5 + Math.sin(timestamp * 0.005 + Math.random()) * 0.5)
          : Math.sin(timestamp * 0.003 + Math.random()) * 0.3 + 0.7
      }));

      // Draw connections
      updatedNodes.forEach(node => {
        node.connections.forEach(connectionId => {
          const targetNode = updatedNodes.find(n => n.id === connectionId);
          if (targetNode) {
            const activity = (node.activity + targetNode.activity) / 2;
            const alpha = activity * 0.8;
            
            ctx.strokeStyle = node.isValidator || targetNode.isValidator 
              ? `rgba(34, 197, 94, ${alpha})` // Green for validator connections
              : `rgba(59, 130, 246, ${alpha})`; // Blue for regular connections
            
            ctx.lineWidth = activity * 3 + 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.stroke();

            // Add pulse effect for high activity
            if (activity > 0.7) {
              const pulseSize = Math.sin(timestamp * 0.01) * 3 + 2;
              ctx.strokeStyle = node.isValidator || targetNode.isValidator 
                ? `rgba(34, 197, 94, ${alpha * 0.5})` 
                : `rgba(59, 130, 246, ${alpha * 0.5})`;
              ctx.lineWidth = pulseSize;
              ctx.stroke();
            }
          }
        });
      });

      // Draw nodes
      updatedNodes.forEach(node => {
        const baseSize = node.isValidator ? 8 : 5;
        const pulseSize = Math.sin(timestamp * 0.008 + Math.random()) * 2;
        const size = baseSize + node.activity * 4 + pulseSize;

        // Node glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2);
        gradient.addColorStop(0, node.isValidator 
          ? `rgba(34, 197, 94, ${node.activity})` 
          : `rgba(59, 130, 246, ${node.activity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.fillStyle = node.isValidator 
          ? `rgba(34, 197, 94, ${0.8 + node.activity * 0.2})` 
          : `rgba(59, 130, 246, ${0.8 + node.activity * 0.2})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Validator indicator
        if (node.isValidator) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, averageSuccessRate]);

  return (
    <Card className="bg-gray-900/30 border-green-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-400 text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          NEURAL NETWORK PATTERN
          <div className="flex items-center gap-1 text-xs font-normal text-gray-400">
            <Zap className="h-3 w-3" />
            <span>{activeValidators} active nodes</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            className="w-full h-[200px] bg-black/50 rounded-b-lg"
            style={{ display: 'block' }}
          />
          
          {/* Overlay stats */}
          <div className="absolute top-2 right-2 text-xs space-y-1">
            <div className="text-green-400">
              Network Health: <span className="text-cyan-400">{averageSuccessRate.toFixed(1)}%</span>
            </div>
            <div className="text-green-400">
              Active Nodes: <span className="text-cyan-400">{activeValidators}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 text-xs space-y-1">
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
