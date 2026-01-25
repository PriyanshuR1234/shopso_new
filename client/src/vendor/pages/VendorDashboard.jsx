// src/pages/vendor/VendorDashboard.jsx

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom"; // Added useSearchParams
import supabase from "../../utils/supabaseClient";
import toast from "react-hot-toast";

import PendingVendorModal from "../../components/PendingVendorModal";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(() => JSON.parse(localStorage.getItem("vendor") || "null"));
  const vendor_id = vendor?.id;
  const user_id = vendor?.user_id;

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  useEffect(() => {
    const handleUpdate = () => {
      const updated = JSON.parse(localStorage.getItem("vendor") || "null");
      setVendor(updated);
    };
    window.addEventListener("vendor-profile-update", handleUpdate);
    window.addEventListener("user-session-change", handleUpdate);
    return () => {
      window.removeEventListener("vendor-profile-update", handleUpdate);
      window.removeEventListener("user-session-change", handleUpdate);
    };
  }, []);

  /* ------------------------------------------------------------
      SYNC SEARCH WITH URL
  -------------------------------------------------------------*/
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const [status, setStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(initialSearch);
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");

  /* ------------------------------------------------------------
      FETCH VENDOR STATUS (Supabase)
  -------------------------------------------------------------*/
  useEffect(() => {
    if (!user_id) return;

    const loadStatus = async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("status")
        .eq("user_id", user_id)
        .single();

      if (error) {
        console.log(error);
        setStatus("pending");
      } else {
        setStatus(data.status);
      }
    };

    loadStatus();
  }, [user_id]);

  /* ------------------------------------------------------------
      FETCH PRODUCTS (Supabase)
  -------------------------------------------------------------*/
  useEffect(() => {
    if (status !== "approved" || !vendor_id) return;

    const loadProducts = async () => {
      try {
        // Get products
        const { data: prod, error: prodErr } = await supabase
          .from("products")
          .select("*, product_images(*)")
          .eq("vendor_id", vendor_id);

        if (prodErr) console.log(prodErr);

        setProducts(prod || []);

        // Get analytics via Edge Function (Offloads processing from DB)
        const { data: analyticsData, error: analyticsErr } = await supabase.functions.invoke('vendor-analytics', {
          body: { vendor_id }
        });

        if (analyticsErr) {
          console.error("Analytics failure:", analyticsErr);
          // Fallback to local calculation if EF fails (e.g. 401 during dev)
          const { data: ordersData } = await supabase.from("orders").select("total_price, status").eq("vendor_id", vendor_id);
          const totalRevenue = (ordersData || []).reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
          const pendingOrders = (ordersData || []).filter(o => o.status === 'pending').length;
          const completedOrders = (ordersData || []).filter(o => o.status === 'completed' || o.status === 'delivered').length;

          setStats({
            total_orders: ordersData?.length || 0,
            total_revenue: totalRevenue,
            pending_orders: pendingOrders,
            completed_orders: completedOrders
          });
        } else if (analyticsData) {
          setStats(analyticsData);
        }
      } catch (e) {
        console.log("Dashboard load error:", e);
      }

      setLoading(false);
    };

    loadProducts();
  }, [vendor_id, status]);

  /* ------------------------------------------------------------
      FILTERING + SORTING
  -------------------------------------------------------------*/
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (stockFilter === "in") list = list.filter((p) => p.stock > 0);
    if (stockFilter === "out") list = list.filter((p) => p.stock === 0);

    if (sortBy === "price_low") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_high") list.sort((a, b) => b.price - a.price);
    if (sortBy === "newest")
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return list;
  }, [products, search, stockFilter, sortBy]);

  /* ------------------------------------------------------------
      DELETE PRODUCT (+ Storage Cleanup)
  -------------------------------------------------------------*/
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      // 1. Get image URLs before they are cascaded away
      const { data: images } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", id);

      // 2. Delete product (triggers cascade in DB)
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      // 3. Cleanup storage files
      if (images && images.length > 0) {
        const { deleteFileByUrl } = await import("../../utils/storageUtils");
        for (const img of images) {
          await deleteFileByUrl(img.image_url);
        }
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted & storage cleaned");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  /* ------------------------------------------------------------
      CONDITIONAL RENDERS
  -------------------------------------------------------------*/
  if (loading && !vendor_id)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Synchronizing Store Data...</p>
      </div>
    );

  if (!vendor_id || !user_id)
    return <div className="p-6 text-center text-red-500 font-bold border-2 border-dashed border-red-200 rounded-2xl m-6">Session Expired or Store Not Found. Please Login Again.</div>;

  if (status === "pending") return <PendingVendorModal />;

  if (loading)
    return (
      <div className="text-center p-10 text-xl text-gray-500">
        Loading dashboard...
      </div>
    );

  /* ------------------------------------------------------------
      MAIN UI
  -------------------------------------------------------------*/
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <p className="text-blue-100 mt-1">Manage products & orders</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Products" value={products.length} icon="📦" />
        <StatCard title="Total Orders" value={stats.total_orders || 0} icon="🛒" />
        <StatCard title="Completed" value={stats.completed_orders || 0} icon="✔️" />
        <StatCard title="Revenue" value={`₹${stats.total_revenue || 0}`} icon="💰" />
        <StatCard title="Pending" value={stats.pending_orders || 0} icon="⏳" />
      </div>

      {/* LOW STOCK ALERTS */}
      {products.filter(p => p.stock <= 10).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            ⚠️ Low Stock Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter(p => p.stock <= 10)
              .sort((a, b) => a.stock - b.stock)
              .map(p => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border flex justify-between items-center shadow-sm ${p.stock <= 3
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{p.stock <= 3 ? "🚨" : "⚠️"}</span>
                    <div>
                      <p className="font-bold text-sm line-clamp-1">{p.name}</p>
                      <p className="text-xs opacity-80">Only {p.stock} units left</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = `/vendor/edit-product/${p.id}`}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${p.stock <= 3
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                      }`}
                  >
                    Restock
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-wrap gap-4 items-center">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-3 rounded-xl w-72"
        />

        <select className="border p-3 rounded-xl" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="in">In Stock</option>
          <option value="out">Out</option>
        </select>

        <select className="border p-3 rounded-xl" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">None</option>
          <option value="newest">Newest</option>
          <option value="price_low">Price Low → High</option>
          <option value="price_high">Price High → Low</option>
        </select>

        <button
          onClick={() => (window.location.href = "/vendor/add-product")}
          className="ml-auto bg-blue-600 text-white px-5 py-3 rounded-xl"
        >
          + Add Product
        </button>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow overflow-hidden">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 2000 }}
              loop
            >
              {(p.product_images || []).map((img) => (
                <SwiperSlide key={img.id}>
                  <img src={img.image_url} className="h-48 w-full object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="p-5 space-y-2">
              <h2 className="font-semibold text-lg">{p.name}</h2>
              <p className="text-sm text-gray-600">{p.description}</p>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600 text-lg">
                    ₹{p.discounted_price || p.price}
                  </span>
                  {p.discounted_price && p.discounted_price < p.price && (
                    <>
                      <span className="text-gray-400 line-through text-xs">
                        ₹{p.price}
                      </span>
                      <span className="text-green-600 text-xs font-bold">
                        {p.discount_percent || Math.round(((p.price - p.discounted_price) / p.price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <StockBadge stock={p.stock} />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() =>
                    (window.location.href = `/vendor/edit-product/${p.id}`)
                  }
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(p.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ------------------------------------------------------------
   COMPONENTS
-------------------------------------------------------------*/
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl text-2xl">
        {icon}
      </div>
      <p className="text-gray-500 mt-2">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

function StockBadge({ stock }) {
  if (stock === 0) return <span className="text-red-600">Out of Stock</span>;
  if (stock < 5) return <span className="text-orange-600">Low Stock</span>;
  return <span className="text-green-600">In Stock</span>;
}
