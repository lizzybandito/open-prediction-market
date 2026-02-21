import { ApiError, ApiResponse } from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10);

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  private setAuthToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  private clearAuthToken(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      if (!response.ok) {
        this.clearAuthToken();
        return null;
      }

      const data = await response.json();
      if (data.token) {
        this.setAuthToken(data.token);
        return data.token;
      }

      return null;
    } catch {
      this.clearAuthToken();
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        credentials: 'include',
      });

      // Handle token refresh on 401
      if (response.status === 401 && token) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
            credentials: 'include',
          });
        } else {
          // Refresh failed, redirect to login
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:logout"));
          }
          throw new Error("Authentication failed");
        }
      }

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || "An error occurred",
          code: data.code,
          errors: data.errors,
          retryAt: data.retryAt,
          nextRefreshAt: data.nextRefreshAt,
          meta: data.meta,
        };
        throw error;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === "AbortError") {
        throw {
          message: "Request timeout. Please try again.",
          code: "TIMEOUT",
        } as ApiError;
      }

      if (error && typeof error === "object" && "message" in error) {
        throw error;
      }

      throw {
        message: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // File upload support
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          message: data.message || "Upload failed",
          code: data.code,
        } as ApiError;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw error;
      }
      throw {
        message: "Upload failed. Please try again.",
        code: "UPLOAD_ERROR",
      } as ApiError;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT);

