import { useState, useEffect } from "react";
import { authApi } from "@/api/auth";

export const useUsernameCheck = (username: string, debounceMs: number = 500) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!username || username.trim().length < 3) {
      setIsAvailable(null);
      setMessage("");
      return;
    }

    if (username.length > 30) {
      setIsAvailable(false);
      setMessage("Username must be 30 characters or less");
      return;
    }

    setIsChecking(true);
    const timeoutId = setTimeout(async () => {
      try {
        const result = await authApi.checkUsername(username.trim());
        setIsAvailable(result.available);
        setMessage(result.message);
      } catch (error: any) {
        setIsAvailable(false);
        setMessage(error.message || "Failed to check username");
      } finally {
        setIsChecking(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [username, debounceMs]);

  return { isChecking, isAvailable, message };
};

