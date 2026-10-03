import { prisma } from '../lib/prisma';
import { DashboardKPIsDTO, SalesAnalyticsDTO } from '../types/report.types';

export class ReportService {
  async getDashboardKPIs(): Promise<DashboardKPIsDTO> {
    const [
      ordersSum,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      pendingAppraisals,
      commissionsPaid,
      activeAffiliates,
      recentOrders,
      recentCustomers,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({
        where: {
          stock: { lte: 5 },
          status: 'ACTIVE',
        },
      }),
      prisma.appraisalRecord.count({ where: { status: 'SUBMITTED' } }),
      prisma.payoutRequest.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.affiliateProfile.count({ where: { status: 'ACTIVE' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalRevenue: Number(ordersSum._sum.totalAmount || 0),
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount: lowStockProducts,
      pendingAppraisalsCount: pendingAppraisals,
      totalCommissionsPaid: Number(commissionsPaid._sum.amount || 0),
      activeAffiliatesCount: activeAffiliates,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || o.user.email,
        total: Number(o.totalAmount),
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
      recentCustomers: recentCustomers.map((c) => ({
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'New Customer',
        email: c.email,
        createdAt: c.createdAt,
      })),
    };
  }

  async getSalesAnalytics(days = 30): Promise<SalesAnalyticsDTO> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const paidOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startDate },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = new Map<string, { sales: number; orders: number }>();

    let totalSales = 0;
    paidOrders.forEach((o) => {
      const dateStr = o.createdAt.toISOString().slice(0, 10);
      const amt = Number(o.totalAmount);
      totalSales += amt;

      const existing = dailyMap.get(dateStr) || { sales: 0, orders: 0 };
      existing.sales += amt;
      existing.orders += 1;
      dailyMap.set(dateStr, existing);
    });

    const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      sales: Number(data.sales.toFixed(2)),
      orders: data.orders,
    }));

    const totalOrdersCount = paidOrders.length;
    const aov = totalOrdersCount > 0 ? Number((totalSales / totalOrdersCount).toFixed(2)) : 0;

    return {
      totalSales: Number(totalSales.toFixed(2)),
      totalOrders: totalOrdersCount,
      averageOrderValue: aov,
      dailyBreakdown,
    };
  }

  async getInventoryReport(): Promise<any> {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        price: true,
        lowStockThreshold: true,
        status: true,
      },
      orderBy: { stock: 'asc' },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku || 'N/A',
      stock: p.stock,
      price: Number(p.price),
      lowStockThreshold: p.lowStockThreshold,
      isLowStock: p.stock <= p.lowStockThreshold,
      status: p.status,
    }));
  }
}

export const reportService = new ReportService();
