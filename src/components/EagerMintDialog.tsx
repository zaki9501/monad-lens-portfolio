import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, CheckCircle, AlertCircle, Coins, Zap } from "lucide-react";
import { ethers, BrowserProvider, Contract } from 'ethers';
import { uploadToIPFS } from '@/utils/pinata';
import ReputationArtNFT from '@/abis/ReputationArtNFT.json'; // Ensure this matches your deployed ABI

interface EagerMintDialogProps {
  walletAddress: string;
  overallScore: number;
  artData: any;
  metrics?: {
    totalTransactions: number;
    diversityScore: number;
    transactionFrequency: number;
    firstTransactionAge: number;
  };
  isDarkMode?: boolean;
  isLoreMode?: boolean;
}

const EagerMintDialog = ({ 
  walletAddress, 
  overallScore, 
  artData, 
  metrics = { totalTransactions: 0, diversityScore: 0, transactionFrequency: 0, firstTransactionAge: 0 },
  isDarkMode = true,
  isLoreMode = false 
}: EagerMintDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState('');
  const [nftName, setNftName] = useState(`${isLoreMode ? 'Mind Essence' : 'Reputation Art'} #${overallScore}`);
  const [nftDescription, setNftDescription] = useState('');
  const [hasMinted, setHasMinted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const contractAddress = "0x4ba16060a00d0e0939cb69e46846fbee30f7c847"; // Deployed contract address

  // Calculate mint price and rarity based on overall score
  const getRarityAndPrice = () => {
    if (overallScore >= 80) return { rarity: 'Legendary', price: '0.1', color: 'text-yellow-400' };
    if (overallScore >= 60) return { rarity: 'Epic', price: '0.05', color: 'text-purple-400' };
    if (overallScore >= 40) return { rarity: 'Rare', price: '0.025', color: 'text-blue-400' };
    return { rarity: 'Common', price: '0.01', color: 'text-gray-400' };
  };

  const { rarity, price, color } = getRarityAndPrice();

  const checkMintedStatus = async () => {
    try {
      if (!window.ethereum) throw new Error('Please install MetaMask or connect a wallet.');
      const provider = new BrowserProvider(window.ethereum as unknown as { request: (args: { method: string; params?: any[] }) => Promise<any> });
      const contract = new Contract(contractAddress, ReputationArtNFT, provider);
      const minted = await contract.hasMinted(walletAddress, overallScore);
      setHasMinted(minted);
      return minted;
    } catch (err) {
      console.error('Failed to check minted status:', err);
      setMintError('Failed to check mint status. Ensure wallet is connected.');
      return false;
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkMintedStatus();
    }
  }, [isOpen, walletAddress, overallScore]);

  const handleEagerMint = async () => {
    setIsMinting(true);
    setMintError('');
    setTxHash(null);

    try {
      if (hasMinted) {
        setMintError('You have already minted an NFT for this score.');
        return;
      }

      if (!window.ethereum) throw new Error('Please install MetaMask or connect a wallet.');
      const provider = new BrowserProvider(window.ethereum as unknown as { request: (args: { method: string; params?: any[] }) => Promise<any> });
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const svgElement = document.getElementById('reputation-art-svg');
      if (!svgElement) throw new Error('SVG element not found for minting.');

      console.log('Uploading to IPFS...');
      const ipfsHash = await uploadToIPFS(walletAddress, overallScore, metrics, artData, svgElement);
      console.log('IPFS Hash:', ipfsHash);

      const contract = new Contract(contractAddress, ReputationArtNFT, signer);
      console.log('Minting NFT...');
      const tx = await contract.mintArt(
        walletAddress,
        overallScore,
        metrics.totalTransactions,
        metrics.diversityScore,
        `ipfs://${ipfsHash}`,
        { gasLimit: 300000 }
      );
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      setTxHash(receipt.transactionHash);
      setMintSuccess(true);
      console.log('NFT minted successfully! Tx:', receipt.transactionHash);
    } catch (err: any) {
      console.error('Mint failed:', err);
      setMintError(err.message.includes('Score already minted')
        ? 'You have already minted an NFT for this score.'
        : `Minting failed: ${err.message || 'Please try again. Ensure sufficient MON and gas.'}`);
    } finally {
      setIsMinting(false);
    }
  };

  const resetDialog = () => {
    setMintSuccess(false);
    setMintError('');
    setIsMinting(false);
    setNftDescription('');
    setHasMinted(false); // Reset for next check
    setTxHash(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <div className="relative">
          <Button
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoreMode ? 'Eager Mint Mind Essence' : 'Eager Mint NFT'}
          </Button>
        </div>
      </DialogTrigger>
      
      <DialogContent className={`max-w-md ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } rounded-lg shadow-xl`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center space-x-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
            <span>{isLoreMode ? 'Mint Mind Essence' : 'Eager Mint NFT'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {!mintSuccess && !mintError && (
            <>
              {/* NFT Preview */}
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto rounded-lg ${
                  isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'
                } flex items-center justify-center mb-3 border-2 overflow-hidden`}>
                  {artData && artData.patterns.length > 0 ? (
                    <svg width="96" height="96" viewBox="0 0 400 400">
                      <rect width="96" height="96" fill={artData.background || '#1E293B'} />
                      <circle cx="48" cy="48" r="20" fill="hsl(270, 60%, 50%)" />
                    </svg>
                  ) : (
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  )}
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
                    className={`w-full ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                    placeholder={isLoreMode ? 'Enter Mind Essence name...' : 'Enter Reputation Art name...'}
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
                    placeholder={isLoreMode ? 'Describe this mind essence...' : 'Describe your reputation art...'}
                    className={`w-full ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                  />
                </div>

                {/* Price Display */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
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
                  disabled={isMinting || hasMinted || !nftName.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-200"
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
                {hasMinted && (
                  <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    You have already minted an NFT for this score.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Success State */}
          {mintSuccess && (
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-green-900/50' : ''
              }`}>
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
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Transaction Hash:
                </p>
                <p className="font-mono text-xs text-purple-400 break-all">
                  {txHash ? txHash.slice(0, 20) + '...' : 'Processing...'}
                </p>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className={`w-full ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}`}
              >
                Close
              </Button>
            </div>
          )}

          {/* Error State */}
          {mintError && (
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-red-900/50' : ''
              }`}>
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
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-400"
                  disabled={isMinting}
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className={`w-full ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300'}`}
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