import { ReactNode } from 'react';
import Link from 'next/link';
import Price from '@/components/atoms/Price';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  label: string;
  subLabel: string;
  children: ReactNode;
}

function StatCard({ icon, iconBgClass, iconColorClass, label, subLabel, children }: StatCardProps) {
  return (
    <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm gap-0 ring-0 py-5 px-5 hover:border-purple-300 transition-all">
      <CardContent className="px-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-grow min-w-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {label}
            </span>
            <div className="flex flex-col">
              {children}
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{subLabel}</span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgClass}`}>
            <i className={`${icon} text-[16px] ${iconColorClass}`}></i>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface DashboardStatsProps {
  productsCount?: number;
  ordersCount?: number;
  revenue?: number;
  blogsCount?: number;
}

export default function DashboardStats({
  productsCount = 0,
  ordersCount = 0,
  revenue = 0,
  blogsCount = 0,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Revenue Card */}
      <StatCard
        icon="fa-solid fa-coins"
        iconBgClass="bg-teal-50"
        iconColorClass="text-teal-500"
        label="Total Sales Revenue"
        subLabel="From completed orders"
      >
        <Price amount={revenue} className="text-2xl text-teal-600 font-extrabold" />
      </StatCard>

      {/* Orders Card */}
      <StatCard
        icon="fa-solid fa-box"
        iconBgClass="bg-amber-50"
        iconColorClass="text-amber-500"
        label="Total Orders"
        subLabel="Orders received by the shop"
      >
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {ordersCount}
        </span>
      </StatCard>

      {/* Products Card */}
      <StatCard
        icon="fa-solid fa-bone"
        iconBgClass="bg-purple-50"
        iconColorClass="text-purple-500"
        label="Active Catalog"
        subLabel="Items in the database"
      >
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {productsCount}
        </span>
      </StatCard>

      {/* Blog Articles Card */}
      <Link href="/admin/blogs">
        <StatCard
          icon="fa-solid fa-newspaper"
          iconBgClass="bg-indigo-50"
          iconColorClass="text-indigo-500"
          label="Blog Articles"
          subLabel="Click to manage care guides"
        >
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-between">
            {blogsCount}
            <i className="fa-solid fa-arrow-right text-xs text-indigo-500" />
          </span>
        </StatCard>
      </Link>
    </div>
  );
}

