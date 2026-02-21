import { apiClient } from "./client";
import { SignInRequest, SignUpRequest, AuthResponse, User } from "@/types/api";

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/signin", credentials);
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response.data;
  },

  signUp: async (credentials: SignUpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/signup", credentials);
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response.data;
  },

  signOut: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/signout");
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await apiClient.post<{ token: string }>("/auth/refresh", { refreshToken });
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
    }
    return response.data;
  },

  checkUsername: async (username: string): Promise<{ available: boolean; message: string }> => {
    const encodedUsername = encodeURIComponent(username);
    const response = await apiClient.get<{ available: boolean; message: string }>(`/auth/check-username/${encodedUsername}`);
    return response.data;
  },

  checkEmail: async (email: string): Promise<{ available: boolean; message: string }> => {
    const encodedEmail = encodeURIComponent(email);
    const response = await apiClient.get<{ available: boolean; message: string }>(`/auth/check-email/${encodedEmail}`);
    return response.data;
  },

  walletSignUp: async (credentials: { walletAddress: string; signature: string; message: string; username: string; referralCode?: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/wallet/signup", credentials);
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response.data;
  },

  walletSignIn: async (credentials: { walletAddress: string; signature: string; message: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/wallet/signin", credentials);
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response.data;
  },
};

