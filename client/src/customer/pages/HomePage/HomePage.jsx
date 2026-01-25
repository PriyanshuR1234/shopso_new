import React, { useEffect, useState } from 'react';
import MainCarousel from '../../components/HomeCarousel/MainCarousel';
import HomeSectionCarousel from '../../components/HomeSectionCarousel/HomeSectionCarousel';
import PromotionalBanner from '../../components/PromotionalBanner/PromotionalBanner';
import Footer from '../../components/Footer/Footer';
import CategorySection from '../../components/CategorySection/CategorySection';
import TrustSection from '../../components/TrustSection/TrustSection';
import supabase from '../../../utils/supabaseClient';
import { allProducts } from '../../../data/products'; // Keep for Trending fallback if needed

export default function HomePage() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            // 1. Check Cache
            const cached = localStorage.getItem("categories_cache");
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const isFresh = Date.now() - timestamp < 60 * 60 * 1000; // 1 hr
                if (isFresh) {
                    setCategories(data);
                    return;
                }
            }

            // 2. Fetch if no cache or stale
            const { data, error } = await supabase.from('categories').select('*');
            if (error) console.error("Error fetching categories:", error);

            if (data) {
                setCategories(data);
                // 3. Set Cache
                localStorage.setItem("categories_cache", JSON.stringify({
                    data: data,
                    timestamp: Date.now()
                }));
            }
        };
        loadCategories();
    }, []);

    return (
        <div className="bg-sky-50">
            {/* Main Banner Carousel */}
            <MainCarousel />

            {/* Trust Badges */}
            <TrustSection />

            {/* Shop by Category Section */}
            <CategorySection />

            {/* Trending Section - High Demand Products Only */}
            <div className="space-y-8 py-8 px-4 lg:px-8">
                {/* Global Trending (Mixed) */}
                <HomeSectionCarousel
                    data={allProducts}
                    sectionName="Trending Now 🔥"
                    showOnlyTrending={true}
                />

                {/* Promotional Banner - Moved here as requested */}
                <PromotionalBanner />

                {/* Dynamic Category Sections */}
                {categories.map((category) => (
                    <HomeSectionCarousel
                        key={category.id}
                        categoryId={category.id}
                        sectionName={`${category.name} Collection`}
                    />
                ))}
            </div>

            {/* Deal Section */}
            <section className="bg-gradient-to-r from-sky-500 to-blue-600 py-16 my-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Mega Sale! Up to 70% OFF
                    </h2>
                    <p className="text-xl text-sky-100 mb-8">
                        Limited time offer on all categories
                    </p>
                    <button className="bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0">
                        Shop Now
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}

