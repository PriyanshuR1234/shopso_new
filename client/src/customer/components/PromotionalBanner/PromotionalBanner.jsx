import React from 'react';
import { Link } from 'react-router-dom';

const PromotionalBanner = () => {
    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Banner 1 */}
                <div className="relative group overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-900/80 to-transparent z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"
                        alt="Winter Collection"
                        className="w-full h-[300px] object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-1/2 left-8 sm:left-12 -translate-y-1/2 z-20 max-w-xs">
                        <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full mb-3 shadow-md">
                            LIMITED TIME
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                            Winter Warmers
                        </h3>
                        <p className="text-sky-100 mb-6 font-medium">Get cozy with our new collection. Up to 40% OFF on top brands.</p>
                        <Link to="/men/clothing/mens_kurta">
                            <button className="glass-blue px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95">
                                Shop Now
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Banner 2 */}
                <div className="relative group overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80"
                        alt="Flash Sale"
                        className="w-full h-[300px] object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-1/2 left-8 sm:left-12 -translate-y-1/2 z-20 max-w-xs">
                        <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-3 shadow-md animate-pulse">
                            FLASH SALE
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                            Top Brands
                        </h3>
                        <p className="text-blue-100 mb-6 font-medium">Zara, H&M, and more at unbeatable prices. Terms apply.</p>
                        <Link to="/women/clothing/women_dress">
                            <button className="glass-blue px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95">
                                View Offers
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionalBanner;
