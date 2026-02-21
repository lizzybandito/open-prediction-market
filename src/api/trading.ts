import { apiClient } from "./client";
import { PlaceOrderRequest, PlaceOutcomeOrderRequest, Order, OrderCalculation, OutcomeOrder } from "@/types/api";

export const tradingApi = {
  placeOrder: async (order: PlaceOrderRequest): Promise<Order> => {
    const response = await apiClient.post<Order>("/trading/orders", order);
    return response.data;
  },

  placeOutcomeOrder: async (order: PlaceOutcomeOrderRequest): Promise<OutcomeOrder> => {
    const response = await apiClient.post<OutcomeOrder>("/trading/orders/outcomes", order);
    return response.data;
  },

  calculateOrder: async (order: Omit<PlaceOrderRequest, "orderType">): Promise<OrderCalculation> => {
    const response = await apiClient.post<OrderCalculation>("/trading/calculate", order);
    return response.data;
  },

  getOrders: async (filters?: { marketId?: string; status?: string }): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>("/trading/orders", filters);
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/trading/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/trading/orders/${id}`);
  },

  getOrderBook: async (marketId: string): Promise<any> => {
    const response = await apiClient.get(`/trading/orderbook/${marketId}`);
    return response.data;
  },

  cashOut: async (params: { marketId: string; shares: number; outcomeLabel?: string; outcomeSide?: "YES" | "NO" }): Promise<any> => {
    const response = await apiClient.post("/trading/cashout", params);
    return response.data;
  },

  calculateCashOut: async (params: { marketId: string; shares: number; outcomeLabel?: string; outcomeSide?: "YES" | "NO" }): Promise<any> => {
    const response = await apiClient.post("/trading/cashout/calculate", params);
    return response.data;
  },
};

