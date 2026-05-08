import { getData } from '@/api/request';

export interface DashboardSummary {
  newProductsToday: number;
  productsOnSale: number;
  inventoryWarnings: number;
  todayOrders: number;
  todaySales: number;
}

export interface DashboardTrendItem {
  date: string;
  sales: number;
  orders: number;
}

export interface DashboardCategoryShare {
  name: string;
  value: number;
}

export interface DashboardHotProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

export interface DashboardTodo {
  id: number;
  title: string;
  level: 'high' | 'medium' | 'low';
  count: number;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  trends: DashboardTrendItem[];
  categoryShares: DashboardCategoryShare[];
  hotProducts: DashboardHotProduct[];
  todos: DashboardTodo[];
}

export const fetchDashboardOverview = (): Promise<DashboardOverview> => {
  return getData<DashboardOverview>('/admin/dashboard/overview');
};
