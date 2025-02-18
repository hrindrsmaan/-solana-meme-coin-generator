"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TokenGuideModal } from "./token-guide-modal";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Keypair,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
} from "@solana/spl-token";
import {
  Metadata,
  PROGRAM_ID as METAPLEX_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  MemeCoinGeneratorProps,
  TokenFormData,
  TokenFormErrors,
} from "../types/token";

export function MemeCoinGenerator({
  isWalletConnected,
  walletAddress,
}: MemeCoinGeneratorProps) {
  const [formData, setFormData] = useState<TokenFormData>({
    tokenName: "",
    tokenSymbol: "",
    tokenSupply: "",
    tokenDecimals: "9",
    revokeMint: true,
    revokeFreeze: true,
    revokeUpdate: true,
  });

  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [showGuideModal, setShowGuideModal] = useState(false);

  const [errors, setErrors] = useState<TokenFormErrors>({
    tokenName: "",
    tokenSymbol: "",
    tokenSupply: "",
    tokenDecimals: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors: TokenFormErrors = {
      tokenName: "",
      tokenSymbol: "",
      tokenSupply: "",
      tokenDecimals: "",
    };

    if (formData.tokenName.length < 3) {
      newErrors.tokenName = "Token name must be at least 3 characters";
      isValid = false;
    }

    if (formData.tokenSymbol.length < 2 || formData.tokenSymbol.length > 10) {
      newErrors.tokenSymbol = "Symbol must be between 2-10 characters";
      isValid = false;
    }

    const supply = BigInt(formData.tokenSupply);
    if (supply <= 0n) {
      newErrors.tokenSupply = "Supply must be a positive number";
      isValid = false;
    }

    const decimals = Number(formData.tokenDecimals);
    if (isNaN(decimals) || decimals < 0 || decimals > 9) {
      newErrors.tokenDecimals = "Decimals must be between 0-9";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));

    if (errors[id as keyof TokenFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      tokenName: "",
      tokenSymbol: "",
      tokenSupply: "",
      tokenDecimals: "9",
      revokeMint: true,
      revokeFreeze: true,
      revokeUpdate: true,
    });
    setErrors({
      tokenName: "",
      tokenSymbol: "",
      tokenSupply: "",
      tokenDecimals: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWalletConnected) {
      setStatus("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      setStatus("Please fix the form errors before submitting");
      return;
    }

    setIsLoading(true);
    setStatus("Creating your token...");

    try {
      const { solana } = window as any;
      if (!solana?.isPhantom) {
        throw new Error(
          "Phantom wallet not found. Please install Phantom Wallet."
        );
      }

      if (!walletAddress || walletAddress.length < 32) {
        throw new Error(
          "Invalid wallet address. Please reconnect your wallet."
        );
      }

      const provider = solana;
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const walletPublicKey = new PublicKey(walletAddress.trim()); // Ensure valid key

      // Generate new mint keypair
      const mintKeypair = Keypair.generate();

      const mint = await createMint(
        connection,
        await provider.connect(),
        walletPublicKey, // Mint authority
        formData.revokeFreeze ? null : walletPublicKey, // Freeze authority
        Number(formData.tokenDecimals)
      );

      // Create token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        await provider.connect(),
        mint,
        walletPublicKey
      );

      // Mint tokens
      const mintAmount =
        BigInt(formData.tokenSupply) *
        BigInt(10 ** Number(formData.tokenDecimals));
      await mintTo(
        connection,
        await provider.connect(),
        mint,
        tokenAccount.address,
        walletPublicKey,
        mintAmount
      );

      const realTokenAddress = mint.toBase58();
      setTokenAddress(realTokenAddress);
      setStatus(`Token created successfully! Address: ${realTokenAddress}`);
      setShowGuideModal(true);
      resetForm();
    } catch (error) {
      console.error("Error creating token:", error);
      setStatus(`Error creating token: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Meme Coin Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                id="tokenName"
                value={formData.tokenName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokenSymbol">Token Symbol</Label>
              <Input
                id="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokenSupply">Initial Supply</Label>
              <Input
                id="tokenSupply"
                type="number"
                value={formData.tokenSupply}
                onChange={handleChange}
                required
              />
            </div>

            {status && (
              <Alert>
                <AlertDescription>{status}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Create Token"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <TokenGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        tokenAddress={tokenAddress}
      />
    </>
  );
}
