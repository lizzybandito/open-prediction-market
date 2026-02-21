import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { useMemo } from "react";
import { toast } from "sonner";

/**
 * Custom hook for Solana wallet interactions
 */
export const useSolanaWallet = () => {
  const { connection } = useConnection();
  const {
    publicKey,
    sendTransaction,
    signTransaction,
    signAllTransactions,
    connected,
    connecting,
    disconnecting,
    wallet,
    wallets,
    select,
    connect,
    disconnect,
  } = useWallet();

  /**
   * Create Anchor provider
   */
  const provider = useMemo(() => {
    if (!publicKey || !signTransaction) {
      return null;
    }

    const signAllTxs = signAllTransactions || (async (txs: Transaction[]) => {
      return Promise.all(txs.map(tx => signTransaction(tx)));
    });

    return new AnchorProvider(
      connection,
      {
        publicKey,
        signTransaction,
        signAllTransactions: signAllTxs,
      } as any,
      { commitment: "confirmed" }
    );
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  /**
   * Initialize Anchor program
   */
  const getProgram = (idl: any): Program | null => {
    if (!provider) {
      return null;
    }

    const programId = import.meta.env.VITE_SOLANA_PROGRAM_ID as string | undefined;
    if (!programId) {
      console.warn("VITE_SOLANA_PROGRAM_ID not set");
      return null;
    }

    try {
      return new Program(idl, new PublicKey(programId), provider);
    } catch (error) {
      console.error("Error creating program:", error);
      return null;
    }
  };

  /**
   * Get user's SOL balance
   */
  const getBalance = async (): Promise<number> => {
    if (!publicKey) {
      return 0;
    }

    try {
      const balance = await connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error("Error getting balance:", error);
      return 0;
    }
  };

  /**
   * Send SOL transaction
   */
  const sendSOL = async (toAddress: string, amountSOL: number): Promise<string> => {
    if (!publicKey || !sendTransaction) {
      throw new Error("Wallet not connected");
    }

    try {
      const toPubkey = new PublicKey(toAddress);
      const lamports = amountSOL * 1e9;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey,
          lamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      toast.success("Transaction sent successfully");
      return signature;
    } catch (error: any) {
      console.error("Error sending SOL:", error);
      toast.error(error.message || "Failed to send transaction");
      throw error;
    }
  };

  /**
   * Sign a message (for authentication)
   */
  const signMessage = async (message: string): Promise<Uint8Array | null> => {
    if (!publicKey || !wallet?.adapter?.signMessage) {
      throw new Error("Wallet does not support message signing");
    }

    try {
      const messageBytes = new TextEncoder().encode(message);
      const signature = await wallet.adapter.signMessage(messageBytes);
      return signature;
    } catch (error: any) {
      console.error("Error signing message:", error);
      toast.error(error.message || "Failed to sign message");
      return null;
    }
  };

  /**
   * Connect wallet
   */
  const connectWallet = async () => {
    try {
      await connect();
      toast.success("Wallet connected");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  /**
   * Disconnect wallet
   */
  const disconnectWallet = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected");
    } catch (error: any) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return {
    // Wallet state
    publicKey,
    address: publicKey?.toString() || null,
    connected,
    connecting,
    disconnecting,
    wallet,

    // Connection
    connection,

    // Provider
    provider,

    // Methods
    getProgram,
    getBalance,
    sendSOL,
    signMessage,
    connect: connectWallet,
    disconnect: disconnectWallet,
    sendTransaction,
    signTransaction,
  };
};

