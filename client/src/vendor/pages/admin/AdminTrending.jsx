import React, { useState, useEffect } from "react";
import supabase from "../../../utils/supabaseClient";
import { toast } from "react-hot-toast";

export default function AdminTrending() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Fetch products sorted by sales (sold) descending with images
            const { data, error } = await supabase
                .from("products")
                .select("*, product_images(*)")
                .order("sold", { ascending: false });

            if (error) throw error;
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products:", err);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const toggleTrending = async (productId, currentStatus) => {
        try {
            const { error } = await supabase
                .from("products")
                .update({ is_trending: !currentStatus })
                .eq("id", productId);

            if (error) throw error;

            setProducts(prev =>
                prev.map(p => p.id === productId ? { ...p, is_trending: !currentStatus } : p)
            );
            toast.success(`Product ${!currentStatus ? "added to" : "removed from"} trending`);
        } catch (err) {
            console.error("Error updating trending status:", err);
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading catalog...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Trending Control</h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage featured products on the homepage</p>
                </div>
                <div className="bg-sky-50 border border-sky-100 px-4 py-2 rounded-xl">
                    <span className="text-sky-600 text-[10px] font-black uppercase tracking-widest">
                        {products.filter(p => p.is_trending).length} Products Live
                    </span>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Product manifest</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Sales Volume</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Live Status</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-sky-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 shadow-inner p-1">
                                            <img
                                                src={product.product_images?.[0]?.image_url || "https://placehold.jp/100x100.png?text=No%20Image"}
                                                alt=""
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 group-hover:text-sky-600 transition-colors line-clamp-1">{product.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">{product.brand || 'Generic Brand'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 font-black text-2xl tracking-tighter">{product.sold || 0}</span>
                                        <span className="text-[10px] text-sky-500 font-black uppercase tracking-widest italic">Units Sold</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {product.is_trending ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center w-fit gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Super Trending
                                            </span>
                                            <span className="text-[8px] text-gray-400 font-bold uppercase ml-1">Live on Homepage</span>
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                            Off Track
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => toggleTrending(product.id, product.is_trending)}
                                        className={`px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${product.is_trending
                                                ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white"
                                                : "bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-600 hover:text-white"
                                            }`}
                                    >
                                        {product.is_trending ? "Remove from Trending" : "Mark as Trending"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
