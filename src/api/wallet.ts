import { apiClient } from "./client";
import { WalletBalance, Transaction, DepositRequest, WithdrawRequest } from "@/types/api";

export const walletApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const response = await apiClient.get<WalletBalance>("/wallet/balance");
    return response.data;
  },

  getTransactions: async (filters?: { type?: string; page?: number; limit?: number }): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>("/wallet/transactions", filters);
    return response.data;
  },

  deposit: async (request: DepositRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>("/wallet/deposit", request);
    return response.data;
  },

  withdraw: async (request: WithdrawRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>("/wallet/withdraw", request);
    return response.data;
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/wallet/transactions/${id}`);
    return response.data;
  },
};

