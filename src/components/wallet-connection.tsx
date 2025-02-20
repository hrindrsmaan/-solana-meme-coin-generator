// wallet-connection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ExternalLink, RefreshCcw, Coins } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

interface WalletConnectionProps {
  onWalletChange: (connected: boolean, walletAddress: string) => void;
}

export function WalletConnection({ onWalletChange }: WalletConnectionProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch SOL price in USD
  const fetchSolPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      const data = await response.json();
      return data.solana.usd;
    } catch (error) {
      console.error("Error fetching SOL price:", error);
      return null;
    }
  };

  const getWalletBalance = async () => {
    try {
      setIsRefreshing(true);
      const { solana } = window as any;

      if (solana?.isPhantom && isConnected && walletAddress) {
        const publicKey = solana.publicKey;

        if (publicKey) {
          const network =
            process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta";
          const connection = new Connection(clusterApiUrl(network as any));

          if (process.env.NODE_ENV === "development") {
            console.log(`Using Solana ${network} network`);
          }

          const rawBalance = await connection.getBalance(
            new PublicKey(walletAddress)
          );
          const solBalance = rawBalance / 1e9;
          setBalance(solBalance);

          if (network === "mainnet-beta") {
            const solPrice = await fetchSolPrice();
            if (solPrice) {
              setUsdValue(solBalance * solPrice);
            }
          } else {
            setUsdValue(solBalance * 0);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
      setUsdValue(null);
      setStatus(
        "Unable to fetch wallet balance. Please ensure your wallet is connected properly."
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window as any;

      if (solana?.isPhantom) {
        const response = await solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          const addr = response.publicKey.toString();
          setWalletAddress(addr);
          setIsConnected(true);
          onWalletChange(true, addr); // Update parent's state
          getWalletBalance();
        }
      }
    } catch (error) {
      console.log("Wallet not pre-authorized:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { solana } = window as any;
      if (!solana?.isPhantom) {
        window.open("https://phantom.app/", "_blank");
        return;
      }
      const response = await solana.connect();
      if (response.publicKey) {
        const addr = response.publicKey.toString();
        setWalletAddress(addr);
        setIsConnected(true);
        onWalletChange(true, addr); // Update parent's state
        setStatus("Wallet connected successfully!");
      }
    } catch (error) {
      console.error(error);
      setStatus("Error connecting wallet");
    }
  };

  const disconnectWallet = async () => {
    try {
      const { solana } = window as any;
      if (solana) {
        await solana.disconnect();
        setWalletAddress("");
        setIsConnected(false);
        setBalance(null);
        setUsdValue(null);
        setStatus("Wallet disconnected");
        onWalletChange(false, ""); // Notify parent that wallet is disconnected
      }
    } catch (error) {
      console.error(error);
      setStatus("Error disconnecting wallet");
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatBalance = (bal: number | null) => {
    if (bal === null) return "0";
    return bal.toFixed(4);
  };

  const formatUSD = (value: number | null) => {
    if (value === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (isConnected) {
      getWalletBalance();
      const intervalId = setInterval(getWalletBalance, 30000);
      return () => clearInterval(intervalId);
    }
  }, [isConnected]);

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      {!isConnected ? (
        <Button
          onClick={connectWallet}
          className="w-full flex items-center justify-center gap-2 transition-all hover:scale-105"
          variant="outline"
        >
          <Wallet className="w-5 h-5" />
          Connect Phantom Wallet
        </Button>
      ) : (
        <Card className="w-full transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-500" />
                  <span className="font-medium">
                    {formatAddress(walletAddress)}
                  </span>
                  <a
                    href={`https://explorer.solana.com/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  size="sm"
                  className="hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  Disconnect
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">
                      {formatBalance(balance)} SOL
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatUSD(usdValue)}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={getWalletBalance}
                  disabled={isRefreshing}
                  className="p-2"
                >
                  <RefreshCcw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {status && (
        <Alert className="mt-4">
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
