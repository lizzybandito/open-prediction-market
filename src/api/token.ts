import { apiClient } from "./client";

export interface ConnectWalletRequest {
  address: string;
  chain: "evm" | "sol";
}

export const tokenApi = {
  connectWallet: async (request: ConnectWalletRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>("/token/connect-wallet", request);
    return response.data;
  },
};

