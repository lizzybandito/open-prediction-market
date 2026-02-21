import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    // Check localStorage for existing auth token
    const token = localStorage.getItem("authToken");
    const isSignedInState = localStorage.getItem("isSignedIn");
    return !!token && isSignedInState === "true";
  });

  // Listen for auth logout events
  useEffect(() => {
    const handleLogout = () => {
      setIsSignedIn(false);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("isSignedIn");
      // Clear query cache if available
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:clearcache"));
      }
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  // Check token validity on mount and when it changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const isSignedInState = localStorage.getItem("isSignedIn");
      setIsSignedIn(!!token && isSignedInState === "true");
    };

    checkAuth();

    // Listen for storage changes (when token is added from another tab/window)
    window.addEventListener("storage", checkAuth);

    // Also listen for custom auth events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth:signin", handleAuthChange);
    window.addEventListener("auth:signout", handleAuthChange);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth:signin", handleAuthChange);
      window.removeEventListener("auth:signout", handleAuthChange);
    };
  }, []);

  const signIn = () => {
    setIsSignedIn(true);
    localStorage.setItem("isSignedIn", "true");
  };

  const signOut = () => {
    setIsSignedIn(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isSignedIn");
    // Trigger cache clear event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:clearcache"));
    }
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

