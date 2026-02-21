import { apiClient } from "./client";

export interface AdminXPostItem {
  id: string;
  userId: string;
  xUserId: string;
  tweetId: string;
  url: string;
  status: string;
  reason?: string;
  createdAt: string;
}

export const adminXApi = {
  listReview: async (): Promise<AdminXPostItem[]> => {
    const res = await apiClient.get<AdminXPostItem[]>("/admin/x/review");
    return res.data;
  },
  reviewAction: async (id: string, action: "approve" | "reject", points?: number, reason?: string): Promise<{ id: string; status: string; points?: number; }> => {
    const body: any = { action };
    if (typeof points === "number") body.points = points;
    if (reason) body.reason = reason;
    const res = await apiClient.post<{ id: string; status: string; points?: number }>(`/admin/x/review/${id}`, body);
    return res.data;
  },
};
