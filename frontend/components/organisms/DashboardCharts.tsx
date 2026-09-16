'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface OrderItem {
  id: string;
  total?: number;
  status: string;
  createdAt: string;
}

// Build hourly revenue for today
function buildTodayRevenue(orders: OrderItem[]) {
  const slots = [
    { label: '12 AM', start: 0, end: 3 },
    { label: '3 AM', start: 3, end: 6 },
    { label: '6 AM', start: 6, end: 9 },
    { label: '9 AM', start: 9, end: 12 },
    { label: '12 PM', start: 12, end: 15 },
    { label: '3 PM', start: 15, end: 18 },
    { label: '6 PM', start: 18, end: 21 },
    { label: '9 PM', start: 21, end: 24 },
  ];
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  return slots.map((slot) => {
    const revenue = orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        const oHour = od.getHours();
        return od >= startOfToday && oHour >= slot.start && oHour < slot.end && o.status === 'completed';
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);
    return { label: slot.label, revenue: Math.round(revenue) };
  });
}

// Build daily revenue for this week
function buildWeeklyRevenue(orders: OrderItem[]) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const endOfDay = new Date(d);
    endOfDay.setHours(23, 59, 59, 999);

    const dayLabel = daysOfWeek[d.getDay()];
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;

    const revenue = orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return od >= d && od <= endOfDay && o.status === 'completed';
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    result.push({ label: `${dayLabel} ${dateStr}`, revenue: Math.round(revenue) });
  }
  return result;
}

// Build daily revenue for this month (from the 1st to today)
function buildMonthlyDailyRevenue(orders: OrderItem[]) {
  const now = new Date();
  const result = [];
  const totalDays = now.getDate(); // 1 to current date

  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), i);
    d.setHours(0, 0, 0, 0);
    const endOfDay = new Date(d);
    endOfDay.setHours(23, 59, 59, 999);

    const dateStr = `${d.getMonth() + 1}/${i}`;
    const revenue = orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return od >= d && od <= endOfDay && o.status === 'completed';
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    result.push({ label: dateStr, revenue: Math.round(revenue) });
  }
  return result;
}

// Build monthly revenue data from real orders
function buildMonthlyRevenue(orders: OrderItem[], monthsCount = 6) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const result = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIdx = d.getMonth();
    const year = d.getFullYear();
    const revenue = orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return od.getMonth() === monthIdx && od.getFullYear() === year && o.status === 'completed';
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);
    result.push({ label: months[monthIdx], revenue: Math.round(revenue) });
  }
  return result;
}

function buildChartData(orders: OrderItem[], period: string) {
  switch (period) {
    case 'today':
      return buildTodayRevenue(orders);
    case 'week':
      return buildWeeklyRevenue(orders);
    case 'month':
      return buildMonthlyDailyRevenue(orders);
    case '3months':
      return buildMonthlyRevenue(orders, 3);
    case '6months':
      return buildMonthlyRevenue(orders, 6);
    case '1year':
      return buildMonthlyRevenue(orders, 12);
    case 'all':
    default:
      return buildMonthlyRevenue(orders, 6);
  }
}

// Build order status distribution
function buildStatusData(orders: OrderItem[]) {
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name: capitalize(name), value }));
}

function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#F59E0B',
  Confirmed: '#3B82F6',
  Processing: '#8B5CF6',
  Shipped: '#06B6D4',
  Completed: '#10B981',
  Cancelled: '#EF4444',
};

const DEFAULT_COLOR = '#94A3B8';

// Custom tooltip for bar chart
function RevenueTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-xs">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        <p className="text-teal-600 font-extrabold">
          AED {payload[0].value.toLocaleString('en-AE')}
        </p>
      </div>
    );
  }
  return null;
}

// Custom tooltip for pie chart
function StatusTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-xs">
        <p className="font-bold text-slate-700">{payload[0].name}</p>
        <p className="text-slate-500 font-semibold">{payload[0].value} order{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
}

const REVENUE_SUBTITLES: Record<string, string> = {
  today: 'Completed orders revenue — today',
  week: 'Completed orders revenue — this week',
  month: 'Completed orders revenue — this month',
  '3months': 'Completed orders revenue — last 3 months',
  '6months': 'Completed orders revenue — last 6 months',
  '1year': 'Completed orders revenue — last year',
  all: 'Completed orders revenue — all time',
};

const STATUS_SUBTITLES: Record<string, string> = {
  today: 'Distribution of orders today',
  week: 'Distribution of orders this week',
  month: 'Distribution of orders this month',
  '3months': 'Distribution of orders last 3 months',
  '6months': 'Distribution of orders last 6 months',
  '1year': 'Distribution of orders last year',
  all: 'Distribution of all orders',
};

export interface DashboardChartsProps {
  orders?: OrderItem[];
  period?: string;
}

export default function DashboardCharts({ orders = [], period = 'all' }: DashboardChartsProps) {
  const chartData = buildChartData(orders, period);
  const statusData = buildStatusData(orders);
  const hasOrders = orders.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Revenue Bar Chart — takes up 3/5 columns */}
      <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Revenue Overview</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{REVENUE_SUBTITLES[period] || REVENUE_SUBTITLES.all}</p>
          </div>
          <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-chart-line text-teal-500 text-[14px]"></i>
          </div>
        </div>

        {!hasOrders ? (
          <div className="h-52 flex flex-col items-center justify-center text-slate-400">
            <i className="fa-solid fa-chart-line text-3xl mb-2 text-slate-200"></i>
            <p className="text-xs font-semibold">No order data yet</p>
            <p className="text-[10px] text-slate-300 mt-1">Charts will populate as orders come in</p>
          </div>
        ) : (
          <div className="h-52 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20B2A4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#20B2A4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#20B2A4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Order Status Pie Chart — takes up 2/5 columns */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Order Status</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{STATUS_SUBTITLES[period] || STATUS_SUBTITLES.all}</p>
          </div>
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-chart-pie text-purple-500 text-[14px]"></i>
          </div>
        </div>

        {!hasOrders || statusData.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-slate-400">
            <i className="fa-solid fa-chart-pie text-3xl mb-2 text-slate-200"></i>
            <p className="text-xs font-semibold">No orders yet</p>
            <p className="text-[10px] text-slate-300 mt-1">Status breakdown appears here</p>
          </div>
        ) : (
          <div className="h-52 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius="40%"
                  outerRadius="65%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || DEFAULT_COLOR}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<StatusTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
