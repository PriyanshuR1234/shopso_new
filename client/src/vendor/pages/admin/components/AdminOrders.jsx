import React, { useState, useMemo } from "react";

export default function AdminOrders({ orders, vendors, onMarkRefund, onMarkPayout, onHandleDispute }) {
    const [vendorFilter, setVendorFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredOrders = useMemo(() => {
        let list = [...orders];

        // 1. Vendor Filter
        if (vendorFilter !== "all") {
            list = list.filter(o => o.vendor_id === vendorFilter);
        }

        // 2. Date Filter
        if (startDate) {
            list = list.filter(o => new Date(o.created_at) >= new Date(startDate));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            list = list.filter(o => new Date(o.created_at) <= end);
        }

        // 3. Priority Sort: Refunds first, then most recent
        return list.sort((a, b) => {
            const aIsRefund = (a.status || "").toLowerCase().includes("refund");
            const bIsRefund = (b.status || "").toLowerCase().includes("refund");

            if (aIsRefund && !bIsRefund) return -1;
            if (!aIsRefund && bIsRefund) return 1;

            return new Date(b.created_at) - new Date(a.created_at);
        });
    }, [orders, vendorFilter, startDate, endDate]);

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Platform Orders</h2>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto bg-gray-50 border p-2 rounded-2xl">
                    <div className="flex items-center gap-2 border-r pr-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase leading-none">Shop:</span>
                        <select
                            value={vendorFilter}
                            onChange={(e) => setVendorFilter(e.target.value)}
                            className="bg-transparent font-bold text-[10px] outline-none cursor-pointer uppercase appearance-none"
                        >
                            <option value="all">ALL SHOPS</option>
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.shop_name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 border-r pr-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase leading-none">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-[10px] font-bold outline-none cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase leading-none">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-[10px] font-bold outline-none cursor-pointer hover:text-black transition"
                        />
                    </div>

                    {(startDate || endDate || vendorFilter !== "all") && (
                        <button
                            onClick={() => { setStartDate(""); setEndDate(""); setVendorFilter("all"); }}
                            className="ml-2 bg-white px-3 py-1 rounded-lg shadow-sm border text-[9px] font-black text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        >
                            RESET
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className={`border-2 rounded-xl p-5 transition-all ${order.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:border-gray-200'
                        }`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Order ID</p>
                                <p className="font-mono text-sm">#{String(order.id).slice(0, 8)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Revenue</p>
                                <p className={`font-bold text-lg ${order.status === 'completed' ? 'text-green-700' : 'text-gray-900'}`}>₹{order.total_price}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Vendor</p>
                                <p className="font-medium text-sm truncate">{vendors.find(v => v.id === order.vendor_id)?.shop_name || "Unknown Vendor"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Status</p>
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${order.status === 'completed' ? 'bg-green-600 text-white' :
                                    order.status === 'pending' ? 'bg-orange-400 text-white' : 'bg-blue-600 text-white'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {Array.isArray(order.order_items) && order.order_items.length > 0 && (
                            <div className="mb-4 bg-white/50 p-3 rounded-lg border border-gray-100 italic text-xs">
                                <p className="font-bold text-gray-700 mb-1">Manifest:</p>
                                <ul className="space-y-1">
                                    {order.order_items.map((item) => (
                                        <li key={item.id} className="flex justify-between">
                                            <span>Product SKU: {String(item.id).slice(0, 6)} × {item.quantity}</span>
                                            <span className="font-bold">₹{item.price * item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/50 mt-2">
                            <button
                                className="px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded font-bold text-xs hover:bg-yellow-500 transition shadow-sm"
                                onClick={() => onMarkRefund(order.id, "validated")}
                            >
                                Validate Refund
                            </button>
                            <button
                                className="px-3 py-1.5 bg-gray-800 text-white rounded font-bold text-xs hover:bg-black transition shadow-sm"
                                onClick={() => onMarkRefund(order.id, "declined")}
                            >
                                Decline Fix
                            </button>
                            {order.status !== 'completed' && (
                                <button
                                    className="px-3 py-1.5 bg-green-600 text-white rounded font-bold text-xs hover:bg-green-700 transition shadow-sm"
                                    onClick={() => onMarkPayout(order.id, "paid")}
                                >
                                    Mark as Paid (Final)
                                </button>
                            )}
                            <button
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded font-bold text-xs hover:bg-indigo-700 transition shadow-sm"
                                onClick={() => onHandleDispute(order.id, "resolved")}
                            >
                                Internal Resolve
                            </button>
                        </div>
                    </div>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <p className="text-gray-400 font-medium">No orders found for this criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
