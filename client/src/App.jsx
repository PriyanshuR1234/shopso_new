import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CustomerLayout from "./customer/CustomerLayout";
import VendorLayout from "./vendor/components/VendorLayout";
import UserLogin from "./customer/pages/Auth/UserLogin";
import UserSignup from "./customer/pages/Auth/UserSignup";
import UserProfile from "./customer/pages/UserProfile";
import UserOrders from "./customer/pages/UserOrders";

import HomePage from './customer/pages/HomePage/HomePage';
import Navigation from './customer/Navigation';
import ProductListing from './customer/pages/ProductListing/ProductListing.jsx';

import VendorDashboard from "./vendor/pages/VendorDashboard";
import AddProduct from "./vendor/pages/AddProduct";
import VendorLogin from "./vendor/pages/VendorLogin";
import EditProduct from "./vendor/pages/EditProduct";
import VendorSignup from "./vendor/pages/VendorSignup.jsx"
import VendorOrders from "./vendor/pages/VendorOrders";
import VendorOrderDetails from "./vendor/pages/VendorOrderDetails";

import VendorAnalytics from "./vendor/pages/VendorAnalytics";


import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/:category" element={<ProductListing />} />
        <Route path="/:category/:subcategory" element={<ProductListing />} />

        {/* ---------------- Customer Layout ---------------- */}
        <Route element={<CustomerLayout />}>
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/signup" element={<UserSignup />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<UserOrders />} />

          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<ProductListing />} />
          <Route path="/:category" element={<ProductListing />} />
          <Route path="/men/clothing/:category" element={<ProductListing />} />
          <Route path="/women/clothing/:category" element={<ProductListing />} />
        </Route>

        {/* ───────────── Vendor Login (NO LAYOUT) ───────────── */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/signup" element={<VendorSignup />} />

        {/* ---------------- Vendor Layout ---------------- */}
        <Route element={<VendorLayout />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/analytics" element={<VendorAnalytics />} />
          <Route path="/vendor/add-product" element={<AddProduct />} />
          <Route path="/vendor/edit-product/:id" element={<EditProduct />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
          <Route path="/vendor/orders/:order_id" element={<VendorOrderDetails />} />

        </Route>

      </Routes>
    </Router>
  );
};

export default App;
