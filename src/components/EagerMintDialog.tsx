
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, CheckCircle, AlertCircle, Coins, Zap, Network } from "lucide-react";
import { ethers, BrowserProvider, Contract } from 'ethers';
import { uploadToIPFS } from '@/utils/pinata';
import ReputationArtNFT from '@/abis/ReputationArtNFT.json';
import { useToast } from "@/hooks/use-toast";

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

const MONAD_TESTNET = {
  chainId: '0x278F', // 10143 in hex
  chainName: 'Monad Testnet',
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
};

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
  const [isCheckingMintStatus, setIsCheckingMintStatus] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  const { toast } = useToast();

  const contractAddress = "0x4ba16060a00d0e0939cb69e46846fbee30f7c847";

  const getRarityAndPrice = () => {
    if (overallScore >= 80) return { rarity: 'Legendary', price: '0.1', color: 'text-yellow-400' };
    if (overallScore >= 60) return { rarity: 'Epic', price: '0.05', color: 'text-purple-400' };
    if (overallScore >= 40) return { rarity: 'Rare', price: '0.025', color: 'text-blue-400' };
    return { rarity: 'Common', price: '0.01', color: 'text-gray-400' };
  };

  const { rarity, price, color } = getRarityAndPrice();

  // Check current network
  const checkCurrentNetwork = async () => {
    setIsCheckingNetwork(true);
    try {
      if (!window.ethereum) {
        setCurrentChainId(null);
        return;
      }

      const provider = new BrowserProvider(window.ethereum as unknown as { request: (args: { method: string; params?: any[] }) => Promise<any> });
      const network = await provider.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;
      setCurrentChainId(chainId);
      console.log('Current network chain ID:', chainId);
    } catch (error) {
      console.error('Failed to check network:', error);
      setCurrentChainId(null);
    } finally {
      setIsCheckingNetwork(false);
    }
  };

  // Switch to Monad testnet
  const switchToMonadTestnet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or connect a wallet.');
      }

      console.log('Attempting to switch to Monad testnet...');

      // First try to switch to the network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_TESTNET.chainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          console.log('Network not found, adding Monad testnet...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          });
        } else {
          throw switchError;
        }
      }

      await checkCurrentNetwork();
      
      toast({
        title: "Network Switched",
        description: "Successfully switched to Monad Testnet",
      });

    } catch (error: any) {
      console.error('Failed to switch network:', error);
      toast({
        title: "Network Switch Failed",
        description: error.message || 'Failed to switch to Monad Testnet',
        variant: "destructive",
      });
    }
  };

  const checkMintedStatus = async () => {
    setIsCheckingMintStatus(true);
    try {
      console.log('Checking mint status for wallet:', walletAddress, 'score:', overallScore);
      
      if (!window.ethereum) {
        console.log('No ethereum provider found');
        setHasMinted(false);
        return false;
      }

      // Ensure we're on the correct network first
      if (currentChainId !== MONAD_TESTNET.chainId) {
        console.log('Not on Monad testnet, cannot check mint status');
        setHasMinted(false);
        return false;
      }

      const provider = new BrowserProvider(window.ethereum as unknown as { request: (args: { method: string; params?: any[] }) => Promise<any> });
      const contract = new Contract(contractAddress, ReputationArtNFT, provider);
      
      console.log('Contract created, calling hasMinted...');
      
      try {
        const minted = await contract.hasMinted(walletAddress, overallScore);
        console.log('hasMinted result:', minted);
        setHasMinted(minted);
        return minted;
      } catch (contractError: any) {
        console.log('Contract call failed, this might be normal if the method doesnt exist:', contractError);
        setHasMinted(false);
        return false;
      }
    } catch (err: any) {
      console.error('Failed to check minted status:', err);
      setHasMinted(false);
      return false;
    } finally {
      setIsCheckingMintStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkCurrentNetwork();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentChainId === MONAD_TESTNET.chainId) {
      checkMintedStatus();
    }
  }, [isOpen, walletAddress, overallScore, currentChainId]);

  const handleEagerMint = async () => {
    setIsMinting(true);
    setMintError('');
    setTxHash(null);

    try {
      console.log('Starting mint process...');
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or connect a wallet.');
      }

      // Check if we're on the correct network
      if (currentChainId !== MONAD_TESTNET.chainId) {
        throw new Error('Please switch to Monad Testnet to mint NFTs.');
      }

      const provider = new BrowserProvider(window.ethereum as unknown as { request: (args: { method: string; params?: any[] }) => Promise<any> });
      
      // Request account access
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      console.log('Signer address:', signerAddress);
      console.log('Target wallet address:', walletAddress);
      
      // Verify the signer is the same as the wallet address being analyzed
      if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('You can only mint NFTs for your own wallet address.');
      }

      const svgElement = document.getElementById('reputation-art-svg');
      if (!svgElement) {
        throw new Error('SVG element not found for minting.');
      }

      console.log('Uploading to IPFS...');
      toast({
        title: "Uploading to IPFS",
        description: "Please wait while we upload your art...",
      });

      const ipfsHash = await uploadToIPFS(walletAddress, overallScore, metrics, artData, svgElement);
      console.log('IPFS Hash:', ipfsHash);

      console.log('Creating contract instance for minting...');
      const contract = new Contract(contractAddress, ReputationArtNFT, signer);
      
      console.log('Calling mintArt with params:', {
        recipient: walletAddress,
        score: overallScore,
        totalTransactions: metrics.totalTransactions,
        diversityScore: metrics.diversityScore,
        ipfsHash: `ipfs://${ipfsHash}`
      });

      toast({
        title: "Minting NFT",
        description: "Please confirm the transaction in your wallet...",
      });

      const tx = await contract.mintArt(
        walletAddress,
        overallScore,
        metrics.totalTransactions,
        metrics.diversityScore,
        `ipfs://${ipfsHash}`,
        { gasLimit: 300000 }
      );
      
      console.log('Transaction sent:', tx.hash);
      setTxHash(tx.hash);

      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      });

      const receipt = await tx.wait();
      console.log('NFT minted successfully! Tx:', receipt.transactionHash);
      
      setMintSuccess(true);
      setHasMinted(true);

      toast({
        title: "NFT Minted Successfully!",
        description: "Your reputation art has been minted as an NFT.",
      });

    } catch (err: any) {
      console.error('Mint failed:', err);
      
      let errorMessage = 'Minting failed. Please try again.';
      
      if (err.message?.includes('Score already minted')) {
        errorMessage = 'You have already minted an NFT for this score.';
        setHasMinted(true);
      } else if (err.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees.';
      } else if (err.message?.includes('You can only mint NFTs for your own wallet')) {
        errorMessage = err.message;
      } else if (err.message?.includes('Please switch to Monad Testnet')) {
        errorMessage = err.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setMintError(errorMessage);
      
      toast({
        title: "Minting Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  const resetDialog = () => {
    setMintSuccess(false);
    setMintError('');
    setIsMinting(false);
    setNftDescription('');
    setTxHash(null);
  };

  const isOnCorrectNetwork = currentChainId === MONAD_TESTNET.chainId;

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
          {/* Network Status */}
          {!isCheckingNetwork && (
            <div className={`p-3 rounded-lg border ${
              isOnCorrectNetwork 
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Network className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isOnCorrectNetwork ? 'Monad Testnet' : 'Wrong Network'}
                  </span>
                </div>
                {!isOnCorrectNetwork && (
                  <Button
                    size="sm"
                    onClick={switchToMonadTestnet}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Switch Network
                  </Button>
                )}
              </div>
              {!isOnCorrectNetwork && (
                <p className="text-xs mt-1 opacity-80">
                  You need to be on Monad Testnet to mint NFTs
                </p>
              )}
            </div>
          )}

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

                {/* Mint Status */}
                {isCheckingMintStatus && (
                  <div className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                    Checking mint status...
                  </div>
                )}

                {/* Mint Button */}
                <Button
                  onClick={handleEagerMint}
                  disabled={isMinting || hasMinted || !nftName.trim() || isCheckingMintStatus || !isOnCorrectNetwork}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-200"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Minting...
                    </>
                  ) : hasMinted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Already Minted
                    </>
                  ) : !isOnCorrectNetwork ? (
                    <>
                      <Network className="w-4 h-4 mr-2" />
                      Switch to Monad Testnet
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
