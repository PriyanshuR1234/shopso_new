import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import supabase from "../../utils/supabaseClient";
import PendingVendorModal from "../../components/PendingVendorModal";

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
  const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");

  const vendor_id = vendor?.id;
  const vendor_status = vendor?.status;

  const [stats, setStats] = useState({
    totalOrders: 0,
    completed: 0,
    pending: 0,
    revenue: 0,
    monthlyRevenue: [],
    dailyRevenue: [],
    weeklyRevenue: [],
    topProducts: [],
  });

  const [loading, setLoading] = useState(true);

  // ------------------- BLOCK PENDING VENDORS -------------------
  if (vendor_status !== "approved") {
    return <PendingVendorModal />;
  }

  useEffect(() => {
    if (!vendor_id) {
      toast.error("Vendor not logged in!");
      return;
    }

    loadAnalytics();
  }, [vendor_id]);

  const loadAnalytics = async () => {
    try {
      /* ---------------- KPI SUMMARY ---------------- */
      /* ---------------- KPI SUMMARY (Calculated Locally) ---------------- */
      // Fetch status and price for all orders for this vendor
      const { data: allOrders, error: summaryError } = await supabase
        .from("orders")
        .select("status, total_price")
        .eq("vendor_id", vendor_id);

      if (summaryError) throw summaryError;

      const totalOrders = allOrders.length;
      const completed = allOrders.filter((o) => o.status === "completed" || o.status === "delivered").length;
      const pending = allOrders.filter((o) => o.status === "pending").length;
      const revenue = allOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

      const summary = { total_orders: totalOrders, completed, pending, revenue };


      /* ---------------- MONTHLY ---------------- */
      const { data: monthly } = await supabase.rpc(
        "monthly_revenue_vendor",
        { vendor_input: vendor_id }
      );

      /* ---------------- DAILY ---------------- */
      const { data: daily } = await supabase.rpc(
        "daily_revenue_vendor",
        { vendor_input: vendor_id }
      );

      /* ---------------- WEEKLY ---------------- */
      const { data: weekly } = await supabase.rpc(
        "weekly_revenue_vendor",
        { vendor_input: vendor_id }
      );

      /* ---------------- TOP PRODUCTS ---------------- */
      const { data: top } = await supabase.rpc(
        "top_products_vendor",
        { vendor_input: vendor_id }
      );

      setStats({
        totalOrders: summary?.total_orders || 0,
        completed: summary?.completed || 0,
        pending: summary?.pending || 0,
        revenue: summary?.revenue || 0,
        monthlyRevenue: monthly || [],
        dailyRevenue: daily || [],
        weeklyRevenue: weekly || [],
        topProducts: top || [],
      });
    } catch (error) {
      toast.error("Failed to load analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 text-lg">
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
          <LineChart data={stats.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* DAILY REVENUE CHART */}
      <ChartCard title="Daily Revenue">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.dailyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* WEEKLY REVENUE CHART */}
      <ChartCard title="Weekly Revenue">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.weeklyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* TOP SELLING PRODUCTS */}
      <ChartCard title="Top Selling Products">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
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
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer">
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-2xl mb-3">
        {icon}
      </div>

      <p className="text-gray-500 text-sm font-medium">{title}</p>

      <h2 className="text-3xl font-bold text-gray-900 mt-1">
        <CountUp end={Number(value || 0)} duration={1.5} prefix={prefix} separator="," />
      </h2>
    </div>
  );
}

/* ---------------------- GENERIC CHART CARD ---------------------- */
function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="h-72">{children}</div>
    </div>
  );
}
