export interface DashboardKPIsDTO {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingAppraisalsCount: number;
  totalCommissionsPaid: number;
  activeAffiliatesCount: number;
  recentOrders: any[];
  recentCustomers: any[];
}

export interface SalesAnalyticsDTO {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  dailyBreakdown: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}
