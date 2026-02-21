import { apiClient } from "./client";
import { User, ProfileUpdateRequest, UserStats } from "@/types/api";

export interface SavedMarketItem {
  id: string;
  userId: string;
  marketId: string;
  createdAt: string;
}

export const profileApi = {
  // Profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>("/profile");
    return response.data;
  },
  updateProfile: async (data: ProfileUpdateRequest): Promise<User> => {
    const response = await apiClient.patch<User>("/profile", data);
    return response.data;
  },
  getStats: async (): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>("/profile/stats");
    return response.data;
  },
  uploadAvatar: async (file: File): Promise<User> => {
    const response = await apiClient.upload<User>("/profile/avatar", file);
    return response.data;
  },
  getPublicProfile: async (username: string): Promise<User> => {
    const encodedUsername = encodeURIComponent(username);
    const response = await apiClient.get<User>(`/profile/${encodedUsername}`);
    return response.data;
  },

  // Saved markets
  getSavedMarkets: async (): Promise<SavedMarketItem[]> => {
    const response = await apiClient.get<SavedMarketItem[]>(`/profile/me/saved-markets`);
    return response.data;
  },
  saveMarket: async (marketId: string): Promise<SavedMarketItem> => {
    const response = await apiClient.post<SavedMarketItem>(`/profile/me/saved-markets/${marketId}`);
    return response.data;
  },
  unsaveMarket: async (marketId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/profile/me/saved-markets/${marketId}`);
    return response.data;
  },
};

