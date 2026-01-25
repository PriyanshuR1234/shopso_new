import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import toast from "react-hot-toast";

export default function VendorTopbar() {
  const [vendor, setVendor] = useState(() => JSON.parse(localStorage.getItem("vendor") || "null"));
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUpdate = () => {
      const updated = JSON.parse(localStorage.getItem("vendor") || "null");
      setVendor(updated);
    };
    window.addEventListener("vendor-profile-update", handleUpdate);
    return () => window.removeEventListener("vendor-profile-update", handleUpdate);
  }, []);

  useEffect(() => {
    const userSnapshot = JSON.parse(localStorage.getItem("user") || "null");
    if (!userSnapshot?.id) return;

    // Load unread notifications
    const loadNotifs = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userSnapshot.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setNotifications(data || []);
    };
    loadNotifs();

    // Subscribe to new real-time alerts
    const channel = supabase
      .channel('vendor-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userSnapshot.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        toast("New Store Alert!", { icon: "🔔" });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const markRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const pageTitle = {
    "/vendor/dashboard": "Vendor Dashboard",
    "/vendor/analytics": "Analytics",
    "/vendor/orders": "Orders",
    "/vendor/add-product": "Add Product",
    "/vendor/profile": "Store Profile",
  }[location.pathname] || "Vendor Panel";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("vendor");
    localStorage.removeItem("user");
    window.location.href = "/user/login";
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/vendor/dashboard?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">

      {/* LEFT */}
      <h1 className="text-xl font-bold text-gray-800 tracking-wide">
        {pageTitle}
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        {/* Search */}
        <div className="hidden md:block relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
          >
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
            🔔
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl rounded-2xl border border-gray-100 p-4 z-50">
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-gray-800">Notifications</p>
                {unreadCount > 0 && <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount} NEW</span>}
              </div>

              <ul className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.map(n => (
                  <li
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${n.is_read ? 'bg-white opacity-60 grayscale' : 'bg-blue-50 border-blue-100'}`}
                  >
                    <p className="font-bold text-xs">{n.title}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-2">{n.message}</p>
                    {n.link && (
                      <button
                        onClick={() => navigate(n.link)}
                        className="text-[9px] font-black text-blue-600 mt-2 hover:underline"
                      >
                        VIEW →
                      </button>
                    )}
                  </li>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center py-4 text-xs text-gray-400 italic">No notifications yet</p>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <img
              src={vendor?.shop_logo || "https://i.pravatar.cc/40?img=5"}
              className="w-10 h-10 rounded-full border"
              alt="Vendor"
            />

            <span className="hidden sm:block font-semibold text-gray-700">
              {vendor?.shop_name || "Vendor"}
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-50">
              <button
                onClick={() => { setShowProfileMenu(false); navigate("/vendor/profile"); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                Profile
              </button>

              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
