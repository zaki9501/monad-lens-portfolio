import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, BarChart3, Eye, Box, Droplet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import FaucetDialog from "./FaucetDialog";
import React, { useState } from "react";

const Navigation = () => {
  const { authenticated } = usePrivy();
  const [faucetOpen, setFaucetOpen] = useState(false);

  if (!authenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/lending" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/85b0ee68-ba1c-4435-a606-e39e09aaf155.png" 
              alt="Monad Lens Logo" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-white">
              Monad <span className="text-purple-400">Lens</span>
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/portfolio">
              <Button variant="ghost" className="text-white hover:text-purple-400">
                <Wallet className="w-4 h-4 mr-2" />
                Portfolio
              </Button>
            </Link>
            
            <Link to="/lending">
              <Button variant="ghost" className="text-white hover:text-purple-400">
                <BarChart3 className="w-4 h-4 mr-2" />
                Lending
              </Button>
            </Link>
            
            <Link to="/tx-visualizer">
              <Button variant="ghost" className="text-white hover:text-purple-400">
                <Eye className="w-4 h-4 mr-2" />
                TX Visualizer
              </Button>
            </Link>
            
            <Link to="/block-visualizer">
              <Button variant="ghost" className="text-white hover:text-purple-400">
                <Box className="w-4 h-4 mr-2" />
                Block Visualizer
              </Button>
            </Link>
            
            <Button variant="ghost" className="text-white hover:text-cyan-400" onClick={() => setFaucetOpen(true)}>
              <Droplet className="w-4 h-4 mr-2" />
              Faucet
            </Button>
            <FaucetDialog open={faucetOpen} onOpenChange={setFaucetOpen} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
