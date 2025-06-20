import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { uploadToPinata } from "@/utils/pinata";
import { Sparkles, Loader2, ExternalLink, CheckCircle, AlertTriangle, Zap, Star } from "lucide-react";
import { ethers } from 'ethers';
import ReputationArtNFTABI from '@/abis/ReputationArtNFT.json';

const EagerMintDialog = ({ walletAddress, overallScore, artData, isDarkMode, isLoreMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStep, setMintingStep] = useState('');
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [tokenId, setTokenId] = useState(null);
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [networkInfo, setNetworkInfo] = useState(null);
  const [hasBeenMinted, setHasBeenMinted] = useState(false);

  // ReputationArtNFT contract address on Monad testnet
  const REPUTATION_ART_NFT_ADDRESS = "0xf47db80288f5f2a757c53d73c39a49e1d5aaf76b";

  // Check if this wallet has already minted an NFT
  useEffect(() => {
    const mintedWallets = JSON.parse(localStorage.getItem('mintedWallets') || '{}');
    if (mintedWallets[walletAddress.toLowerCase()]) {
      setHasBeenMinted(true);
    }
  }, [walletAddress]);

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const networkVersion = (window.ethereum as any).networkVersion;
          const chainId = await (window.ethereum as any).request({ method: 'eth_chainId' });
          console.log('Network Details:', {
            networkVersion,
            chainId,
            isMonadTestnet: networkVersion === '10143' || chainId === '0x279b',
            ethereum: !!window.ethereum
          });
          
          if (networkVersion === '10143' || chainId === '0x279b') {
            setContractAddress(REPUTATION_ART_NFT_ADDRESS);
            setNetworkInfo({
              name: 'Monad Testnet',
              chainId: '10143',
              explorer: 'https://testnet.monvision.io/'
            });
            setMintError(''); // Clear any previous errors
          } else {
            console.log('Wrong network detected:', { networkVersion, chainId });
            setMintError('Please connect to Monad Testnet (Chain ID: 10143)');
          }
        } catch (error) {
          console.error('Error checking network:', error);
          setMintError('Failed to detect network. Please ensure MetaMask is installed and connected.');
        }
      } else {
        console.log('No ethereum provider found');
        setMintError('MetaMask not found. Please install MetaMask to continue.');
      }
    };

    if (isOpen) {
      checkNetwork();
    }
  }, [isOpen]);

  const handleMint = async () => {
    if (!window.ethereum) {
      setMintError('MetaMask not found');
      return;
    }

    setIsMinting(true);
    setMintError('');
    setMintingStep('Preparing artwork...');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      console.log('Signer address:', signerAddress);
      console.log('Target wallet address:', walletAddress);

      if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Connected wallet does not match the analyzed wallet');
      }

      // Check if already minted before proceeding
      const contract = new ethers.Contract(contractAddress, ReputationArtNFTABI, signer);
      const hasMinted = await contract.hasMinted(walletAddress, overallScore);
      
      if (hasMinted) {
        throw new Error('This wallet has already minted an NFT for this score.');
      }

      setMintingStep('Uploading to IPFS...');
      console.log('Uploading to IPFS...');
      const ipfsHash = await uploadToPinata(walletAddress, overallScore, artData);
      console.log('IPFS Hash:', ipfsHash);

      setMintingStep('Creating contract instance for minting...');
      console.log('Creating contract instance for minting...');
      
      const transaction = await contract.mintArt(
        walletAddress,
        overallScore,
        artData.patterns?.length || 0,
        artData.mandalaRings?.length || 0,
        ipfsHash
      );

      console.log('Transaction sent:', transaction.hash);
      setTxHash(transaction.hash);
      setMintingStep('Confirming transaction...');

      const receipt = await transaction.wait();
      console.log('Transaction confirmed:', receipt);

      // Extract token ID from logs
      const transferEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'Transfer';
        } catch {
          return false;
        }
      });

      if (transferEvent) {
        const parsedLog = contract.interface.parseLog(transferEvent);
        const newTokenId = parsedLog.args.tokenId.toString();
        console.log('Minted Token ID:', newTokenId);
        setTokenId(newTokenId);

        // Verify metadata
        try {
          const supportsInterface = await contract.supportsInterface('0x5b5e139f');
          console.log('Supports ERC721Metadata:', supportsInterface);
          
          if (supportsInterface) {
            const tokenURI = await contract.tokenURI(newTokenId);
            console.log('Token URI:', tokenURI);
            
            const storedMetadata = await contract.getArtMetadata(newTokenId);
            console.log('Stored Art Metadata:', storedMetadata);
            
            setTokenMetadata({
              supportsInterface,
              tokenURI,
              metadata: storedMetadata
            });
          }
        } catch (metadataError) {
          console.warn('Could not fetch metadata:', metadataError);
        }
      }

      setMintSuccess(true);
      setMintingStep('NFT minted successfully!');
      
      // Store minted status in localStorage
      const mintedWallets = JSON.parse(localStorage.getItem('mintedWallets') || '{}');
      mintedWallets[walletAddress.toLowerCase()] = {
        tokenId: tokenId,
        txHash: transaction.hash,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('mintedWallets', JSON.stringify(mintedWallets));
      setHasBeenMinted(true);
    } catch (error) {
      console.error('Minting error:', error);
      
      // Handle contract errors in a user-friendly way
      if (error.reason) {
        // This is a contract error
        setMintError(error.reason);
      } else if (error.message) {
        // Handle specific error messages
        if (error.message.includes('already minted')) {
          setMintError('This wallet has already minted an NFT for this score.');
        } else if (error.message.includes('user rejected')) {
          setMintError('Transaction was rejected. Please try again.');
        } else if (error.message.includes('insufficient funds')) {
          setMintError('Insufficient funds for gas. Please ensure you have enough MON tokens.');
        } else {
          setMintError(error.message);
        }
      } else {
        setMintError('Failed to mint NFT. Please try again.');
      }
    } finally {
      setIsMinting(false);
    }
  };

  const calculateAdditionalTraits = () => {
    const visualElements = (artData.patterns?.length || 0) + (artData.particles?.length || 0);
    const complexityScore = artData.mandalaRings?.length || 0;
    const energyFlows = (artData.connections?.length || 0) + (artData.waves?.length || 0);
    const geometricHarmony = artData.geometricHarmony || 0;
    const chromaticSignature = artData.chromaticSignature || 0;
    
    return {
      visualElements,
      complexityScore,
      energyFlows,
      geometricHarmony,
      chromaticSignature
    };
  };

  const additionalTraits = calculateAdditionalTraits();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={hasBeenMinted}
          className={`${hasBeenMinted 
            ? 'bg-gray-500 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          } text-white`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {hasBeenMinted ? 'Already Minted' : 'Mint as NFT'}
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>{isLoreMode ? 'Crystallize Mind Essence' : 'Mint Reputation Art'}</span>
          </DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {hasBeenMinted 
              ? 'This wallet has already minted its reputation art NFT.'
              : isLoreMode 
                ? 'Transform your digital consciousness into an eternal NFT artifact on the Monad blockchain.'
                : 'Create a permanent NFT of your unique reputation artwork on the Monad blockchain.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Already Minted Notice */}
          {hasBeenMinted && (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>NFT Already Minted</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-600'}`}>
                This wallet has already minted its unique reputation art NFT.
              </p>
            </div>
          )}

          {/* Network Info */}
          {networkInfo && (
            <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between text-sm">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Network:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{networkInfo.name}</span>
              </div>
            </div>
          )}

          {/* NFT Preview Stats with new traits */}
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NFT Traits Preview</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Score:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{overallScore}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Visual Elements:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{additionalTraits.visualElements}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Complexity:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{additionalTraits.complexityScore}x</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Energy Flows:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{additionalTraits.energyFlows}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Geometric Harmony:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{additionalTraits.geometricHarmony}°</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Chromatic Signature:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{additionalTraits.chromaticSignature}°</span>
              </div>
            </div>
          </div>

          {/* Minting Progress */}
          {isMinting && (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Minting in Progress</span>
              </div>
              <p className={`text-sm mb-3 ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>{mintingStep}</p>
              <Progress value={
                mintingStep.includes('Preparing') ? 20 :
                mintingStep.includes('Uploading') ? 40 :
                mintingStep.includes('Creating') ? 60 :
                mintingStep.includes('Minting') ? 80 :
                mintingStep.includes('Confirming') ? 90 : 100
              } className="h-2" />
            </div>
          )}

          {/* Success State */}
          {mintSuccess && (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>NFT Minted Successfully!</span>
              </div>
              
              {tokenId && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-green-200' : 'text-green-600'}>Token ID:</span>
                    <span className={`font-mono ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>#{tokenId}</span>
                  </div>
                  {txHash && (
                    <div className="flex justify-between items-center">
                      <span className={isDarkMode ? 'text-green-200' : 'text-green-600'}>Transaction:</span>
                      <a 
                        href={`${networkInfo?.explorer}/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-mono text-xs hover:underline flex items-center space-x-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}
                      >
                        <span>{txHash.slice(0, 8)}...{txHash.slice(-6)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {mintError && (
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Minting Failed</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-600'}`}>{mintError}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {hasBeenMinted ? (
            <Button 
              onClick={() => setIsOpen(false)}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Close
            </Button>
          ) : !mintSuccess ? (
            <Button 
              onClick={handleMint} 
              disabled={isMinting || !networkInfo}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
            >
              {isMinting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  {isLoreMode ? 'Crystallize Essence' : 'Mint NFT'}
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={() => setIsOpen(false)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Star className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EagerMintDialog;
