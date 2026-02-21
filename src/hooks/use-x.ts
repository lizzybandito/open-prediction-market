import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { xApi, XChallenge, XPostItem, XSubmitResult, XVerifyComplete } from "@/api/x";
import { toast } from "sonner";

export const useXChallenge = (walletAddress?: string, seasonId: string = "current") => {
  return useMutation<{ challenge: string; nonce: string; expiresAt: string }, any, void>({
    mutationFn: async () => {
      if (!walletAddress) throw new Error("Connect wallet to start");
      return xApi.startVerify(walletAddress, seasonId);
    },
  });
};

export const useXVerifyComplete = (walletAddress?: string) => {
  return useMutation<XVerifyComplete, any, { tweetUrl: string; challenge: string }>({
    mutationFn: async ({ tweetUrl, challenge }) => {
      if (!walletAddress) throw new Error("Connect wallet to complete verification");
      return xApi.completeVerify(tweetUrl, challenge, walletAddress);
    },
    onSuccess: (data) => {
      toast.success(`X verified: @${data.handle}`);
    },
    onError: (e: any) => toast.error(e.message || "Verification failed"),
  });
};

export const useXSubmitTweet = () => {
  const qc = useQueryClient();
  return useMutation<XSubmitResult, any, { tweetUrl: string; seasonId?: string }>({
    mutationFn: ({ tweetUrl, seasonId }) => xApi.submitTweet(tweetUrl, seasonId),
    onSuccess: () => {
      toast.success("Tweet submitted");
      qc.invalidateQueries({ queryKey: ["x", "posts"] });
    },
    onError: (e: any) => toast.error(e.message || "Submit failed"),
  });
};

export const useXPosts = () => {
  return useQuery({
    queryKey: ["x", "posts"],
    queryFn: () => xApi.listPosts(),
    staleTime: 15_000,
  });
};
