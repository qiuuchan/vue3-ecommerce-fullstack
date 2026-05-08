// 订单状态
export type OrderStatus = 'pending_payment' | 'pending_shipping' | 'shipped' | 'completed' | 'cancelled';

// 订单商品项（管理端）
export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  count: number;
}

// 管理端订单记录
export interface OrderRecord {
  id: number;
  orderNo: string;
  userName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  payTime?: string;
  address: string;
  phone: string;
  items: OrderItem[];
}

// 管理端订单查询参数
export interface OrderQuery {
  keyword?: string;
  status?: OrderStatus;
}

// 用户端订单商品项
export interface UserOrderItem {
  productId: number;
  name: string;
  cover: string;
  price: number;
  count: number;
}

// 用户端订单
export interface UserOrder {
  id: number;
  orderNo: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  payTime?: string;
  shippedTime?: string;
  completedTime?: string;
  address: Address;
  items: UserOrderItem[];
  remark?: string;
}

// 创建订单 payload
export interface CreateOrderPayload {
  addressId: number;
  items: { productId: number; count: number }[];
  remark?: string;
}

// 收货地址
export interface Address {
  id: number;
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

// 地址表单 payload
export interface AddressPayload {
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault?: boolean;
}
