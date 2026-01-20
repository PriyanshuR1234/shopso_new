import React, { useEffect, useState } from "react";
import API from "@/utils/api";


export default function UserOrders() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    window.location.href = "/user/login";
    return null;
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get(`/orders/user/${user.id}`);
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <p className="text-gray-600">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded-xl shadow-sm">
              <div className="flex justify-between">
                <p className="font-semibold">Order ID: {order.id}</p>
                <p className="text-sky-600">{order.status}</p>
              </div>

              <div className="mt-2">
                <p className="text-gray-600">Items:</p>
                <ul className="ml-3 list-disc text-gray-700">
                  {order.items?.map((item) => (
                    <li key={item.id}>
                      {item.title} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-3 font-semibold">Total: ₹{order.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
