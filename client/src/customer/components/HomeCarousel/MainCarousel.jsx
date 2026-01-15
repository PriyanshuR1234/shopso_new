import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const mainCarouselData = [
    {
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=600&fit=crop",
        path: "/products?category=women",
        title: "SHOPSO WOMEN'S COLLECTION",
        subtitle: "Upto 70% OFF on Latest Trends",
        cta: "Shop Now"
    },
    {
        image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&h=600&fit=crop",
        path: "/products?category=men",
        title: "MEN'S FASHION FEST",
        subtitle: "Premium Quality at Best Prices",
        cta: "Explore Collection"
    },
    {
        image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600&h=600&fit=crop",
        path: "/products?category=shoes",
        title: "FOOTWEAR FIESTA",
        subtitle: "Step into Style - Flat 50% OFF",
        cta: "Shop Footwear"
    },
    {
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=600&fit=crop",
        path: "/products?category=saree",
        title: "ETHNIC ELEGANCE",
        subtitle: "Traditional Wear for Every Occasion",
        cta: "View Sarees"
    },
];

export default function MainCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === mainCarouselData.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Auto-slide every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? mainCarouselData.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === mainCarouselData.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleSlideClick = () => {
        navigate(mainCarouselData[currentIndex].path);
    };

    return (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900">
            {/* Slides */}
            <div
                className="flex h-full transition-transform duration-700 ease-in-out cursor-pointer"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                onClick={handleSlideClick}
            >
                {mainCarouselData.map((item, index) => (
                    <div
                        key={index}
                        className="min-w-full h-full relative group"
                    >
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                        {/* Text Content Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-4xl">
                            <div className="text-white space-y-4 md:space-y-6">
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                                    {item.title}
                                </h1>
                                <p className="text-xl md:text-2xl lg:text-3xl font-medium text-yellow-400">
                                    {item.subtitle}
                                </p>
                                <button className="mt-4 bg-white text-gray-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 hover:text-gray-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 group-hover:animate-pulse">
                                    {item.cta} →
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Previous Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                }}
                className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 hover:bg-white p-3 md:p-4 rounded-full shadow-2xl transition-all z-10 hover:scale-110"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Next Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                }}
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 hover:bg-white p-3 md:p-4 rounded-full shadow-2xl transition-all z-10 hover:scale-110"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-10">
                {mainCarouselData.map((_, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            goToSlide(index);
                        }}
                        className={`h-2 md:h-3 rounded-full transition-all ${index === currentIndex
                                ? 'w-8 md:w-10 bg-white shadow-lg'
                                : 'w-2 md:w-3 bg-white/50 hover:bg-white/75'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
