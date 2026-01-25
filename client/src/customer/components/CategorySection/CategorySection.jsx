import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../utils/supabaseClient';

export default function CategorySection() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            // Fetch categories
            const { data: cats } = await supabase.from('categories').select('*');
            if (!cats) return;

            // Fetch one image for each category (inefficient but works for small # of categories)
            const catsWithImages = await Promise.all(cats.map(async (c) => {
                const { data: products } = await supabase
                    .from('products')
                    .select('product_images(image_url)')
                    .eq('category_id', c.id)
                    .limit(1);

                const image = products?.[0]?.product_images?.[0]?.image_url
                    || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=300&h=300"; // Fallback

                return { ...c, image, path: `/${c.name.toLowerCase()}` };
                // Note: path logic might need to match App.jsx routes e.g. /:category
            }));

            setCategories(catsWithImages);
        };
        fetchCategories();
    }, []);

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
