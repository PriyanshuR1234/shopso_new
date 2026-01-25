import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";

export default function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        loadCart();
        window.addEventListener("cart-updated", loadCart);
        return () => window.removeEventListener("cart-updated", loadCart);
    }, []);

    const loadCart = () => {
        const items = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartItems(items);
    };

    const updateQuantity = (id, delta) => {
        const newCart = cartItems.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        });
        localStorage.setItem("cart", JSON.stringify(newCart));
        setCartItems(newCart);
        window.dispatchEvent(new Event("cart-updated"));
    };

    const removeItem = (id) => {
        const newCart = cartItems.filter(item => item.id !== id);
        localStorage.setItem("cart", JSON.stringify(newCart));
        setCartItems(newCart);
        window.dispatchEvent(new Event("cart-updated"));
    };

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                    <Link to="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {cartItems.map((item) => (
                        <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 border-b last:border-0 hover:bg-gray-50 transition">
                            <img src={item.image} className="w-24 h-24 rounded-xl object-cover border" alt={item.name} />

                            <div className="flex-grow text-center sm:text-left">
                                <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                                <p className="text-gray-500 text-sm">₹{item.price}</p>
                            </div>

                            <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-1">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white rounded-md transition">-</button>
                                <span className="font-semibold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white rounded-md transition">+</button>
                            </div>

                            <div className="text-right min-w-[80px]">
                                <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                            </div>

                            <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-2">✕</button>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                    <div className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                        Total: <span className="text-blue-600">₹{total}</span>
                    </div>
                    <button
                        onClick={() => navigate("/checkout")}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 active:translate-y-0"
                    >
                        Proceed to Checkout
                    </button>
                </div>

            </div>
            <Footer />
        </div>
    );
}
