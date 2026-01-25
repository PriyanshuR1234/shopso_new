import React, { useEffect, useState } from "react";
import supabase from "../../utils/supabaseClient";
import { Link } from "react-router-dom";

export default function UserOrders() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnDays, setReturnDays] = useState(7); // Default fallback

  if (!user) {
    window.location.href = "/user/login";
    return null;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchReturnPolicy(), fetchOrders()]);
    setLoading(false);
  };

  const fetchReturnPolicy = async () => {
    try {
      const { data } = await supabase
        .from("platform_settings")
        .select("setting_value")
        .eq("setting_key", "return_days_window")
        .single();
      if (data) setReturnDays(data.setting_value.days);
    } catch (err) {
      console.error("Policy fetch error:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      // Fetch orders with items and nested product images
      const { data, error } = await supabase
        .from("orders")
        .select(`
            *,
            items:order_items(
                *,
                product:products(
                    name,
                    product_images(image_url)
                )
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Order fetch error:", err);
    }
  };

  const canRefund = (orderDate) => {
    const placed = new Date(orderDate);
    const now = new Date();
    const diffTime = Math.abs(now - placed);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= returnDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>

        {loading ? (
          <p className="text-gray-500">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <p className="text-xl text-gray-400 mb-4">You haven't placed any orders yet.</p>
            <a href="/" className="text-sky-600 font-semibold hover:underline">Start Shopping</a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              // Get first available image from the first item
              const firstItem = order.items?.[0];
              const firstImage = firstItem?.product?.product_images?.[0]?.image_url || "https://placehold.co/100?text=No+Img";
              const itemCount = order.items?.length || 0;

              // Refined Logic for Return Policy (Includes 'completed' status)
              const isReturnable = (order.status === 'delivered' || order.status === 'completed') && canRefund(order.created_at) && !order.status.includes("refund");
              const isWindowClosed = (order.status === 'delivered' || order.status === 'completed') && !canRefund(order.created_at) && !order.status.includes("refund");

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">

                    {/* Image Preview */}
                    <div className="relative shrink-0">
                      <img
                        src={firstImage}
                        alt="Product"
                        className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                      />
                      {itemCount > 1 && (
                        <span className="absolute -bottom-2 -right-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                          +{itemCount - 1} more
                        </span>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                          <h3 className="font-semibold text-lg text-gray-900 mt-1">
                            {firstItem?.product?.name || "Product"}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500">
                        <p>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex flex-col">
                          <p className="text-lg font-bold text-gray-900">₹{order.total_price}</p>
                          {isWindowClosed && (
                            <span className="text-[10px] text-red-500 font-bold uppercase italic mt-1 font-black">
                              Return Window Closed
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 items-center">
                          {isReturnable && (
                            <button
                              className="bg-sky-600 text-white px-6 py-2 rounded-full text-xs font-black hover:bg-sky-700 transition uppercase tracking-tight shadow-sm"
                              onClick={() => window.location.href = `/active-order/${order.id}?action=refund`}
                            >
                              Return Order
                            </button>
                          )}
                          <Link
                            to={`/active-order/${order.id}`}
                            className="text-sky-600 font-semibold hover:text-sky-700 text-sm flex items-center gap-1"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
