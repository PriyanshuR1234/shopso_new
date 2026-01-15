import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProductCard from '../../components/Product/ProductCard';
import Footer from '../../components/Footer/Footer';
import { mensKurta, shoes, saree, womenDress, allProducts } from '../../../data/products';
import { sortByDemand, filterByCategory } from '../../../utils/productUtils';

export default function ProductListing() {
    const { category } = useParams();
    const location = useLocation();
    const [sortBy, setSortBy] = useState('demand');

    // Filter states
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [priceRange, setPriceRange] = useState('all');
    const [minDiscount, setMinDiscount] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile filter toggle

    // Get base filtered products by category or search
    const { categoryProducts, title } = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('q');

        let products = allProducts;
        let pageTitle = "All Products";

        if (category) {
            products = filterByCategory(allProducts, category);
            const formatTitle = (str) => {
                if (!str) return "All Products";
                return str.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            };
            pageTitle = `${formatTitle(category)} Collection`;
        } else if (searchQuery) {
            const query = searchQuery.toLowerCase();
            products = allProducts.filter(p =>
                (p.title?.toLowerCase().includes(query)) ||
                (p.brand?.toLowerCase().includes(query)) ||
                (p.category?.toLowerCase().includes(query))
            );
            pageTitle = `Search Results for "${searchQuery}"`;
        }

        return {
            categoryProducts: products || [],
            title: pageTitle
        };
    }, [category, location.search]);

    // Derived filters from available products
    const brands = useMemo(() => {
        return [...new Set(categoryProducts.map(p => p.brand))].sort();
    }, [categoryProducts]);

    // Final filtered and sorted products
    const finalProducts = useMemo(() => {
        let result = [...categoryProducts];

        // 1. Filter by Brand
        if (selectedBrands.length > 0) {
            result = result.filter(p => selectedBrands.includes(p.brand));
        }

        // 2. Filter by Price
        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            result = result.filter(p => {
                const price = p.discountedPrice || p.price;
                if (max) return price >= min && price <= max;
                return price >= min;
            });
        }

        // 3. Filter by Discount
        if (minDiscount > 0) {
            result = result.filter(p => (p.discountPersent || 0) >= minDiscount);
        }

        // 4. Sort
        switch (sortBy) {
            case 'demand':
                return sortByDemand(result);
            case 'price-low':
                return result.sort((a, b) => (a.discountedPrice || 0) - (b.discountedPrice || 0));
            case 'price-high':
                return result.sort((a, b) => (b.discountedPrice || 0) - (a.discountedPrice || 0));
            case 'discount':
                return result.sort((a, b) => (b.discountPersent || 0) - (a.discountPersent || 0));
            default:
                return result;
        }
    }, [categoryProducts, sortBy, selectedBrands, priceRange, minDiscount]);

    // Handle Brand Toggle
    const toggleBrand = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    // Scroll to top on category change
    useEffect(() => {
        window.scrollTo(0, 0);
        setSelectedBrands([]);
        setPriceRange('all');
        setMinDiscount(0);
    }, [category]);

    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Colorful Hero Banner (Reverted Style) */}
            <div className="bg-gradient-to-r from-sky-400 to-blue-500 py-12 px-4 sm:px-6 lg:px-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-wide drop-shadow-md capitalize">
                        {title}
                    </h1>
                    <p className="text-sky-100 text-lg font-medium">
                        Explore {finalProducts.length} premium products
                    </p>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Toggle */}
                    <button
                        className="lg:hidden w-full py-3 bg-sky-600 text-white rounded-lg font-bold shadow-md hover:bg-sky-700 transition"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {/* Sidebar Filters */}
                    <div className={`lg:w-1/5 flex-shrink-0 space-y-8 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                        {/* Filters Header */}
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                            {(selectedBrands.length > 0 || priceRange !== 'all' || minDiscount > 0) && (
                                <button
                                    onClick={() => {
                                        setSelectedBrands([]);
                                        setPriceRange('all');
                                        setMinDiscount(0);
                                    }}
                                    className="text-sm text-red-500 font-semibold hover:text-red-700 hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Price Filter */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">Price Range</h4>
                            <div className="space-y-2">
                                {[
                                    { label: 'Any Price', value: 'all' },
                                    { label: 'Under ₹1,000', value: '0-999' },
                                    { label: '₹1,000 - ₹2,500', value: '1000-2500' },
                                    { label: '₹2,500 - ₹5,000', value: '2500-5000' },
                                    { label: 'Above ₹5,000', value: '5000-100000' },
                                ].map((option) => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="price"
                                            checked={priceRange === option.value}
                                            onChange={() => setPriceRange(option.value)}
                                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 ring-offset-0"
                                        />
                                        <span className={`text-sm ${priceRange === option.value ? 'text-sky-600 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Brand Filter */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">Brands</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {brands.map(brand => (
                                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => toggleBrand(brand)}
                                            className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 border-gray-300 ring-offset-0"
                                        />
                                        <span className={`text-sm ${selectedBrands.includes(brand) ? 'text-sky-600 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            {brand}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Discount Filter */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">Discount</h4>
                            <div className="space-y-2">
                                {[
                                    { label: '10% or more', value: 10 },
                                    { label: '30% or more', value: 30 },
                                    { label: '50% or more', value: 50 },
                                    { label: '70% or more', value: 70 },
                                ].map((option) => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="discount"
                                            checked={minDiscount === option.value}
                                            onChange={() => setMinDiscount(option.value)}
                                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 ring-offset-0"
                                        />
                                        <span className={`text-sm ${minDiscount === option.value ? 'text-sky-600 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {/* Sort Toolbar */}
                        <div className="flex flex-wrap items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-sm text-gray-600 font-medium hidden sm:block">
                                Showing {finalProducts.length} results
                            </span>

                            <div className="flex items-center gap-3 ml-auto">
                                <span className="text-sm font-medium text-gray-700">Sort By:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 py-1.5 pl-3 pr-8 shadow-sm cursor-pointer hover:border-sky-400"
                                >
                                    <option value="demand">🔥 Trending</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="discount">Best Discount</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {finalProducts.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                                {finalProducts.map((product, index) => (
                                    <ProductCard key={index} product={product} />
                                ))}
                            </div>
                        ) : (
                            // Empty State
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div className="text-6xl mb-4 opacity-50">🔍</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500 text-center max-w-md px-4">
                                    We couldn't find matches for your selected filters. Try clearing filters or browsing other categories.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedBrands([]);
                                        setPriceRange('all');
                                        setMinDiscount(0);
                                    }}
                                    className="mt-6 px-6 py-2 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
