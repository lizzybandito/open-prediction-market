import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/api/wallet";
import { DepositRequest, WithdrawRequest } from "@/types/api";
import { toast } from "sonner";

export const useWalletBalance = () => {
  return useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: () => walletApi.getBalance(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useTransactions = (filters?: { type?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["wallet", "transactions", filters],
    queryFn: () => walletApi.getTransactions(filters),
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DepositRequest) => walletApi.deposit(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Deposit initiated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Deposit failed");
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: WithdrawRequest) => walletApi.withdraw(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Withdrawal initiated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Withdrawal failed");
    },
  });
};

