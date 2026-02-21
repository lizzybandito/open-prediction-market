import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tradingApi } from "@/api/trading";
import { PlaceOrderRequest, OrderCalculation } from "@/types/api";
import { toast } from "sonner";
import { useSolanaWallet } from "./use-solana-wallet";
import { Transaction } from "@solana/web3.js";

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: PlaceOrderRequest) => tradingApi.placeOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Order placed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to place order");
    },
  });
};

export const useCalculateOrder = (order: Omit<PlaceOrderRequest, "orderType"> | null) => {
  return useQuery({
    queryKey: ["calculate-order", order],
    queryFn: () => tradingApi.calculateOrder(order!),
    enabled: !!order && !!order.marketId && !!order.amount && order.amount > 0,
  });
};

export const useOrders = (filters?: { marketId?: string; status?: string }) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => tradingApi.getOrders(filters),
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradingApi.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });
};

export const useOrderBook = (marketId: string | undefined) => {
  return useQuery({
    queryKey: ["orderbook", marketId],
    queryFn: () => tradingApi.getOrderBook(marketId!),
    enabled: !!marketId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

interface CashOutRequest {
  marketId: string;
  shares: number;
  outcomeLabel?: string;
  outcomeSide?: "YES" | "NO";
}

interface CashOutPreviewRequest extends CashOutRequest {}

export const useCashOut = () => {
  const queryClient = useQueryClient();
  const { sendTransaction, signTransaction, connection, publicKey } = useSolanaWallet();

  return useMutation({
    mutationFn: async (payload: CashOutRequest) => {
      const response = await tradingApi.cashOut(payload);
      
      // Check if blockchain transaction is required
      if (response.data?.blockchain?.needsSignature && response.data?.blockchain?.serializedTx) {
        if (!publicKey || !sendTransaction || !signTransaction) {
          throw new Error("Wallet not connected. Please connect your Solana wallet to complete the cashout.");
        }

        try {
          // Deserialize the transaction (browser-compatible base64 decoding)
          const base64String = response.data.blockchain.serializedTx;
          const binaryString = atob(base64String);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const transaction = Transaction.from(bytes);

          // Sign the transaction
          const signedTx = await signTransaction(transaction);

          // Send the transaction
          const signature = await sendTransaction(signedTx, connection, {
            skipPreflight: false,
          });

          // Wait for confirmation
          toast.info("Transaction submitted. Waiting for confirmation...");
          await connection.confirmTransaction(signature, "confirmed");

          toast.success("Cashout transaction confirmed!");
          
          return response;
        } catch (error: any) {
          console.error("Blockchain transaction error:", error);
          throw new Error(error.message || "Failed to sign or send transaction");
        }
      }

      // Database mode - no blockchain transaction needed
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || "Failed to cash out");
    },
  });
};

export const useCalculateCashOut = (params?: CashOutPreviewRequest) => {
  return useQuery({
    queryKey: ["calculate-cashout", params],
    queryFn: () => tradingApi.calculateCashOut(params!),
    enabled: Boolean(params?.marketId && params?.shares && params.shares > 0),
    refetchInterval: 3000,
    staleTime: 1000,
  });
};

