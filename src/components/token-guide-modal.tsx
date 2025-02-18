"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2 } from "lucide-react";

interface TokenGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
}

export function TokenGuideModal({
  isOpen,
  onClose,
  tokenAddress,
}: TokenGuideModalProps) {
  // List of steps for the user to follow after token creation
  const nextSteps = [
    {
      title: "Token Creation Complete",
      description:
        "Your token has been created on the Solana blockchain. Save your token address for future reference.",
      link: `https://explorer.solana.com/address/${tokenAddress}`,
      linkText: "View on Solana Explorer",
    },
    {
      title: "Create Liquidity Pool",
      description:
        "Visit Raydium to create a liquidity pool for your token. You'll need to pair it with SOL or USDC.",
      link: "https://raydium.io/liquidity/create/",
      linkText: "Create Pool on Raydium",
    },
    {
      title: "Add Initial Liquidity",
      description:
        "Provide initial liquidity to enable trading. The more liquidity you add, the more stable the trading will be.",
      link: "https://raydium.io/liquidity/",
      linkText: "Add Liquidity",
    },
    {
      title: "Optional: Verify Token",
      description:
        "Consider verifying your token to increase trust. This involves providing additional information about your project.",
      link: "https://raydium.io/",
      linkText: "Learn About Verification",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            Token Created Successfully!
          </DialogTitle>
          <DialogDescription>
            Follow these steps to list your token on Raydium DEX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {nextSteps.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                  <Button
                    variant="link"
                    className="h-8 mt-2 text-blue-500 hover:text-blue-700 p-0"
                    onClick={() => window.open(step.link, "_blank")}
                  >
                    {step.linkText}
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h4 className="font-medium mb-2">Your Token Details</h4>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-gray-600">Token Address:</span>
              <code className="bg-gray-100 px-2 py-1 rounded">
                {tokenAddress}
              </code>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
