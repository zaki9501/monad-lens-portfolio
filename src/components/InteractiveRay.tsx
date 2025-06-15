
import React from 'react';

interface BlockRay {
  id: string;
  block: any;
  position: { x: number; y: number };
  side: 'left' | 'right';
  active: boolean;
  createdAt: number;
}

interface InteractiveRayProps {
  ray: BlockRay;
  onHover: (ray: BlockRay | null) => void;
}

const InteractiveRay: React.FC<InteractiveRayProps> = ({ ray, onHover }) => {
  return (
    <div
      className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse cursor-pointer z-20"
      style={{
        left: ray.position.x,
        top: ray.position.y,
        boxShadow: '0 0 10px rgba(168, 85, 247, 0.6)',
        animation: 'pulse 2s infinite, float 3s ease-in-out infinite'
      }}
      onMouseEnter={() => onHover(ray)}
      onMouseLeave={() => onHover(null)}
    />
  );
};

export default InteractiveRay;
