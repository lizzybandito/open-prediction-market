import { apiClient } from "./client";

export interface XChallenge {
  challenge: string;
  nonce: string;
  expiresAt: string;
}

export interface XVerifyComplete {
  xUserId: string;
  handle: string;
}

export interface XSubmitResult {
  postId: string;
  status: string;
  points: number;
}

export interface XPostItem {
  id: string;
  userId: string;
  xUserId: string;
  tweetId: string;
  url: string;
  textHash: string;
  createdAt: string;
  tweetCreatedAt?: string;
  status: string;
  reason?: string;
  seasonId?: string;
}

export const xApi = {
  startVerify: async (walletAddress: string, seasonId: string = "current"): Promise<XChallenge> => {
    const res = await apiClient.post<{ challenge: string; nonce: string; expiresAt: string }>("/x/verify/start", { walletAddress, seasonId });
    return res.data;
  },

  completeVerify: async (tweetUrl: string, challenge: string, walletAddress: string): Promise<XVerifyComplete> => {
    const res = await apiClient.post<XVerifyComplete>("/x/verify/complete", { tweetUrl, challenge, walletAddress });
    return res.data;
  },

  submitTweet: async (tweetUrl: string, seasonId?: string): Promise<XSubmitResult> => {
    const res = await apiClient.post<XSubmitResult>("/x/submit", { tweetUrl, seasonId });
    return res.data;
  },

  listPosts: async (): Promise<XPostItem[]> => {
    const res = await apiClient.get<XPostItem[]>("/x/posts");
    return res.data;
  },
};
