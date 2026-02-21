import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminXApi, AdminXPostItem } from "@/api/adminX";
import { toast } from "sonner";

export const useAdminXReviewList = () => {
  return useQuery({
    queryKey: ["admin", "x", "review"],
    queryFn: () => adminXApi.listReview(),
    staleTime: 10_000,
  });
};

export const useAdminXReviewAction = () => {
  const qc = useQueryClient();
  return useMutation<{ id: string; status: string; points?: number }, any, { id: string; action: "approve" | "reject"; points?: number; reason?: string }>({
    mutationFn: ({ id, action, points, reason }) => adminXApi.reviewAction(id, action, points, reason),
    onSuccess: () => {
      toast.success("Review updated");
      qc.invalidateQueries({ queryKey: ["admin", "x", "review"] });
    },
    onError: (e: any) => toast.error(e.message || "Action failed"),
  });
};
