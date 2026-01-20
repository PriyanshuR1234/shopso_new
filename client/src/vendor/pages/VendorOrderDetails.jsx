import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

export default function VendorOrderDetails() {
    const { order_id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [productDetails, setProductDetails] = useState({});
    const [loading, setLoading] = useState(true);

    const dragRef = useRef(null);
    const [dragX, setDragX] = useState(0);

    /* --------------------------------------------
        STATUS STEPS (Clickable + Reversible)
    -------------------------------------------- */
    const STATUS_STEPS = [
        { key: "pending", label: "Pending", icon: "🕒" },
        { key: "processing", label: "Processing", icon: "⚙️" },
        { key: "shipped", label: "Shipped", icon: "🚚" },
        { key: "delivered", label: "Delivered", icon: "📦" },
        { key: "completed", label: "Completed", icon: "✅" },
    ];

    /* --------------------------------------------
        LOAD ORDER DETAILS
    -------------------------------------------- */
    useEffect(() => {
        if (!order_id) return;

        API.get(`/orders/vendor-order/${order_id}`)
            .then(async (res) => {
                setOrder(res.data);

                // Fetch product details
                const details = {};
                for (const item of res.data.order_items) {
                    const p = await API.get(`/products/${item.product_id}`);
                    details[item.product_id] = p.data;
                }
                setProductDetails(details);
            })
            .catch(() => toast.error("Failed to load order"))
            .finally(() => setLoading(false));
    }, [order_id]);

    /* --------------------------------------------
        UPDATE STATUS API CALL
    -------------------------------------------- */
    const updateStatus = async (newStatus) => {
        try {
            await API.put(`/orders/status/${order.id}`, { status: newStatus });

            setOrder((prev) => ({ ...prev, status: newStatus }));

            toast.success(`Status updated → ${newStatus.toUpperCase()}`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    /* --------------------------------------------
        CLICKING STATUS ICON TO CHANGE STATE
    -------------------------------------------- */
    const handleStatusClick = (targetStatus) => {
        updateStatus(targetStatus);
    };

    /* --------------------------------------------
        DRAG LOGIC
    -------------------------------------------- */
    const handleMouseMove = (e) => {
        if (!dragRef.current?.isDragging) return;

        const delta = Math.min(Math.max(0, e.clientX - dragRef.current.startX), 260);
        setDragX(delta);
    };

    const handleMouseUp = () => {
        if (!dragRef.current?.isDragging) return;
        dragRef.current.isDragging = false;

        // If dragged far → update to next status
        if (dragX > 180) {
            const next = getNextStatus(order.status);
            if (next) updateStatus(next);
        }

        setTimeout(() => setDragX(0), 150);
    };

    const getNextStatus = (current) => {
        const index = STATUS_STEPS.findIndex((s) => s.key === current);
        return STATUS_STEPS[index + 1]?.key || null;
    };

    if (loading)
        return <div className="p-6 text-gray-600 animate-pulse">Loading…</div>;

    if (!order)
        return (
            <div className="p-6">
                <p>Order not found</p>
                <button onClick={() => navigate(-1)}>Back</button>
            </div>
        );

    const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

    /* --------------------------------------------
        BLUE LINE WIDTH PERCENTAGE
    -------------------------------------------- */
    const progressWidth =
        (currentIndex / (STATUS_STEPS.length - 1)) * 100 + "%";

    /* --------------------------------------------
        UI STARTS HERE
    -------------------------------------------- */
    return (
        <div
            className="p-6 space-y-10"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* BACK BUTTON */}
            <button
                className="text-gray-500 hover:text-black text-sm"
                onClick={() => navigate(-1)}
            >
                ← Back to Orders
            </button>

            {/* ---------------------- ORDER HEADER ---------------------- */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Order #{order.id.slice(0, 8)}
                </h1>
                <p className="text-gray-500 mt-1">
                    Placed on {new Date(order.created_at).toLocaleString()}
                </p>
            </div>

            {/* ---------------------- ORDER SUMMARY ---------------------- */}
            <div className="bg-white rounded-2xl shadow p-6 border">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <p className="text-gray-700">
                    <strong>User ID:</strong> {order.user_id}
                </p>

                <p className="text-gray-700">
                    <strong>Total Price:</strong> ₹{order.total_price}
                </p>

                <p className="text-gray-700">
                    <strong>Order Status:</strong> {order.status}
                </p>
            </div>

            {/* ---------------------- STATUS TIMELINE ---------------------- */}
            <div className="bg-white rounded-2xl shadow p-6 border">
                <h2 className="text-xl font-semibold mb-6">Order Status</h2>

                {/* Track line */}
                <div className="relative mb-10">
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200" />

                    <div
                        className="absolute top-6 left-0 h-1 bg-blue-600 transition-all"
                        style={{ width: progressWidth }}
                    />

                    {/* Steps */}
                    <div className="flex justify-between">
                        {STATUS_STEPS.map((step, index) => {
                            const active = index <= currentIndex;

                            return (
                                <div
                                    key={step.key}
                                    onClick={() => handleStatusClick(step.key)}
                                    className="flex flex-col items-center cursor-pointer group"
                                >
                                    <div
                                        className={`h-12 w-12 rounded-full flex items-center justify-center text-xl transition-all border
                      ${active
                                                ? "bg-blue-600 text-white shadow-lg border-blue-700"
                                                : "bg-gray-200 text-gray-500 border-gray-300"
                                            }
                      group-hover:ring-4 group-hover:ring-blue-200
                    `}
                                    >
                                        {step.icon}
                                    </div>

                                    <p
                                        className={`mt-2 text-sm ${active ? "text-blue-600 font-semibold" : "text-gray-400"
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ---------------------- DRAG TO UPDATE ---------------------- */}
                {order.status !== "completed" && (
                    <div className="relative bg-gray-100 h-14 rounded-full overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            Drag right to update → {getNextStatus(order.status)}
                        </div>

                        <div
                            onMouseDown={(e) => {
                                dragRef.current = {
                                    isDragging: true,
                                    startX: e.clientX,
                                };
                            }}
                            style={{ transform: `translateX(${dragX}px)` }}
                            className="absolute left-0 top-1 h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg cursor-grab active:cursor-grabbing"
                        >
                            🔵
                        </div>
                    </div>
                )}
            </div>

            {/* ---------------------- ITEMS ---------------------- */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Items</h2>

                <div className="space-y-4">
                    {order.order_items.map((item) => {
                        const p = productDetails[item.product_id];

                        return (
                            <div
                                key={item.id}
                                className="bg-white p-4 shadow rounded-xl border flex gap-4"
                            >
                                <img
                                    src={p?.product_images?.[0]?.image_url || "/noimg.jpg"}
                                    className="h-20 w-20 object-cover rounded-lg"
                                />

                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-lg">
                                        {p?.name}
                                    </p>
                                    <p className="text-gray-500 text-sm line-clamp-2">
                                        {p?.description}
                                    </p>

                                    <div className="mt-3 flex justify-between text-gray-800">
                                        <span>Quantity: {item.quantity}</span>
                                        <span className="font-semibold">₹{item.price}</span>
                                    </div>
                                </div>

                                <div className="text-3xl opacity-40">🛒</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
