import { useEffect, useState } from "react";
import API from "../../utils/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function VendorOrders() {
  const vendor = JSON.parse(localStorage.getItem("vendor"));
  const vendor_id = vendor?.id;

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get(`/orders/vendor/${vendor_id}`)
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => alert("Failed to load orders"));
  }, [vendor_id]);

  const statusColors = {
    pending: "bg-yellow-200 text-yellow-800",
    processing: "bg-blue-200 text-blue-800",
    shipped: "bg-purple-200 text-purple-800",
    delivered: "bg-green-200 text-green-800",
    cancelled: "bg-red-200 text-red-800",
  };

  const statusEmoji = {
    pending: "🕑",
    processing: "⚙️",
    shipped: "🚚",
    delivered: "📦",
    cancelled: "❌",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Vendor Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No orders found</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </p>

                <p className="mt-2 font-medium">
                  Items: {order.order_items?.length}
                </p>

                <p className="font-bold mt-1 text-blue-600">
                  ₹{order.total_price}
                </p>
              </div>

              {/* STATUS */}
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}
                >
                  {statusEmoji[order.status]} {order.status.toUpperCase()}
                </span>

                <Link
                  to={`/vendor/orders/${order.id}`}
                  className="block mt-3 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  View / Update ➜
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
