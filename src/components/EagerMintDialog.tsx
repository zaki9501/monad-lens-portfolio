import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, CheckCircle, AlertCircle, Coins, Zap } from "lucide-react";

interface EagerMintDialogProps {
  walletAddress: string;
  overallScore: number;
  artData: any;
  isDarkMode?: boolean;
  isLoreMode?: boolean;
}

const EagerMintDialog = ({ 
  walletAddress, 
  overallScore, 
  artData, 
  isDarkMode = true,
  isLoreMode = false 
}: EagerMintDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState('');
  const [nftName, setNftName] = useState(`${isLoreMode ? 'Mind Essence' : 'Reputation Art'} #${overallScore}`);
  const [nftDescription, setNftDescription] = useState('');

  // Calculate mint price based on rarity
  const getRarityAndPrice = () => {
    if (overallScore >= 80) return { rarity: 'Legendary', price: '0.1', color: 'text-yellow-400' };
    if (overallScore >= 60) return { rarity: 'Epic', price: '0.05', color: 'text-purple-400' };
    if (overallScore >= 40) return { rarity: 'Rare', price: '0.025', color: 'text-blue-400' };
    return { rarity: 'Common', price: '0.01', color: 'text-gray-400' };
  };

  const { rarity, price, color } = getRarityAndPrice();

  const handleEagerMint = async () => {
    setIsMinting(true);
    setMintError('');
    
    try {
      // Simulate minting process
      console.log('Starting eager mint for wallet:', walletAddress);
      
      // Simulate transaction steps
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating NFT metadata...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Uploading artwork to IPFS...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Minting NFT on blockchain...');
      
      // Simulate random success/failure for demo
      if (Math.random() > 0.2) {
        setMintSuccess(true);
        console.log('NFT minted successfully!');
      } else {
        throw new Error('Transaction failed: Insufficient gas');
      }
      
    } catch (error) {
      console.error('Mint failed:', error);
      setMintError(error.message || 'Minting failed. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  const resetDialog = () => {
    setMintSuccess(false);
    setMintError('');
    setIsMinting(false);
    setNftDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <div className="relative">
          <Button
            disabled={true}
            className="bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-50"
            title="NFT minting temporarily disabled - contracts not yet implemented"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoreMode ? 'Eager Mint Mind Essence' : 'Eager Mint NFT'} (Coming Soon)
          </Button>
        </div>
      </DialogTrigger>
      
      <DialogContent className={`max-w-md ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center space-x-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Zap className="w-5 h-5 text-purple-400" />
            <span>{isLoreMode ? 'Mint Mind Essence' : 'Eager Mint NFT'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!mintSuccess && !mintError && (
            <>
              {/* NFT Preview */}
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                } flex items-center justify-center mb-3`}>
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {nftName}
                </h3>
                <p className={`text-sm ${color} font-medium`}>
                  {rarity} • Score: {overallScore}
                </p>
              </div>

              {/* Mint Details */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    NFT Name
                  </label>
                  <Input
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                    className={isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Description (Optional)
                  </label>
                  <Input
                    value={nftDescription}
                    onChange={(e) => setNftDescription(e.target.value)}
                    placeholder={isLoreMode ? 
                      'Describe this mind essence...' : 
                      'Describe your reputation art...'
                    }
                    className={isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : ''}
                  />
                </div>

                {/* Price Display */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Mint Price:
                  </span>
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-purple-400" />
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {price} MON
                    </span>
                  </div>
                </div>

                {/* Mint Button */}
                <Button
                  onClick={handleEagerMint}
                  disabled={isMinting || !nftName.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Mint Now for {price} MON
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Success State */}
          {mintSuccess && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  NFT Minted Successfully!
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  Your {isLoreMode ? 'mind essence' : 'reputation art'} has been minted and added to your collection.
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Transaction Hash:
                </p>
                <p className="font-mono text-xs text-purple-400 break-all">
                  0x{Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}
                </p>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}

          {/* Error State */}
          {mintError && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Minting Failed
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  {mintError}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setMintError('');
                    handleEagerMint();
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EagerMintDialog;
