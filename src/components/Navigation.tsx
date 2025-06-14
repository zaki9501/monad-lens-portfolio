
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, BarChart3, Eye, Blocks } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

const Navigation = () => {
  const { authenticated } = usePrivy();

  if (!authenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-white">
            Monad <span className="text-purple-400">Lens</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/">
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
                <Blocks className="w-4 h-4 mr-2" />
                Block Visualizer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
