import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../../utils/supabaseClient";
import toast from "react-hot-toast";
import Footer from "../../components/Footer/Footer";

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*, product_images(*)")
                .eq("id", id)
                .single();

            if (error) {
                toast.error("Product not found");
                navigate("/");
                return;
            }

            setProduct(data);
            if (data.product_images?.length > 0) {
                setSelectedImage(data.product_images[0].image_url);
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id, navigate]);

    const addToCart = () => {
        if (!product || !product.id || !product.vendor_id) {
            return toast.error("Invalid product details. Cannot add to cart.");
        }

        const cart = JSON.parse(localStorage.getItem("cart") || "[]");

        // Check if item exists
        const existingIndex = cart.findIndex((item) => item.id === product.id);

        if (existingIndex >= 0) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: selectedImage || "https://via.placeholder.com/150",
                vendor_id: product.vendor_id,
                quantity: 1
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cart-updated")); // Notify Navigation/Cart
        toast.success("Added to cart 🛒");
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* IMAGE GALLERY */}
                    <div className="space-y-4">
                        <div className="aspect-square w-full rounded-2xl overflow-hidden border bg-gray-100">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-full object-cover object-center"
                            />
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.product_images?.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => setSelectedImage(img.image_url)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImage === img.image_url ? 'border-blue-600' : 'border-transparent'}`}
                                >
                                    <img src={img.image_url} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                            <p className="text-sm text-gray-500 mt-1">Brand: {product.brand || "Generic"}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                            {product.stock > 0 ? (
                                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">In Stock</span>
                            ) : (
                                <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">Out of Stock</span>
                            )}
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                            {product.description}
                        </p>

                        <div className="pt-6 border-t">
                            <button
                                onClick={addToCart}
                                disabled={product.stock <= 0}
                                className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
