'use client';

import { useState, type ChangeEvent } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import DashboardStats from '@/components/organisms/DashboardStats';
import DashboardCharts from '@/components/organisms/DashboardCharts';
import RecentOrders from '@/components/organisms/RecentOrders';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import { productsService } from '@/services/products.service';
import { ordersService } from '@/services/orders.service';
import { blogsService } from '@/services/blogs.service';

const PERIOD_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: '3months', label: '3 Months' },
  { value: '6months', label: '6 Months' },
  { value: '1year', label: '1 Year' },
];

function getFilteredOrders(orders: any[], period: string): any[] {
  if (period === 'all') return orders;

  const now = new Date();
  const orderDate = (createdAt: string) => new Date(createdAt);

  switch (period) {
    case 'today': {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return orders.filter((o) => orderDate(o.createdAt) >= startOfToday);
    }
    case 'week': {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      return orders.filter((o) => orderDate(o.createdAt) >= startOfWeek);
    }
    case 'month': {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      return orders.filter((o) => orderDate(o.createdAt) >= startOfMonth);
    }
    case '3months': {
      const startOf3Months = new Date();
      startOf3Months.setMonth(now.getMonth() - 3);
      startOf3Months.setHours(0, 0, 0, 0);
      return orders.filter((o) => orderDate(o.createdAt) >= startOf3Months);
    }
    case '6months': {
      const startOf6Months = new Date();
      startOf6Months.setMonth(now.getMonth() - 6);
      startOf6Months.setHours(0, 0, 0, 0);
      return orders.filter((o) => orderDate(o.createdAt) >= startOf6Months);
    }
    case '1year': {
      const startOf1Year = new Date();
      startOf1Year.setFullYear(now.getFullYear() - 1);
      startOf1Year.setHours(0, 0, 0, 0);
      return orders.filter((o) => orderDate(o.createdAt) >= startOf1Year);
    }
    default:
      return orders;
  }
}

import { useQuery } from '@tanstack/react-query';

export default function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard-data'],
    queryFn: async () => {
      const [productsRes, ordersRes, blogsRes] = await Promise.all([
        productsService.getAll({ all: true }),
        ordersService.getAll(),
        blogsService.getAll(),
      ]);

      const productsData = (productsRes.success && productsRes.data) ? productsRes.data : [];
      const allOrders = (ordersRes.success && ordersRes.data) ? ordersRes.data : [];
      const allBlogs = (blogsRes.success && blogsRes.data) ? blogsRes.data : [];

      return {
        productsCount: productsData.length,
        ordersData: allOrders,
        blogsCount: allBlogs.length,
      };
    },
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });

  const loading = dashboardQuery.isLoading;
  const error = dashboardQuery.error ? (dashboardQuery.error.message || 'Failed to load dashboard data.') : null;
  const data = dashboardQuery.data || { productsCount: 0, ordersData: [], blogsCount: 0 };
  const productsCount = data.productsCount;
  const ordersData = data.ordersData;
  const blogsCount = data.blogsCount;

  const filteredOrders = getFilteredOrders(ordersData, selectedPeriod);

  const stats = {
    products: productsCount,
    orders: filteredOrders.length,
    revenue: filteredOrders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0),
    blogs: blogsCount,
  };

  const recentOrders = [...filteredOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* Header & Period Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Welcome back, Administrator. Here is a quick snapshot of your store.
              </p>
            </div>
            
            <div className="relative flex-shrink-0 self-start md:self-auto min-w-[210px] sm:min-w-[230px]">
              <i className="fa-solid fa-calendar absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-teal-500 text-[15px] sm:text-base pointer-events-none"></i>
              <select
                value={selectedPeriod}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedPeriod(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 sm:py-4 text-xs sm:text-base font-extrabold text-slate-800 bg-white border border-slate-300 rounded-2xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 cursor-pointer shadow-md hover:border-teal-500 hover:shadow-lg transition-all appearance-none"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="font-semibold text-slate-800 text-xs sm:text-sm">
                    {opt.label}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm pointer-events-none"></i>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold tracking-wide">Loading dashboard...</span>
            </div>
          ) : error ? (
            <ErrorState onRetry={() => dashboardQuery.refetch()} description={error} />
          ) : (
            <>
              {/* Stats Cards */}
              <DashboardStats
                productsCount={stats.products}
                ordersCount={stats.orders}
                revenue={stats.revenue}
                blogsCount={stats.blogs}
              />

              {/* Charts */}
              <DashboardCharts orders={filteredOrders} period={selectedPeriod} />

              {/* Recent Orders */}
              <RecentOrders orders={recentOrders} />
            </>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
