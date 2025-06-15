
import { useState, useEffect, useRef } from 'react';

interface BlockData {
  hash: string;
  number: string;
  gasUsed: string;
  timestamp: string;
  transactions: any[];
  miner: string;
  gasLimit: string;
  baseFeePerGas: string;
  size: string;
}

interface BlockRay {
  id: string;
  block: BlockData;
  position: { x: number; y: number };
  side: 'left' | 'right';
  active: boolean;
  createdAt: number;
}

const fetchLatestBlock = async () => {
  const response = await fetch('https://testnet-rpc.monad.xyz/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['latest', true],
      id: 1
    })
  });
  
  if (!response.ok) throw new Error('Failed to fetch block');
  const data = await response.json();
  return data.result;
};

export const useBlockRays = () => {
  const [blockRays, setBlockRays] = useState<BlockRay[]>([]);
  const [hoveredRay, setHoveredRay] = useState<BlockRay | null>(null);
  const lastBlockHashRef = useRef<string | null>(null);

  const generateRandomPosition = (side: 'left' | 'right') => {
    const baseX = side === 'left' ? 100 : window.innerWidth - 300;
    const randomOffsetX = Math.random() * 200 - 100;
    const randomY = Math.random() * (window.innerHeight - 200) + 100;
    
    return {
      x: Math.max(50, Math.min(baseX + randomOffsetX, window.innerWidth - 350)),
      y: randomY
    };
  };

  const fetchAndAddBlock = async () => {
    try {
      const block = await fetchLatestBlock();
      
      if (block && block.hash !== lastBlockHashRef.current) {
        lastBlockHashRef.current = block.hash;
        
        const newRay: BlockRay = {
          id: `ray-${Date.now()}-${Math.random()}`,
          block,
          position: generateRandomPosition(Math.random() > 0.5 ? 'left' : 'right'),
          side: Math.random() > 0.5 ? 'left' : 'right',
          active: true,
          createdAt: Date.now()
        };

        setBlockRays(prev => {
          const filtered = prev.filter(ray => Date.now() - ray.createdAt < 30000);
          return [...filtered, newRay].slice(-10);
        });

        setTimeout(() => {
          setBlockRays(prev => prev.map(ray => 
            ray.id === newRay.id ? { ...ray, active: false } : ray
          ));
        }, 8000);
      }
    } catch (error) {
      console.error('Failed to fetch block:', error);
    }
  };

  useEffect(() => {
    fetchAndAddBlock();
    const interval = setInterval(fetchAndAddBlock, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setBlockRays(prev => prev.filter(ray => Date.now() - ray.createdAt < 30000));
    }, 5000);
    
    return () => clearInterval(cleanup);
  }, []);

  return {
    blockRays: blockRays.filter(ray => ray.active),
    hoveredRay,
    setHoveredRay
  };
};
