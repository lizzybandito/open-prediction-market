import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { SignInRequest, SignUpRequest } from "@/types/api";
import { toast } from "sonner";

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: SignInRequest) => authApi.signIn(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data.user);
      toast.success("Signed in successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Sign in failed");
    },
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: SignUpRequest) => authApi.signUp(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data.user);
      toast.success("Account created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Sign up failed");
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.clear();
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      toast.success("Signed out successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Sign out failed");
    },
  });
};

export const useCurrentUser = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
    staleTime: 300000, // 5 minutes
    enabled: !!token, // Only fetch if token exists
  });
};

