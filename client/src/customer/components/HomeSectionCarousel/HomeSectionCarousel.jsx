import React, { useRef, useMemo, useState, useEffect } from 'react';
import ProductCard from '../Product/ProductCard';
import { getTrendingProducts, sortByDemand } from '../../../utils/productUtils';
import supabase from '../../../utils/supabaseClient';

export default function HomeSectionCarousel({ data, categoryId, sectionName, showOnlyTrending = false }) {
    const scrollContainerRef = useRef(null);
    const [fetchedProducts, setFetchedProducts] = useState([]);

    // Mapper utility (same as ProductListing)
    const mapProduct = (p) => {
        const price = p.price || 0;
        const discountedPrice = p.discounted_price || price;
        const discountPercent = p.discount_percent || (price > discountedPrice ? Math.round(((price - discountedPrice) / price) * 100) : 0);

        return {
            id: p.id,
            title: p.name,
            brand: p.brand || "Brand",
            price: price,
            discountedPrice: discountedPrice,
            discountPercent: discountPercent,
            demand: p.sold || 0,
            imageUrl: p.product_images?.[0]?.image_url || "https://placehold.jp/400x500.png?text=No%20Image",
            vendor_id: p.vendor_id,
        };
    };

    useEffect(() => {
        if (categoryId) {
            const fetchProducts = async () => {
                const { data: products } = await supabase
                    .from('products')
                    .select('*, product_images(*)')
                    .eq('category_id', categoryId)
                    .limit(10);

                if (products) {
                    setFetchedProducts(products.map(mapProduct));
                }
            };
            fetchProducts();
        }
    }, [categoryId]);

    // Process data: Use passed data OR fetched data
    const finalData = data || fetchedProducts;

    // Filter for trending if requested, then sort by demand
    const processedData = useMemo(() => {
        let items = finalData || [];
        if (showOnlyTrending) {
            // If fetching trending dynamically, we might need a different query, 
            // but for now relying on utility if 'data' is passed or if we just want to filter the fetched set.
            // Note: getTrendingProducts util expects a large list to filter from.
            // If we fetched specific category, we might not want to filter further unless requested.
            items = getTrendingProducts(items);
        }
        return sortByDemand(items);
    }, [finalData, showOnlyTrending]);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320;
            const newScrollPosition = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollPosition,
                behavior: 'smooth'
            });
        }
    };

    if (processedData.length === 0) return null;

    return (
        <div className="relative px-4 lg:px-8 py-8 mb-8">
            <div className="max-w-[1400px] mx-auto relative group">
                {/* Minimalistic Glassmorphic Header */}
                <div className="absolute -top-6 left-0 right-0 flex justify-between items-end mb-6 px-4 z-10 pointer-events-none">
                    <div className="relative pointer-events-auto">
                        <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-2xl -m-4 shadow-lg border border-white/50" />
                        <h2 className="relative text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent px-2 py-1">
                            {sectionName}
                        </h2>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full glass-blue text-white active:scale-95"
                            aria-label="Scroll left"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full glass-blue text-white active:scale-95"
                            aria-label="Scroll right"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable Product Container */}
                <div className="pt-12 pb-4">
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2 -mx-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {processedData.map((item, index) => (
                            <div key={index} className="flex-none w-[180px] sm:w-[200px] md:w-[240px] lg:w-[260px]">
                                <ProductCard product={item} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
