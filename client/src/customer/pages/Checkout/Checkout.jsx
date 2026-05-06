import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../utils/supabaseClient";
import toast from "react-hot-toast";

export default function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));

    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");
    const [phone, setPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD"); // COD, Online
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem("cart") || "[]");
        if (items.length === 0) {
            toast.error("Cart is empty");
            navigate("/cart");
        }
        setCartItems(items);

        // Check phone verification status FIRST
        if (user) {
            supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single()
                .then(({ data }) => {
                    // Check if phone is verified
                    if (!data?.phone_verified) {
                        toast.error("Please verify your phone number before placing orders");
                        navigate("/verify-phone?redirect=checkout");
                        return;
                    }

                    // Pre-fill address from profile
                    if (data && (data.address || data.city)) {
                        setAddress(data.address || "");
                        setCity(data.city || "");
                        setZip(data.zip || "");
                        setPhone(data.phone || "");
                        setIsAddressConfirmed(true); // Default to confirmed if it exists
                    } else {
                        setIsEditingAddress(true); // Show form if no address saved
                    }
                });
        }
    }, []);

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const placeOrder = async () => {
        if (!user) {
            toast.error("Please login to place order");
            navigate("/user/login");
            return;
        }

        if (!isAddressConfirmed) {
            return toast.error("Please confirm your shipping address");
        }

        if (!address || !city || !zip) {
            return toast.error("Please fill all address fields");
        }

        setLoading(true);
        // ... rest of placeOrder ...

        try {
            // Group items by Vendor
            const ordersByVendor = {}; // { vendor_id: [items] }
            let skippedItemsCount = 0;

            cartItems.forEach(item => {
                const vId = item.vendor_id;

                if (!vId) {
                    console.warn(`Item ${item.name} (ID: ${item.id}) has no vendor_id. Skipping.`);
                    skippedItemsCount++;
                    return;
                }

                if (!ordersByVendor[vId]) ordersByVendor[vId] = [];
                ordersByVendor[vId].push(item);
            });

            if (skippedItemsCount > 0) {
                toast("Some items were removed due to missing seller info.", { icon: "⚠️" });
            }

            const vendorIds = Object.keys(ordersByVendor);

            if (vendorIds.length === 0) {
                toast.error("No valid items to order.");
                setLoading(false);
                return;
            }

            for (const vId of vendorIds) {
                const vendorItems = ordersByVendor[vId];
                const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                // 0. Update User Profile with Address (Ensure it's saved for next time)
                const { error: profileError } = await supabase
                    .from("users")
                    .update({
                        address: address,
                        city: city,
                        zip: zip
                    })
                    .eq("id", user.id);

                if (profileError) console.error("Failed to save address to profile:", profileError);

                // 1. Create Order
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .insert({
                        user_id: user.id,
                        vendor_id: vId,
                        total_price: vendorTotal,
                        status: "pending", // Default status
                        address: `${address}, ${city} - ${zip}`,
                        payment_method: paymentMethod,
                        payment_status: paymentMethod === "COD" ? "pending" : "paid"
                    })
                    .select()
                    .single();

                if (orderError) throw orderError;

                // 2. Create Order Items
                const orderItemsData = vendorItems.map(item => ({
                    order_id: orderData.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }));

                const { error: itemsError } = await supabase
                    .from("order_items")
                    .insert(orderItemsData);

                if (itemsError) throw itemsError;

                // 3. Decrement Stock for each item
                for (const item of vendorItems) {
                    const { error: stockError } = await supabase
                        .rpc("decrement_stock", {
                            row_id: item.id,
                            quantity: item.quantity
                        });

                    if (stockError) console.error("Stock update failed for", item.name, stockError);
                }
            }

            // Success
            localStorage.removeItem("cart");
            window.dispatchEvent(new Event("cart-updated"));
            toast.success("Order Placed Successfully! 🎉");
            navigate("/orders");

        } catch (err) {
            console.error("Order Error:", err);
            toast.error("Failed to place order. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* LEFT: Address Form */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Shipping Details</h2>

                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                        {!isEditingAddress ? (
                            <div className={`p-4 rounded-xl border-2 transition-all ${isAddressConfirmed ? 'border-green-500 bg-green-50' : 'border-blue-100 bg-blue-50'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Saved Address</h3>
                                        <p className="text-gray-600 mt-1">{address}</p>
                                        <p className="text-gray-600">{city} - {zip}</p>
                                        <p className="text-gray-600 flex items-center gap-2 mt-1">
                                            <span className="text-green-600">✓</span> Phone: {phone}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setIsEditingAddress(true); setIsAddressConfirmed(false); }}
                                        className="text-blue-600 font-semibold text-sm hover:underline"
                                    >
                                        Edit
                                    </button>
                                </div>
                                {!isAddressConfirmed ? (
                                    <button
                                        onClick={() => setIsAddressConfirmed(true)}
                                        className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                                    >
                                        Confirm this Address
                                    </button>
                                ) : (
                                    <div className="mt-4 flex items-center gap-2 text-green-600 font-bold">
                                        <span>✓ Address Confirmed</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                    <input className="w-full border p-3 rounded-lg mt-1" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <input className="w-full border p-3 rounded-lg mt-1" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                        <input className="w-full border p-3 rounded-lg mt-1" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="10001" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!address || !city || !zip) return toast.error("Please fill all details");
                                        setIsAddressConfirmed(true);
                                        setIsEditingAddress(false);
                                    }}
                                    className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
                                >
                                    Confirm Address
                                </button>
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold">Payment Method</h2>
                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="payment" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                            <span>Cash on Delivery (COD)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer opacity-50">
                            <input type="radio" name="payment" disabled />
                            <span>Online Payment (Coming Soon)</span>
                        </label>
                    </div>
                </div>

                {/* RIGHT: Order Summary */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Order Summary</h2>
                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.name} x {item.quantity}</span>
                                <span className="font-semibold">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <hr className="my-2" />
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span className="text-blue-600">₹{totalAmount}</span>
                        </div>

                        <button
                            onClick={placeOrder}
                            disabled={loading || !isAddressConfirmed}
                            className={`w-full text-white py-4 rounded-xl font-bold transition mt-6 disabled:bg-gray-400 ${!isAddressConfirmed ? 'bg-gray-500' : 'bg-black hover:bg-gray-800'}`}
                        >
                            {loading ? "Processing..." : isAddressConfirmed ? "Place Order" : "Confirm Address to Place Order"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
