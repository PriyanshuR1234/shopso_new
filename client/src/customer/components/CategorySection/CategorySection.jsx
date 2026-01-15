import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
    {
        name: "Men's Kurtas",
        image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=300&h=300",
        path: "/men/clothing/mens_kurta"
    },
    {
        name: "Women's Sarees",
        image: "https://images.unsplash.com/photo-1610189012906-4c0aa9b2b52b?auto=format&fit=crop&q=80&w=300&h=300",
        path: "/women/clothing/saree"
    },
    {
        name: "Women's Dresses",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300&h=300",
        path: "/women/clothing/women_dress"
    },
    {
        name: "Men's Shoes",
        image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&q=80&w=300&h=300",
        path: "/men/footwear/shoes"
    },
    {
        name: "Women's Tops",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=300&h=300",
        path: "/women/clothing/tops"
    },
    {
        name: "Men's Jeans",
        image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=300&h=300",
        path: "/men/clothing/men_jeans"
    }
];

export default function CategorySection() {
    const navigate = useNavigate();

    return (
        <div className="py-8 px-4 lg:px-8 bg-white">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 px-2 text-center sm:text-left">Shop by Category</h2>
            <div className="flex overflow-x-auto gap-4 md:gap-8 pb-4 px-2 scrollbar-hide justify-start sm:justify-center lg:justify-start">
                {categories.map((item) => (
                    <div
                        key={item.name}
                        className="flex flex-col items-center flex-shrink-0 cursor-pointer group w-24 sm:w-32 hover:bg-white/50 p-2 rounded-xl transition-all duration-300"
                        onClick={() => navigate(item.path)}
                    >
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-sky-300 transition-all duration-300">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <p className="mt-3 text-xs sm:text-sm font-medium text-gray-700 group-hover:text-sky-600 text-center leading-tight">
                            {item.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
