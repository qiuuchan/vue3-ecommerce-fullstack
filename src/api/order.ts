import { getData, putData, postData } from '@/api/request';
import type { OrderRecord, OrderQuery, OrderStatus, CreateOrderPayload, UserOrder } from '@/types/order';

export type { OrderStatus } from '@/types/order';

export const fetchOrderList = (params?: OrderQuery): Promise<OrderRecord[]> => {
  return getData<OrderRecord[]>('/admin/orders', params);
};

export const fetchOrderDetail = (id: number): Promise<OrderRecord> => {
  return getData<OrderRecord>(`/admin/orders/${id}`);
};

export const updateOrderStatusApi = (id: number, status: OrderStatus): Promise<OrderRecord> => {
  return putData<OrderRecord>(`/admin/orders/${id}/status`, { status });
};

// 用户端订单 API
export const createOrderApi = (payload: CreateOrderPayload): Promise<{ orderId: number; orderNo: string }> => {
  return postData<{ orderId: number; orderNo: string }>('/api/orders', payload);
};

export const fetchUserOrders = (params?: { status?: OrderStatus; page?: number; pageSize?: number }): Promise<UserOrder[]> => {
  return getData<UserOrder[]>('/api/user/orders', params);
};

export const fetchUserOrderDetail = (id: number): Promise<UserOrder> => {
  return getData<UserOrder>(`/api/user/orders/${id}`);
};

export const cancelOrderApi = (id: number): Promise<void> => {
  return putData<void>(`/api/user/orders/${id}/cancel`);
};
