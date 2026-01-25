import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import StatCard from "./StatCard";

export default function AdminAnalytics({ analytics }) {
    if (!analytics) return <div className="p-10 text-center">Crunching data...</div>;

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

    const orderDistribution = [
        { name: "Completed", value: analytics.completed || 0 },
        { name: "Pending", value: analytics.pending || 0 },
        { name: "Refund Queue", value: analytics.refundQueue || 0 },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 border-b-2 border-gray-100 pb-3">Platform Performance</h2>

            {/* Primary Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-xs uppercase font-black tracking-widest opacity-60">Global GMV</p>
                    <p className="text-4xl font-black mt-4">₹{analytics.platformRevenue?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-xs uppercase font-black tracking-widest opacity-60">Admin Commission</p>
                    <p className="text-4xl font-black mt-4">₹{analytics.commissionRevenue?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-xs uppercase font-black tracking-widest opacity-60">Transaction Volume</p>
                    <p className="text-4xl font-black mt-4">{analytics.totalOrders || 0} <span className="text-sm font-normal opacity-70 italic">orders</span></p>
                </div>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Vendors" value={analytics.vendorCount} color="blue" />
                <StatCard title="Approved" value={analytics.approvedVendors} color="green" />
                <StatCard title="Pending V." value={analytics.pendingVendors} color="yellow" />
                <StatCard title="Banned V." value={analytics.bannedVendors} color="red" />
            </div>

            {/* Visualizations Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Vendors Bar Chart */}
                <div className="bg-gray-50 border-2 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                        Vendor Leaderboard (Revenue)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.topVendors || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="vendorName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Distribution Pie Chart */}
                <div className="bg-gray-50 border-2 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        Fulfillment Health
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {orderDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
