import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
    const { isSignedIn } = useAuth();
    const { data: currentUser, isLoading } = useCurrentUser();

    if (!isSignedIn) {
        return <Navigate to="/auth" replace />;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const userIsAdmin = currentUser && currentUser.role === 'ADMIN';

    if (!userIsAdmin) {
        console.warn("Unauthorized access attempt to /admin by:", currentUser?.id || "unknown");
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
