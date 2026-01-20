import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

// Count-up animation
import CountUp from "react-countup";

export default function VendorAnalytics() {
  const vendor = JSON.parse(localStorage.getItem("vendor"));
  const vendor_id = vendor?.id;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendor_id) {
      toast.error("Vendor not logged in");
      return;
    }

    API.get(`/orders/vendor/${vendor_id}`)
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [vendor_id]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 animate-pulse">
        Loading analytics...
      </div>
    );

  return (
    <div className="space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-wide">
          Analytics Overview
        </h1>
        <p className="text-gray-500">Track performance, orders & revenue</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Orders" value={stats.totalOrders} icon="📦" />
        <KpiCard title="Completed Orders" value={stats.completed} icon="✔️" />
        <KpiCard title="Pending Orders" value={stats.pending} icon="⏳" />
        <KpiCard title="Total Revenue" value={stats.revenue} prefix="₹" icon="💰" />
      </div>

      {/* MONTHLY REVENUE CHART */}
      <ChartCard title="Monthly Revenue">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.monthlyRevenue || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="month" className="text-gray-600 text-sm" />
            <YAxis className="text-gray-600 text-sm" />
            <Tooltip contentStyle={{ borderRadius: "10px" }} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* DAILY REVENUE CHART */}
      <ChartCard title="Daily Revenue">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.dailyRevenue || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="day" className="text-gray-600 text-sm" />
            <YAxis className="text-gray-600 text-sm" />
            <Tooltip contentStyle={{ borderRadius: "10px" }} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* WEEKLY REVENUE CHART */}
      <ChartCard title="Weekly Revenue">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.weeklyRevenue || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="week" className="text-gray-600 text-sm" />
            <YAxis className="text-gray-600 text-sm" />
            <Tooltip contentStyle={{ borderRadius: "10px" }} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* TOP SELLING PRODUCTS CHART */}
      <ChartCard title="Top Selling Products">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.topProducts || []}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="name" className="text-gray-600 text-sm" />
            <YAxis className="text-gray-600 text-sm" />
            <Tooltip contentStyle={{ borderRadius: "10px" }} />
            <Bar dataKey="sold" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}


/* ---------------------- KPI CARD ---------------------- */
function KpiCard({ title, value, prefix = "", icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition transform hover:scale-[1.02] cursor-pointer">

      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-2xl mb-4">
        {icon}
      </div>

      {/* Title */}
      <p className="text-gray-500 text-sm font-medium">{title}</p>

      {/* Animated Value */}
      <h2 className="text-3xl font-bold text-gray-900 mt-1">
        <CountUp end={Number(value || 0)} duration={1.5} prefix={prefix} separator="," />
      </h2>
    </div>
  );
}


/* ---------------------- GENERIC CHART CARD ---------------------- */
function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="h-72">{children}</div>
    </div>
  );
}
