
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, BarChart3, Eye, Box, Menu, X } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const { authenticated } = usePrivy();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!authenticated) return null;

  const navItems = [
    { to: "/", icon: Wallet, label: "Portfolio" },
    { to: "/lending", icon: BarChart3, label: "Lending" },
    { to: "/tx-visualizer", icon: Eye, label: "TX Visualizer" },
    { to: "/block-visualizer", icon: Box, label: "Block Visualizer" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/85b0ee68-ba1c-4435-a606-e39e09aaf155.png" 
              alt="Monad Lens Logo" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-white">
              Monad <span className="text-purple-400">Lens</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to}>
                  <Button variant="ghost" className="text-white hover:text-purple-400">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && isMenuOpen && (
          <div className="pb-4 border-t border-slate-700 mt-2">
            <div className="flex flex-col space-y-2 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 text-white hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
