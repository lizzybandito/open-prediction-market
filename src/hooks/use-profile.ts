import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/api/profile";
import { ProfileUpdateRequest } from "@/types/api";
import { toast } from "sonner";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.getProfile(),
  });
};

export const useProfileStats = () => {
  return useQuery({
    queryKey: ["profile", "stats"],
    queryFn: () => profileApi.getStats(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => profileApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload avatar");
    },
  });
};

export const usePublicProfile = (username: string) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: () => profileApi.getPublicProfile(username),
    enabled: !!username,
    refetchInterval: 2000, // Refresh every 2 seconds for real-time prices (same as market page)
    staleTime: 1000, // Consider data stale after 1 second
    refetchIntervalInBackground: true, // Keep refreshing even when tab is in background
  });
};

export const useSavedMarkets = () => {
  return useQuery({
    queryKey: ["profile", "saved-markets"],
    queryFn: () => profileApi.getSavedMarkets(),
    staleTime: 60_000,
  });
};

export const useToggleSaveMarket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ marketId, isSaved }: { marketId: string; isSaved: boolean }) => {
      if (isSaved) {
        return profileApi.unsaveMarket(marketId);
      }
      return profileApi.saveMarket(marketId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "saved-markets"] });
      toast.success("Updated saved markets");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update saved markets");
    },
  });
};

