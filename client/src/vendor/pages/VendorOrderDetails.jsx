import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import supabase from "../../utils/supabaseClient";
import PendingVendorModal from "../../components/PendingVendorModal";

export default function VendorOrderDetails() {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");
  const vendor_status = vendor?.status;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const dragRef = useRef(null);
  const [dragX, setDragX] = useState(0);

  const STATUS_STEPS = [
    { key: "pending", label: "Pending", icon: "🕒" },
    { key: "processing", label: "Processing", icon: "⚙️" },
    { key: "shipped", label: "Shipped", icon: "🚚" },
    { key: "delivered", label: "Delivered", icon: "📦" },
    { key: "completed", label: "Completed", icon: "✅" },
  ];

  if (vendor_status !== "approved") {
    return <PendingVendorModal />;
  }

  useEffect(() => {
    if (!order_id) return;
    loadOrder();
  }, [order_id]);

  const loadOrder = async () => {
    try {
      // Hydrated RPC: Now returns order + items + product metadata in ONE call
      const { data, error } = await supabase.rpc("get_vendor_order", {
        order_input: order_id,
      });

      if (error) throw error;
      setOrder(data);
    } catch (err) {
      console.error("Load order error:", err);
      toast.error("Failed to load order manifest");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    const { error } = await supabase.rpc("update_vendor_order_status", {
      order_input: order.id,
      new_status: newStatus,
    });

    if (error) return toast.error("Update failed");

    // RESTOCK IF CANCELLED
    if (newStatus === "cancelled" && order.order_items) {
      for (const item of order.order_items) {
        await supabase.rpc("increment_stock", {
          row_id: item.product_id,
          quantity: item.quantity
        });
      }
      toast.success("Stock restored");
    }

    setOrder((prev) => ({ ...prev, status: newStatus }));
    toast.success(`Updated → ${newStatus.toUpperCase()}`);
  };

  const handleStatusClick = (s) => updateStatus(s);

  const getNextStatus = (s) => {
    const i = STATUS_STEPS.findIndex((x) => x.key === s);
    return STATUS_STEPS[i + 1]?.key || null;
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current?.isDragging) return;
    const delta = Math.min(Math.max(0, e.clientX - dragRef.current.startX), 260);
    setDragX(delta);
  };

  const handleMouseUp = () => {
    if (!dragRef.current?.isDragging) return;
    dragRef.current.isDragging = false;
    if (dragX > 180) {
      const next = getNextStatus(order.status);
      if (next) updateStatus(next);
    }
    setTimeout(() => setDragX(0), 150);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
      <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest text-xs">Syncing Manifest Data...</p>
    </div>
  );

  if (!order)
    return (
      <div className="p-10 text-center">
        <p className="text-gray-400 font-bold mb-4 uppercase text-lg">Order Consignment Not Found</p>
        <button onClick={() => navigate(-1)} className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition shadow-xl">Return to Fleet</button>
      </div>
    );

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const progressWidth = (currentIndex / (STATUS_STEPS.length - 1)) * 100 + "%";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-black text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1 transition-all">
              <span className="text-lg leading-none">←</span> Dispatch Fleet
            </button>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Consignment #{order.id.slice(0, 8)}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">Entry: {new Date(order.created_at).toLocaleString()}</p>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg ${order.status === 'completed' ? 'bg-green-600 shadow-green-100 text-white' : 'bg-black shadow-gray-200 text-white'
              }`}>
              {order.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Items & Logistics */}
          <div className="lg:col-span-2 space-y-8">

            {/* Fulfillment Timeline */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 mb-8 uppercase tracking-widest border-b border-gray-50 pb-3">Fulfillment Progress</h3>
              <div className="relative mb-10 px-4">
                <div className="absolute top-6 left-4 right-4 h-2 bg-gray-50 rounded-full"></div>
                <div className="absolute top-6 left-4 h-2 bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.4)]" style={{ width: progressWidth }}></div>
                <div className="flex justify-between relative z-10">
                  {STATUS_STEPS.map((step, i) => {
                    const active = i <= currentIndex;
                    return (
                      <div key={step.key} onClick={() => handleStatusClick(step.key)} className="flex flex-col items-center gap-3 cursor-pointer group">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-full border-4 transition-all duration-300 ${active ? "bg-blue-600 border-blue-50 text-white scale-110 shadow-2xl shadow-blue-200" : "bg-white border-gray-50 text-gray-200"
                          }`}>
                          <span className="text-2xl">{step.icon}</span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${active ? "text-blue-600" : "text-gray-300 group-hover:text-gray-400"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.status !== "completed" && (
                <div className="mt-12 relative bg-gray-50 h-20 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                    Slide <span className="text-black group-hover:text-blue-600">BOLT</span> right to dispatch → <span className="bg-blue-600 text-white px-2 py-0.5 rounded italic font-mono lowercase">{getNextStatus(order.status)}</span>
                  </p>
                  <div
                    onMouseDown={(e) => {
                      dragRef.current = { isDragging: true, startX: e.clientX };
                    }}
                    style={{ transform: `translateX(${dragX}px)` }}
                    className="absolute left-2 top-2 h-16 w-16 rounded-2xl bg-black text-white flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing transition-transform active:scale-95 z-20"
                  >
                    <span className="text-2xl animate-pulse">⚡</span>
                  </div>
                </div>
              )}
            </div>

            {/* Packing Manifest (Items) */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-3 bg-black rounded-full"></div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Packing Manifest</h3>
                </div>
                <span className="text-[10px] font-black text-white bg-black px-3 py-1.5 rounded-2xl shadow-lg uppercase">{order.order_items.length} SKUs Identified</span>
              </div>
              <div className="divide-y divide-gray-50">
                {order.order_items.map((item) => (
                  <div key={item.id} className="p-8 flex gap-8 hover:bg-gray-50/30 transition-colors group">
                    <div className="relative shrink-0">
                      <img
                        src={item.product_image || "https://placehold.co/400x400?text=Scan+Pending"}
                        className="w-28 h-28 object-cover rounded-3xl border-2 border-white shadow-xl bg-white transition-transform group-hover:rotate-2 group-hover:scale-105"
                        alt={item.product_name}
                      />
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center font-black text-base border-2 border-white shadow-2xl z-10 rotate-12">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Item ID: {String(item.product_id).slice(0, 8)}</p>
                      <p className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">{item.product_name || "Unknown SKU"}</p>
                      <p className="text-sm text-gray-400 font-medium italic leading-relaxed line-clamp-2">{item.product_description || "No specific packaging instructions provided."}</p>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tight border font-mono">
                          UNIT ₹{item.price}
                        </div>
                        <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
                        <div className="text-gray-900 font-black text-xl italic tracking-tighter">
                          TOTAL ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-gray-50/20 text-center border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">--- End of Manifest ---</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Logistics & Customer */}
          <div className="space-y-8">

            {/* Logistics Summary */}
            <div className="bg-black text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-3">Fulfillment Hub</h3>
              <div className="space-y-8 relative z-10">
                <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Payment Ledger
                  </p>
                  <p className="text-2xl font-black uppercase italic tracking-tighter">{order.payment_status}</p>
                  <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase">via: {order.payment_method}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Valuation</p>
                  <p className="text-5xl font-black italic tracking-tighter drop-shadow-lg">₹{order.total_price}</p>
                </div>
              </div>
            </div>

            {/* Consignee Address */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest border-b border-gray-50 w-full pb-3">Destination</h3>
              <div className="bg-gray-50/80 p-6 rounded-[2rem] border border-gray-100 w-full">
                <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                  {order.address || "Digital Consignment - No physical address."}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-50 w-full">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2">Consignee ID</p>
                <code className="text-[10px] bg-gray-100 px-3 py-1.5 rounded-lg font-mono text-gray-500 break-all select-all">
                  USR-{order.user_id.slice(0, 18)}...
                </code>
              </div>
            </div>

            {/* Quick Dispatch Actions */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-4">
              <button onClick={() => window.print()} className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 group">
                Print Label Manifest <span className="text-lg group-hover:scale-125 transition-transform">📄</span>
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gray-50 text-gray-400 border border-gray-100 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-black hover:bg-white transition-all flex items-center justify-center gap-3"
              >
                Fleet Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
