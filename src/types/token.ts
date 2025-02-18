// types/token.ts

export interface TokenFormData {
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: string;
  tokenDecimals: string;
  revokeMint: boolean;
  revokeFreeze: boolean;
  revokeUpdate: boolean;
}

export interface TokenFormErrors {
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: string;
  tokenDecimals: string;
}

export interface MemeCoinGeneratorProps {
  isWalletConnected: boolean;
  walletAddress: string;
}
