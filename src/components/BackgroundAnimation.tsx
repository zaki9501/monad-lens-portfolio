
import React from 'react';

const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-pulse" 
           style={{ animationDuration: '8s' }} />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      {/* Geometric shapes */}
      <div className="absolute inset-0">
        {/* Large rotating hexagon */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-purple-500/20 rotate-45 animate-spin" 
             style={{ 
               clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
               animationDuration: '20s'
             }} />
        
        {/* Medium rotating square */}
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-blue-500/20 animate-spin" 
             style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        
        {/* Small pulsing circles */}
        <div className="absolute top-1/2 right-1/3 w-16 h-16 border border-green-500/20 rounded-full pulse-ring" />
        <div className="absolute bottom-1/4 left-1/3 w-12 h-12 border border-orange-500/20 rounded-full pulse-ring" 
             style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" 
             style={{
               backgroundImage: `
                 linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
               `,
               backgroundSize: '50px 50px'
             }} />
      </div>
      
      {/* Animated energy waves */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent energy-wave" />
        <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent energy-wave" 
             style={{ animationDelay: '1s' }} />
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-green-500/50 to-transparent energy-wave" 
             style={{ animationDelay: '2s' }} />
        <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500/50 to-transparent energy-wave" 
             style={{ animationDelay: '3s' }} />
      </div>
    </div>
  );
};

export default BackgroundAnimation;
