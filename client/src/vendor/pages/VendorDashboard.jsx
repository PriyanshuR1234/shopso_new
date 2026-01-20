import { useEffect, useState, useMemo } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function VendorDashboard() {
  const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");
  const vendor_id = vendor?.id;

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");

  /** FETCH PRODUCTS **/
  useEffect(() => {
    if (!vendor_id) {
      toast.error("Vendor not logged in");
      return;
    }

    Promise.all([
      API.get(`/products/vendor/${vendor_id}`),
      API.get(`/orders/vendor/${vendor_id}`),
    ])
      .then(([pRes, sRes]) => {
        const arr = Array.isArray(pRes.data)
          ? pRes.data
          : Array.isArray(pRes.data?.products)
          ? pRes.data.products
          : [];

        const normalized = arr.map((p) => ({
          ...p,
          product_images: Array.isArray(p.product_images)
            ? p.product_images
            : [],
          stock: typeof p.stock === "number" ? p.stock : 0,
        }));

        setProducts(normalized);
        setStats(sRes.data || {});
      })
      .catch((e) => {
        console.error("LOAD ERROR:", e);
        toast.error("Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, [vendor_id]);

  /** FILTER PRODUCST **/
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    let list = [...products];

    if (search.trim() !== "") {
      list = list.filter((p) =>
        p?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (stockFilter === "in") list = list.filter((p) => p.stock > 0);
    if (stockFilter === "out") list = list.filter((p) => p.stock === 0);

    if (sortBy === "price_low") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_high") list.sort((a, b) => b.price - a.price);

    if (sortBy === "newest") {
      list.sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at) : 0;
        const db = b.created_at ? new Date(b.created_at) : 0;
        return db - da;
      });
    }

    return list;
  }, [products, search, stockFilter, sortBy]);

  /** DELETE **/
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await API.delete(`/products/delete/${id}/${vendor_id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10 text-xl font-semibold text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <p className="text-blue-100 mt-1">
          Welcome back, manage your business analytics & inventory
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={products.length} icon="📦" />
        <StatCard href="/vendor/orders" title="Total Orders" value={stats?.totalOrders || 0} icon="🛒" />
        <StatCard 
  href="/vendor/analytics" 
  title="Revenue" 
  value={`₹${stats?.revenue || 0}`} 
  icon="💰" 
/>

<StatCard 
  href="/vendor/orders?filter=pending" 
  title="Pending Orders" 
  value={stats?.pending || 0} 
  icon="⏳" 
/>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-wrap gap-4 items-center">

        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-3 rounded-xl w-72 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="border p-3 rounded-xl bg-gray-50"
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-3 rounded-xl bg-gray-50"
        >
          <option value="">No Sorting</option>
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low → High</option>
          <option value="price_high">Price: High → Low</option>
        </select>

        <button
          onClick={() => (window.location.href = "/vendor/add-product")}
          className="ml-auto bg-blue-600 text-white px-5 py-3 rounded-xl shadow hover:bg-blue-700 transition"
        >
          + Add Product
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
          >
            {/* Swiper */}
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 2200 }}
              loop
              className="rounded-t-2xl"
            >
              {p.product_images.length > 0 ? (
                p.product_images.map((img) => (
                  <SwiperSlide key={img.id}>
                    <img
                      src={img.image_url}
                      className="h-48 w-full object-cover"
                    />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                    No Image
                  </div>
                </SwiperSlide>
              )}
            </Swiper>

            {/* Details */}
            <div className="p-5 space-y-2">
              <h2 className="font-semibold text-lg">{p.name}</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xl font-bold text-blue-600">
                  ₹{p.price}
                </span>
                <StockBadge stock={p.stock} />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() =>
                    (window.location.href = `/vendor/edit-product/${p.id}`)
                  }
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(p.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500 mt-10 text-lg">
          No products found
        </p>
      )}
    </div>
  );
}

/** Improved Stat Card */
function StatCard({ title, value, icon, href }) {
  return (
    <div
      onClick={() => href && (window.location.href = href)}
      className={`bg-white p-6 rounded-xl shadow cursor-pointer 
                  hover:shadow-lg transition transform hover:scale-[1.02]`}
    >
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-2xl mb-4">
        {icon}
      </div>

      {/* Title */}
      <p className="text-gray-500 text-sm font-medium">{title}</p>

      {/* Value */}
      <h2 className="text-2xl font-bold mt-1">{value}</h2>
    </div>
  );
}


/** Stock Badge */
function StockBadge({ stock }) {
  if (stock === 0)
    return <span className="text-red-600 font-semibold">Out of Stock</span>;
  if (stock < 5)
    return <span className="text-orange-600 font-semibold">Low Stock</span>;
  return <span className="text-green-600 font-semibold">In Stock</span>;
}
