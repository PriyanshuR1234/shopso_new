import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import supabase from "../../utils/supabaseClient";
import PendingVendorModal from "../../components/PendingVendorModal";

export default function VendorOrders() {
  const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");
  const vendor_id = vendor?.id;
  const vendor_status = vendor?.status;

  const [orders, setOrders] = useState([]);

  if (vendor_status !== "approved") return <PendingVendorModal />;

  useEffect(() => {
    loadOrders();
  }, [vendor_id]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(name, price, image_url:product_images(image_url)))")
      .eq("vendor_id", vendor_id)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
  };

  const statusColors = {
    pending: "bg-yellow-200 text-yellow-800",
    processing: "bg-blue-200 text-blue-800",
    shipped: "bg-purple-200 text-purple-800",
    delivered: "bg-green-200 text-green-800",
    completed: "bg-green-300 text-green-900",
    cancelled: "bg-red-200 text-red-800",
  };

  const statusEmoji = {
    pending: "🕑",
    processing: "⚙️",
    shipped: "🚚",
    delivered: "📦",
    completed: "✅",
    cancelled: "❌",
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-2xl text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Vendor Orders</h1>
          <p className="opacity-90 mt-2">Manage and track your customer orders</p>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 text-lg">No orders found yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/60 shadow-sm hover:shadow-indigo-100/50 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold text-gray-800">
                    Order #{order.id.slice(0, 8)}
                  </h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                    {order.id}
                  </span>
                </div>

                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span>📅 {new Date(order.created_at).toLocaleDateString()}</span>
                  <span>⏰ {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>

                <div className="mt-4 flex gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Items</p>
                    <p className="font-medium text-gray-700">{order.order_items?.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
                    <p className="font-bold text-indigo-600 text-lg">₹{order.total_price}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-white/20 ${statusColors[order.status]}`}
                >
                  {statusEmoji[order.status]} {order.status.toUpperCase()}
                </span>

                <Link
                  to={`/vendor/orders/${order.id}`}
                  className="w-full md:w-auto text-center mt-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
