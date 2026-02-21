import { useState, useEffect } from "react";
import { authApi } from "@/api/auth";

export const useEmailCheck = (email: string, debounceMs: number = 500) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
      setIsAvailable(null);
      setMessage("");
      return;
    }

    setIsChecking(true);
    const timeoutId = setTimeout(async () => {
      try {
        const result = await authApi.checkEmail(email.trim());
        setIsAvailable(result.available);
        setMessage(result.message);
      } catch (error: any) {
        setIsAvailable(false);
        setMessage(error.message || "Failed to check email");
      } finally {
        setIsChecking(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [email, debounceMs]);

  return { isChecking, isAvailable, message };
};

