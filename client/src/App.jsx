import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './customer/Navigation';
import HomePage from './customer/Pages/HomePage/HomePage';
import ProductListing from './customer/Pages/ProductListing/ProductListing';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-white">
                <Navigation />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<ProductListing />} />
                    <Route path="/:category" element={<ProductListing />} />
                    <Route path="/men/clothing/:category" element={<ProductListing />} />
                    <Route path="/women/clothing/:category" element={<ProductListing />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
