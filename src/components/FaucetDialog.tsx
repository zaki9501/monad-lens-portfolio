import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplet, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ethers } from "ethers";
import axios from "axios";

const FAUCET_ADDRESS = "0x5275dfeaf2bd17c5ece560d506a6565a4a9af92c";
const FAUCET_ABI = [
  "function claim() external",
  "function lastClaimed(address) view returns (uint256)",
  "function COOLDOWN() view returns (uint256)",
  "function getBalance() view returns (uint256)",
  "event Claimed(address indexed user, uint256 amount)",
];

const CLAIM_AMOUNT = 0.1;
const MIN_ETH_BALANCE = 0.005;
const MONAD_TESTNET_CHAIN_ID = "10143"; // Replace with actual Monad testnet chain ID if different
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY || "1U5EGKKWY3TUX6MP3Z8B2MXNUTS6G68DNN";

const FaucetDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [lastClaimed, setLastClaimed] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [isNetworkCorrect, setIsNetworkCorrect] = useState(false);
  const [faucetBalance, setFaucetBalance] = useState<string | null>(null);

  // Initialize provider
  const provider = useMemo(() => {
    if (typeof (window.ethereum as any) !== "undefined") {
      return new ethers.BrowserProvider((window.ethereum as any) as ethers.Eip1193Provider);
    }
    return null;
  }, []);

  const contract = useMemo(() => {
    if (provider) {
      return new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider);
    }
    return null;
  }, [provider]);

  // Check network and account
  useEffect(() => {
    if (!open || !provider) return;

    async function initialize() {
      try {
        const accounts = await (window.ethereum as any).request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const network = await provider.getNetwork();
        setIsNetworkCorrect(network.chainId.toString() === MONAD_TESTNET_CHAIN_ID);

        // Listen for account/network changes
        (window.ethereum as any).on("accountsChanged", (newAccounts: string[]) => {
          setAccount(newAccounts[0] || null);
        });
        (window.ethereum as any).on("chainChanged", () => {
          window.location.reload();
        });
      } catch (err) {
        setError("Failed to connect wallet. Please ensure MetaMask is installed.");
      }
    }
    initialize();
  }, [open, provider]);

  // Switch to Monad testnet
  const switchNetwork = async () => {
    try {
      await (window.ethereum as any).request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(MONAD_TESTNET_CHAIN_ID).toString(16)}` }],
      });
      setIsNetworkCorrect(true);
    } catch (err: any) {
      if (err.code === 4902) {
        await (window.ethereum as any).request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${Number(MONAD_TESTNET_CHAIN_ID).toString(16)}`,
              chainName: "Monad Testnet",
              rpcUrls: ["https://testnet-rpc.monad.net"], // Replace with actual RPC
              nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
              blockExplorerUrls: ["https://explorer.monad.net"], // Replace if available
            },
          ],
        });
        setIsNetworkCorrect(true);
      } else {
        setError("Failed to switch network.");
      }
    }
  };

  // Fetch contract data
  const fetchContractData = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const [last, cd, balance] = await Promise.all([
        contract.lastClaimed(account),
        contract.COOLDOWN(),
        contract.getBalance(),
      ]);
      setLastClaimed(Number(last));
      setCooldown(Number(cd));
      setFaucetBalance(ethers.formatEther(balance));
    } catch {
      setError("Failed to fetch faucet data.");
    }
  }, [contract, account]);

  useEffect(() => {
    fetchContractData();
  }, [fetchContractData, success]);

  // Calculate time left
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    if (!lastClaimed || !cooldown) {
      setTimeLeft(0);
      return;
    }
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const next = lastClaimed + cooldown;
      setTimeLeft(Math.max(0, next - now));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lastClaimed, cooldown]);

  // Check ETH balance
  const checkEthBalance = useCallback(async () => {
    if (!account) return false;
    setIsCheckingBalance(true);
    try {
      const res = await axios.get(
        `https://api.etherscan.io/api?module=account&action=balance&address=${account}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
      );
      if (res.data.status === "1") {
        const eth = Number(res.data.result) / 1e18;
        return eth >= MIN_ETH_BALANCE;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsCheckingBalance(false);
    }
  }, [account]);

  // Claim handler
  const handleClaim = async () => {
    setError("");
    setSuccess(false);
    setIsClaiming(true);

    if (Number(faucetBalance) < CLAIM_AMOUNT) {
      setError("Faucet is out of funds. Please try again later.");
      setIsClaiming(false);
      return;
    }

    const hasEnoughEth = await checkEthBalance();
    if (!hasEnoughEth) {
      setError("You need at least 0.005 ETH on Ethereum mainnet to claim.");
      setIsClaiming(false);
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner['claim']();
      await tx.wait();
      setSuccess(true);
    } catch (err: any) {
      if (err.message && err.message.includes("Cooldown not expired")) {
        setError("You must wait 24 hours between claims.");
      } else if (err.message && err.message.includes("Faucet empty")) {
        setError("Faucet is out of funds.");
      } else {
        setError("Failed to claim. Please try again.");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  // Format time left
  const formatTime = (secs: number) => {
    if (secs <= 0) return "Ready to claim!";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-cyan-400" />
            Monad Faucet
          </DialogTitle>
          <DialogDescription>
            Claim <span className="text-cyan-400 font-bold">0.1 MON</span> every 24 hours on Monad Testnet.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
            <div className="text-green-400 font-bold">Claimed 0.1 MON!</div>
            <Button onClick={() => { setSuccess(false); onOpenChange(false); }} className="mt-2">Close</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="text-sm text-gray-300">
                Connected: <span className="text-cyan-400">{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}</span>
              </div>
              <div className="text-lg font-mono text-cyan-400">{formatTime(timeLeft)}</div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {!isNetworkCorrect ? (
              <Button onClick={switchNetwork} className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 text-white">
                Switch to Monad Testnet
              </Button>
            ) : (
              <Button
                onClick={handleClaim}
                disabled={isClaiming || isCheckingBalance || timeLeft > 0 || !account}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 text-white"
              >
                {(isClaiming || isCheckingBalance) ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Droplet className="w-4 h-4 mr-2" />}
                {isCheckingBalance ? "Checking Balance..." : timeLeft > 0 ? "Claim Unavailable" : "Claim 0.1 MON"}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FaucetDialog;