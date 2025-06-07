
import React from 'react';

interface WalletAvatarProps {
  address: string;
  size?: number;
}

const WalletAvatar = ({ address, size = 40 }: WalletAvatarProps) => {
  // Generate a unique color based on the address
  const generateColor = (addr: string) => {
    let hash = 0;
    for (let i = 0; i < addr.length; i++) {
      hash = addr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Generate a pattern based on the address
  const generatePattern = (addr: string) => {
    const patterns = ['⬟', '◆', '●', '▲', '■', '♦', '⬢', '◯'];
    let hash = 0;
    for (let i = 0; i < addr.length; i++) {
      hash = addr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return patterns[Math.abs(hash) % patterns.length];
  };

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shadow-lg animate-scale-in"
      style={{
        width: size,
        height: size,
        backgroundColor: generateColor(address),
        fontSize: size * 0.4
      }}
    >
      {generatePattern(address)}
    </div>
  );
};

export default WalletAvatar;
