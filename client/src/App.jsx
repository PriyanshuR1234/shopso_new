import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CustomerLayout from "./customer/CustomerLayout";
import VendorLayout from "./vendor/components/VendorLayout";
import supabase from "./utils/supabaseClient";
import UserLogin from "./customer/pages/Auth/UserLogin";
import UserSignup from "./customer/pages/Auth/UserSignup";
import UserProfile from "./customer/pages/UserProfile";
import UserOrders from "./customer/pages/UserOrders";
import UserOrderDetails from "./customer/pages/UserOrderDetails";
import SuperAdmin from "./vendor/pages/admin/SuperAdmin";
import ForgotPassword from "./customer/pages/Auth/ForgotPassword";
import ResetPassword from "./customer/pages/Auth/ResetPassword";
import VerifyPhone from "./customer/pages/VerifyPhone";

import HomePage from './customer/pages/HomePage/HomePage';
import Navigation from './customer/Navigation';

import ProductListing from './customer/pages/ProductListing/ProductListing.jsx';
import ProductDetails from './customer/pages/ProductDetails/ProductDetails';
import Cart from './customer/pages/Cart/Cart';
import Checkout from './customer/pages/Checkout/Checkout';

import VendorDashboard from "./vendor/pages/VendorDashboard";
import AddProduct from "./vendor/pages/AddProduct";
import VendorLogin from "./vendor/pages/VendorLogin";
import EditProduct from "./vendor/pages/EditProduct";
import VendorSignup from "./vendor/pages/VendorSignup.jsx"
import VendorOnboarding from "./vendor/pages/VendorOnboarding.jsx"
import VendorOrders from "./vendor/pages/VendorOrders";
import VendorOrderDetails from "./vendor/pages/VendorOrderDetails";

import VendorAnalytics from "./vendor/pages/VendorAnalytics";
import VendorProfile from "./vendor/pages/VendorProfile";


import { Toaster } from "react-hot-toast";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = React.useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  React.useEffect(() => {
    const verifyRole = async () => {
      // 1. Check local first for speed
      if (user?.profile?.role === "admin") {
        setIsAdmin(true);
        return;
      }

      // 2. Fetch fresh from DB to be sure (prevents cache issues)
      if (user?.id) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data?.role === "admin") {
          setIsAdmin(true);
          // Sync local storage if it was out of date
          const updated = { ...user, profile: { ...user.profile, role: "admin" } };
          localStorage.setItem("user", JSON.stringify(updated));
          return;
        }
      }
      setIsAdmin(false);
    };
    verifyRole();
  }, [user?.id]);

  if (isAdmin === null) return <div className="p-10 text-center">Verifying permissions...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to view this page.</p>
        <a href="/" className="text-blue-600 underline">Go Home</a>
      </div>
    );
  }

  return children;
};

const App = () => {
  React.useEffect(() => {
    // Session Recovery: Sync localStorage 'user' with latest DB profile on mount
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // 1. Sync User Profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        // If no profile exists (e.g., Google OAuth user), it should be handled by the trigger now.
        // We just reload the user metadata if needed.
        if (!profile) {
          console.warn("User logged in but profile not found immediately. Trigger delay?");
          // Optional: Retry fetch or just wait
        } else {
          const fullUser = { ...session.user, profile };
          localStorage.setItem("user", JSON.stringify(fullUser));
          window.dispatchEvent(new Event("user-session-change"));

          // 2. Sync Vendor Profile (if applicable)
          if (profile.role === "vendor") {
            const { data: vendorData } = await supabase
              .from("vendors")
              .select("*")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (vendorData) {
              localStorage.setItem("vendor", JSON.stringify(vendorData));
              window.dispatchEvent(new Event("vendor-profile-update"));
            }
          }
        }
      } else {
        // If NO session in Supabase, ensure localStorage is also empty
        const currentUser = localStorage.getItem("user");
        if (currentUser) {
          localStorage.removeItem("user");
          localStorage.removeItem("vendor");
          window.dispatchEvent(new Event("user-session-change"));
        }
      }
    };
    syncSession();
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>


        {/* ---------------- Customer Layout ---------------- */}
        <Route element={<CustomerLayout />}>
          <Route path="/admin" element={<AdminRoute><SuperAdmin /></AdminRoute>} />

          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/signup" element={<UserSignup />} />
          <Route path="/user/forgot-password" element={<ForgotPassword />} />
          <Route path="/user/reset-password" element={<ResetPassword />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route path="/profile" element={<UserProfile />} />

          <Route path="/orders" element={<UserOrders />} />
          <Route path="/active-order/:orderId" element={<UserOrderDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<ProductListing />} />
          <Route path="/:category" element={<ProductListing />} />
          <Route path="/men/clothing/:category" element={<ProductListing />} />
          <Route path="/women/clothing/:category" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/:category" element={<ProductListing />} />
          <Route path="/:category/:subcategory" element={<ProductListing />} />
        </Route>

        {/* ───────────── Vendor Login (NO LAYOUT) ───────────── */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/signup" element={<VendorSignup />} />
        <Route path="/vendor/onboarding" element={<VendorOnboarding />} />

        {/* ---------------- Vendor Layout ---------------- */}
        <Route element={<VendorLayout />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/analytics" element={<VendorAnalytics />} />
          <Route path="/vendor/add-product" element={<AddProduct />} />
          <Route path="/vendor/edit-product/:id" element={<EditProduct />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
          <Route path="/vendor/orders/:order_id" element={<VendorOrderDetails />} />
          <Route path="/vendor/profile" element={<VendorProfile />} />

        </Route>

      </Routes>
    </Router>
  );
};

export default App;
