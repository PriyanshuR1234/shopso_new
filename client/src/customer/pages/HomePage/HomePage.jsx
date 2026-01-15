import React from 'react';
import MainCarousel from '../../components/HomeCarousel/MainCarousel';
import HomeSectionCarousel from '../../components/HomeSectionCarousel/HomeSectionCarousel';
import PromotionalBanner from '../../components/PromotionalBanner/PromotionalBanner';
import Footer from '../../components/Footer/Footer';
import CategorySection from '../../components/CategorySection/CategorySection';
import TrustSection from '../../components/TrustSection/TrustSection';
import { mensKurta, shoes, saree, womenDress, allProducts } from '../../../data/products';

export default function HomePage() {
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
                <HomeSectionCarousel
                    data={allProducts}
                    sectionName="Trending Now 🔥"
                    showOnlyTrending={true}
                />

                {/* Category Sections - Sorted by Demand */}
                <HomeSectionCarousel data={mensKurta} sectionName="Men's Collection" />
                <HomeSectionCarousel data={womenDress} sectionName="Women's Fashion" />

                <PromotionalBanner />

                <HomeSectionCarousel data={saree} sectionName="Traditional Sarees" />
                <HomeSectionCarousel data={shoes} sectionName="Footwear Collection" />
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

