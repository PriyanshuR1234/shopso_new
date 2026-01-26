import { useEffect, useState } from "react";
import supabase from "../../../utils/supabaseClient";
import toast from "react-hot-toast";

// Modular Components
import AdminVendors from "./components/AdminVendors";
import AdminOrders from "./components/AdminOrders";
import AdminAnalytics from "./components/AdminAnalytics";
import AdminDelivery from "./components/AdminDelivery";
import AdminNotifications from "./components/AdminNotifications";
import PlatformSettings from "./components/PlatformSettings";
import AdminBanners from "./AdminBanners";
import AdminTrending from "./AdminTrending";

const tabs = ["vendors", "orders", "analytics", "delivery", "alerts", "banners", "trending", "settings"];

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState("vendors");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [filteredVendors, setFilteredVendors] = useState([]); // Vendors displayed in the "Vendors" tab
  const [allVendors, setAllVendors] = useState([]);           // Complete list for filters/dropdowns
  const [vendorFilter, setVendorFilter] = useState("pending");
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPartner, setNewPartner] = useState({ name: "", phone: "", email: "" });

  useEffect(() => {
    // Preliminary server-side admin check via analytics RPC
    const checkAdmin = async () => {
      const { error } = await supabase.rpc("get_platform_analytics");
      if (error && error.message.includes("Access denied")) {
        window.location.href = "/";
        return;
      }
      // Initial load of everything
      await loadAll();
    };
    checkAdmin();
  }, []);

  // Fix: Re-fetch vendors whenever filter changes
  useEffect(() => {
    if (!loading) {
      fetchVendors(vendorFilter);
    }
  }, [vendorFilter, loading]);

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchVendors(vendorFilter),
        loadOrders(),
        loadAnalytics(),
        loadPartners()
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async (statusFilter = "all") => {
    try {
      let query = supabase
        .from("vendors")
        .select(`
          *,
          users (email),
          products (id, name, price, stock, sold, product_images(image_url)),
          orders (total_price, status)
        `)
        .order("created_at", { ascending: false });

      const { data: allData, error } = await query;
      if (error) throw error;

      const vendorDetails = (allData || []).map(v => {
        const revenue = (v.orders || []).reduce((sum, o) => sum + Number(o.total_price || 0), 0);
        return {
          ...v,
          user_email: v.users?.email,
          totalProducts: v.products?.length || 0,
          totalOrders: v.orders?.length || 0,
          vendorRevenue: revenue,
        };
      });

      // Update the complete list for filters (Global)
      setAllVendors(vendorDetails);

      // Apply filtering for the "Vendors" tab view (Local Tab State)
      if (statusFilter === "all") {
        setFilteredVendors(vendorDetails);
      } else {
        setFilteredVendors(vendorDetails.filter(v => v.status === statusFilter));
      }
    } catch (err) {
      console.error("Fetch vendors error:", err);
      toast.error("Failed to load vendors");
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Load orders error:", err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc("get_platform_analytics");
      if (error) throw error;
      setAnalytics(data || {});
    } catch (err) {
      console.error("Load analytics error:", err);
    }
  };

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      console.error("Load partners error:", err);
    }
  };

  const approveVendor = async (vendorId, customCommission) => {
    try {
      const commission_rate = Number(customCommission || 10);
      const { error } = await supabase
        .from("vendors")
        .update({ status: "approved", commission_rate })
        .eq("id", vendorId);

      if (error) throw error;

      toast.success("Vendor approved!");
      await fetchVendors(vendorFilter);
      await loadAnalytics(); // Refresh stats
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve vendor");
    }
  };

  const banVendor = async (vendorId) => {
    try {
      const { error } = await supabase
        .from("vendors")
        .update({ status: "banned" })
        .eq("id", vendorId);

      if (error) throw error;

      toast.success("Vendor banned!");
      await fetchVendors(vendorFilter);
      await loadAnalytics();
    } catch (err) {
      console.error("Ban vendor error:", err);
      toast.error("Failed to ban vendor");
    }
  };

  const updateCommission = async (vendorId, customCommission) => {
    try {
      if (customCommission === undefined || customCommission === "") {
        toast.error("Set a commission first");
        return;
      }

      const { error } = await supabase
        .from("vendors")
        .update({ commission_rate: Number(customCommission) })
        .eq("id", vendorId);

      if (error) throw error;
      toast.success("Commission updated!");
      await fetchVendors(vendorFilter);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update commission");
    }
  };

  const markRefund = async (orderId, decision) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "refund_" + decision })
        .eq("id", orderId);

      if (error) throw error;
      toast.success(`Refund ${decision}!`);
      await loadOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update refund");
    }
  };

  const markPayout = async (orderId) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Payout updated!");
      await loadOrders();
      await loadAnalytics();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payout");
    }
  };

  const handleDispute = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "dispute_" + status })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Dispute updated!");
      await loadOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update dispute");
    }
  };

  const addPartner = async () => {
    try {
      const { error } = await supabase
        .from("delivery_partners")
        .insert({
          name: newPartner.name.trim(),
          phone: newPartner.phone?.trim() || "",
          email: newPartner.email?.trim() || ""
        });

      if (error) throw error;
      toast.success("Partner added!");
      setNewPartner({ name: "", phone: "", email: "" });
      await loadPartners();
    } catch (err) {
      console.error("Add partner error:", err);
      toast.error("Failed to add partner");
    }
  };

  const updatePartnerStatus = async (partnerId, status) => {
    try {
      const { error } = await supabase
        .from("delivery_partners")
        .update({ status })
        .eq("id", partnerId);

      if (error) throw error;
      toast.success("Partner status updated!");
      await loadPartners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update partner status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest text-xs">Initializing Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Control Panel</h1>
          <p className="text-gray-400 mt-2 font-medium">Enterprise Orchestration & Logistics</p>
        </div>
      </header>

      <div className="w-full p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-3 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl border-2 font-black transition-all uppercase tracking-tight text-sm shadow-sm ${activeTab === tab
                ? "bg-black text-white border-black scale-105 shadow-xl"
                : "bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Content Sections */}
        <main className="animate-in fade-in duration-500">
          {activeTab === "vendors" && (
            <AdminVendors
              vendors={filteredVendors}
              filter={vendorFilter}
              setFilter={setVendorFilter}
              onApprove={approveVendor}
              onBan={banVendor}
              onUpdateCommission={updateCommission}
            />
          )}

          {activeTab === "orders" && (
            <AdminOrders
              orders={orders}
              vendors={allVendors}
              onMarkRefund={markRefund}
              onMarkPayout={markPayout}
              onHandleDispute={handleDispute}
            />
          )}

          {activeTab === "analytics" && (
            <AdminAnalytics analytics={analytics} />
          )}

          {activeTab === "delivery" && (
            <AdminDelivery
              partners={partners}
              newPartner={newPartner}
              setNewPartner={setNewPartner}
              onAddPartner={addPartner}
              onUpdateStatus={updatePartnerStatus}
            />
          )}

          {activeTab === "alerts" && (
            <AdminNotifications userId={user?.id} />
          )}

          {activeTab === "settings" && (
            <PlatformSettings />
          )}

          {activeTab === "banners" && (
            <AdminBanners />
          )}

          {activeTab === "trending" && (
            <AdminTrending />
          )}
        </main>
      </div>
    </div>
  );
}