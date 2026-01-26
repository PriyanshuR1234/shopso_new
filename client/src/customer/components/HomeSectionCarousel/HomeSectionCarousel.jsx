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
            is_trending: p.is_trending,
        };
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let query = supabase.from('products').select('*, product_images(*)');

                if (showOnlyTrending) {
                    // Fetch manually marked trending products prioritized, then by sales
                    query = query.filter('is_trending', 'eq', true).limit(15);
                } else if (categoryId) {
                    query = query.eq('category_id', categoryId).limit(10);
                } else {
                    return; // Nothing to fetch
                }

                const { data: products, error } = await query;
                if (error) throw error;
                if (products) {
                    setFetchedProducts(products.map(mapProduct));
                }
            } catch (err) {
                console.error("HomeSectionCarousel Fetch Error:", err);
            }
        };
        fetchProducts();
    }, [categoryId, showOnlyTrending]);

    // Process data: Use passed data OR fetched data
    const finalData = data || fetchedProducts;

    const processedData = useMemo(() => {
        let items = finalData || [];
        // If we already fetched trending specifically, we don't need to filter by threshold again
        // as the DB query already handled it. Just sort.
        return sortByDemand(items);
    }, [finalData]);

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
