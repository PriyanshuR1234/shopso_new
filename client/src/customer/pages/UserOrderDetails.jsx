import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import toast from "react-hot-toast";

export default function UserOrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [returnDays, setReturnDays] = useState(7); // Default fallback

    useEffect(() => {
        loadData();
    }, [orderId]);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchOrderDetails(), fetchReturnPolicy()]);
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

    const fetchOrderDetails = async () => {
        try {
            const { data, error } = await supabase
                .from("orders")
                .select(`
            *,
            items:order_items(
                *,
                product:products(
                    id,
                    name,
                    description,
                    product_images(image_url)
                )
            )
        `)
                .eq("id", orderId)
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (err) {
            console.error("Fetch error", err);
            toast.error("Could not load order details");
        }
    };

    const cancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;

        try {
            const { error } = await supabase
                .from("orders")
                .update({ status: "cancelled" })
                .eq("id", orderId);

            if (error) throw error;

            for (const item of order.items) {
                await supabase.rpc('increment_stock', {
                    row_id: item.product_id,
                    quantity: item.quantity
                });
            }

            toast.success("Order Cancelled Successfully");
            fetchOrderDetails();
        } catch (err) {
            console.error("Cancel error", err);
            toast.error("Failed to cancel order");
        }
    };

    const canRefund = (orderDate) => {
        const placed = new Date(orderDate);
        const now = new Date();
        const diffTime = Math.abs(now - placed);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= returnDays;
    };

    const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];
    const currentStep = STATUS_STEPS.indexOf(order?.status) >= 0 ? STATUS_STEPS.indexOf(order?.status) : (order?.status === 'completed' ? 3 : -1);
    const isCancelled = order?.status === 'cancelled';
    const isDelivered = order?.status === 'delivered' || order?.status === 'completed';

    // Return Logic (Includes 'completed' as a valid status for starting a return)
    const isReturnable = (order?.status === 'delivered' || order?.status === 'completed') && canRefund(order?.created_at) && !order?.status.includes("refund");
    const isWindowClosed = (order?.status === 'delivered' || order?.status === 'completed') && !canRefund(order?.created_at) && !order?.status.includes("refund");

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "processing": return "bg-blue-100 text-blue-800";
            case "shipped": return "bg-purple-100 text-purple-800";
            case "delivered": return "bg-green-100 text-green-800";
            case "completed": return "bg-green-600 text-white";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <button onClick={() => navigate("/orders")} className="text-gray-500 hover:text-gray-800 text-sm mb-2 font-bold uppercase tracking-tight flex items-center gap-1">
                            <span className="text-lg">←</span> Back to Orders
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase">Order Details</h1>
                        <p className="font-mono text-xs text-blue-600 mt-1">ID: {order.id}</p>
                    </div>

                    <div className="flex gap-3">
                        {isReturnable && (
                            <button
                                className="bg-sky-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-sky-700 transition uppercase tracking-tight shadow-lg shadow-sky-100"
                                onClick={() => window.location.href = `/active-order/${order.id}?action=refund`}
                            >
                                Return Order
                            </button>
                        )}
                        {!isCancelled && order.status === 'pending' && (
                            <button
                                onClick={cancelOrder}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border-2 border-red-100 hover:bg-red-100 text-xs font-black transition uppercase"
                            >
                                Cancel Order
                            </button>
                        )}
                        {isCancelled && (
                            <span className="bg-red-100 text-red-800 px-4 py-2 rounded-xl font-black border-2 border-red-200 text-xs uppercase">
                                CANCELLED
                            </span>
                        )}
                    </div>
                </div>

                {/* Status Tracker */}
                {!isCancelled && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-x-auto relative overflow-hidden">
                        {isDelivered && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-black text-green-600 uppercase italic">
                                <span>✓ Finalized</span>
                            </div>
                        )}
                        <div className="flex min-w-[500px] justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -z-0 -translate-y-1/2 rounded-full"></div>
                            <div
                                className="absolute top-1/2 left-0 h-1.5 bg-sky-600 -z-0 -translate-y-1/2 transition-all duration-700 rounded-full"
                                style={{ width: `${(Math.max(0, currentStep) / (STATUS_STEPS.length - 1)) * 100}%` }}
                            ></div>

                            {STATUS_STEPS.map((step, index) => {
                                const isActive = index <= currentStep;
                                const isComing = index > currentStep;
                                return (
                                    <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300
                                            ${isActive ? 'bg-sky-600 border-sky-100 text-white scale-110 shadow-lg' : 'bg-white border-gray-100 text-gray-300'}
                                        `}>
                                            {isActive ? '✓' : index + 1}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-sky-600' : 'text-gray-300'}`}>
                                            {step}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tight">Order Items</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-6 p-6 border-b last:border-0 hover:bg-gray-50 transition">
                                    <img
                                        src={item.product?.product_images?.[0]?.image_url || "/placeholder.jpg"}
                                        className="w-24 h-24 bg-gray-100 rounded-2xl object-cover border"
                                        alt={item.product?.name}
                                    />
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="font-bold text-gray-900 text-lg">{item.product?.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1 italic">{item.product?.description}</p>
                                        <div className="mt-3 flex justify-between items-center">
                                            <p className="text-xs font-bold text-gray-400">QTY: {item.quantity}</p>
                                            <p className="text-xl font-black text-gray-900">₹{item.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest border-b pb-2">Delivery Address</h3>
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                {order.address}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest border-b pb-2">Summary</h3>
                            <div className="space-y-3 text-sm font-bold text-gray-500 border-b pb-4 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900">₹{order.total_price}</span>
                                </div>
                                <div className="flex justify-between text-green-600 italic">
                                    <span>Shipping Fee</span>
                                    <span>FREE</span>
                                </div>
                            </div>
                            <div className="flex justify-between font-black text-2xl text-gray-900">
                                <span className="uppercase text-sm mt-2">Paid Total</span>
                                <span>₹{order.total_price}</span>
                            </div>

                            {isWindowClosed && (
                                <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                                    <p className="text-[10px] font-black text-red-500 uppercase italic">Return Window Expired</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
