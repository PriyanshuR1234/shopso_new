import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    // Generate star rating (mock - could be from product data)
    const rating = 4; // Default 4 stars

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            className="group cursor-pointer flex flex-col bg-sky-50/30 backdrop-blur-md rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/40 hover:border-sky-300 transform hover:-translate-y-2 relative shadow-sm h-full"
        >
            {/* Image Container */}
            <div className="w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                <img
                    src={product.imageUrl}
                    alt={product.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://placehold.jp/400x500.png?text=No%20Image';
                    }}
                />
                {product.discountPersent && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold rounded-md shadow-lg animate-pulse z-10">
                        {product.discountPersent}% OFF
                    </div>
                )}
                {/* Trending Badge */}
                {product.demand >= 70 && (
                    <div className="absolute top-2 right-2 glass-blue px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold rounded-md z-10">
                        ⭐ TRENDING
                    </div>
                )}
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Quick View button on hover */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="glass-blue px-4 py-1.5 rounded-full text-xs font-semibold">
                        Quick View
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-2 sm:p-3 flex flex-col flex-grow bg-white/10">
                {/* Brand */}
                <p className="text-[9px] sm:text-xs font-bold text-sky-600 uppercase tracking-wider mb-0.5">
                    {product.brand}
                </p>

                {/* Title */}
                <h3 className="text-[10px] sm:text-sm font-semibold text-gray-900 mb-1 line-clamp-2 h-7 sm:h-10 leading-tight">
                    {product.title}
                </h3>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(5)].map((_, index) => (
                        <svg
                            key={index}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                    <span className="text-[9px] sm:text-xs text-gray-600 ml-1">(4.0)</span>
                </div>

                {/* Price */}
                <div className="mt-auto flex items-center gap-1 sm:gap-2 flex-wrap">
                    <span className="text-xs sm:text-lg font-bold text-gray-900">₹{product.discountedPrice}</span>
                    {product.price > product.discountedPrice && (
                        <>
                            <span className="text-[9px] sm:text-sm text-gray-500 line-through">₹{product.price}</span>
                            <span className="text-[9px] sm:text-xs font-bold text-green-600">
                                {product.discountPercent}% OFF
                            </span>
                        </>
                    )}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // This logic should match Add to Cart in ProductDetails or be a quick add
                        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                        const existingIndex = cart.findIndex((item) => item.id === product.id);
                        if (existingIndex >= 0) {
                            cart[existingIndex].quantity += 1;
                        } else {
                            cart.push({
                                id: product.id,
                                name: product.title,
                                price: product.discountedPrice || product.price,
                                image: product.imageUrl,
                                vendor_id: product.vendor_id || product.vendorId, // Ensure mapped correctly
                                quantity: 1
                            });
                        }
                        localStorage.setItem("cart", JSON.stringify(cart));
                        window.dispatchEvent(new Event("cart-updated"));
                        const toast = require("react-hot-toast").toast; // Lazy require to avoid import issues if not top-level
                        toast.success("Added to cart");
                    }}
                    className="mt-2 w-full glass-blue py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-semibold active:scale-95"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
