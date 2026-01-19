import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CustomerLayout from "./customer/CustomerLayout";
import VendorLayout from "./vendor/components/VendorLayout";

import HomePage from './customer/pages/HomePage/HomePage';
import Navigation from './customer/Navigation';
import ProductListing from './customer/pages/ProductListing/ProductListing';

import VendorDashboard from "./vendor/pages/VendorDashboard";
import AddProduct from "./vendor/pages/AddProduct";
import VendorLogin from "./vendor/pages/VendorLogin";
import EditProduct from "./vendor/pages/EditProduct";

import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <Router>
        <Toaster position="top-right" />
      <Routes>

        {/* ---------------- Customer Layout ---------------- */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<ProductListing />} />
          <Route path="/:category" element={<ProductListing />} />
          <Route path="/men/clothing/:category" element={<ProductListing />} />
          <Route path="/women/clothing/:category" element={<ProductListing />} />
        </Route>

        {/* ───────────── Vendor Login (NO LAYOUT) ───────────── */}
        <Route path="/vendor/login" element={<VendorLogin />} />

        {/* ---------------- Vendor Layout ---------------- */}
        <Route element={<VendorLayout />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/add-product" element={<AddProduct />} />
          <Route path="/vendor/edit-product/:id" element={<EditProduct />} />
        </Route>

      </Routes>
    </Router>
  );
};

export default App;
