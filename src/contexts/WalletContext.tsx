import { useMemo, ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
  MathWalletAdapter,
  NightlyWalletAdapter,
  Coin98WalletAdapter,
  BitgetWalletAdapter,
  SafePalWalletAdapter,
  TokenPocketWalletAdapter,
  WalletConnectWalletAdapter,
  // LedgerWalletAdapter,      // Uncomment if hardware wallet support needed
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: ReactNode;
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  // Determine network based on environment
  const network = useMemo(() => {
    const envNetwork = import.meta.env.VITE_SOLANA_NETWORK;
    if (envNetwork === "devnet") {
      return WalletAdapterNetwork.Devnet;
    } else if (envNetwork === "testnet") {
      return WalletAdapterNetwork.Testnet;
    }
    return WalletAdapterNetwork.Mainnet;
  }, []);

  // Determine RPC endpoint
  const endpoint = useMemo(() => {
    const customRpc = import.meta.env.VITE_SOLANA_RPC_URL;
    if (customRpc) {
      return customRpc;
    }

    // Default endpoints based on network
    switch (network) {
      case WalletAdapterNetwork.Devnet:
        return clusterApiUrl("devnet");
      case WalletAdapterNetwork.Testnet:
        return clusterApiUrl("testnet");
      default:
        return clusterApiUrl("mainnet-beta");
    }
  }, [network]);

  // Initialize wallets - order matters (most popular first)
  // These wallets will show up in the wallet selection modal
  const wallets = useMemo(
    () => {
      const walletList = [
        new PhantomWalletAdapter(),           // #1 Most popular Solana wallet
        new SolflareWalletAdapter(),         // #2 Second most popular
        new CoinbaseWalletAdapter(),         // Coinbase users
        new TrustWalletAdapter(),            // Multi-chain wallet
        new NightlyWalletAdapter(),         // Popular new wallet
        new Coin98WalletAdapter(),          // Popular in Asia
        new MathWalletAdapter(),             // Popular in Asia
        new BitgetWalletAdapter(),           // Trading-focused wallet
        new TokenPocketWalletAdapter(),      // Multi-chain
        new SafePalWalletAdapter(),           // Hardware wallet compatible
        new TorusWalletAdapter(),            // Social login wallet
      ];

      // WalletConnect for mobile wallet connections
      // Get your project ID from https://cloud.walletconnect.com/
      const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
      if (walletConnectProjectId) {
        try {
          walletList.push(
            new WalletConnectWalletAdapter({
              network,
              options: {
                projectId: walletConnectProjectId,
                metadata: {
                  name: "OpenPredictionMarket",
                  description: "Decentralized Prediction Markets on Solana",
                  url: window.location.origin,
                  icons: [`${window.location.origin}/favicon.ico`],
                },
              },
            })
          );
        } catch (error) {
          console.warn("WalletConnect initialization failed:", error);
        }
      } else {
        console.warn(
          "WalletConnect not configured. Set VITE_WALLETCONNECT_PROJECT_ID in .env to enable."
        );
      }

      // Optional: Add hardware wallets (require additional setup)
      // LedgerWalletAdapter - requires user interaction and approval
      // Uncomment to enable:
      // walletList.push(new LedgerWalletAdapter());

      return walletList;
    },
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={false}
        onError={(error) => {
          // Handle wallet connection errors gracefully
          const errorName = error?.name || "";
          const errorMessage = error?.message || "";

          // Suppress common non-critical errors
          if (
            errorName === "WalletDisconnectedError" ||
            errorName === "WalletNotSelectedError" ||
            errorMessage.includes("service worker") ||
            errorMessage.includes("disconnected port") ||
            errorMessage.includes("User rejected")
          ) {
            // These are expected errors - don't log as errors
            return;
          }

          // Log other errors for debugging
          console.warn("Wallet error:", error);
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

