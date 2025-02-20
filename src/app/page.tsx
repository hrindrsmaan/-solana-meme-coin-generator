// page.tsx

"use client";
import { useState } from "react";
import { WalletConnection } from "@/components/wallet-connection";
import { MemeCoinGenerator } from "@/components/meme-coin-generator";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const handleWalletConnection = (connected: boolean, address: string) => {
    setIsConnected(connected);
    setWalletAddress(address);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Solana Meme Coin Generator
        </h1>

        <WalletConnection onWalletChange={handleWalletConnection} />
        <MemeCoinGenerator
          isWalletConnected={isConnected}
          walletAddress={walletAddress}
        />
      </div>
    </main>
  );
}
