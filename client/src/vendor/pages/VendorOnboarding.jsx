import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import { uploadImagesToCloudinary } from "../../api/cloudinary";
import toast from "react-hot-toast";

export default function VendorOnboarding() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [existingVendor, setExistingVendor] = useState(null);

    // Form Stats
    const [aadhaarImage, setAadhaarImage] = useState(null);
    const [shopName, setShopName] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/vendor/login");
                return;
            }
            setUserId(user.id);

            // Fetch User Details to pre-fill
            const { data: userProfile } = await supabase
                .from("users")
                .select("name, phone, role")
                .eq("id", user.id)
                .maybeSingle();

            if (userProfile?.role === 'customer') {
                // If they are here, they intend to be a vendor. 
                // We'll update their role on submit.
            }

            if (userProfile?.phone) setPhone(userProfile.phone);

            // Check if Vendor Profile already exists
            const { data: vendor } = await supabase
                .from("vendors")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (vendor) {
                setExistingVendor(vendor);
                setShopName(vendor.shop_name || "");
                setShopDescription(vendor.shop_description || "");
                if (vendor.phone) setPhone(vendor.phone); // Vendor phone takes precedence if set

                // If they already have aadhaar, they are done.
                if (vendor.aadhaar_url) {
                    const currentVendor = JSON.parse(localStorage.getItem("vendor") || "{}");
                    localStorage.setItem("vendor", JSON.stringify({ ...currentVendor, ...vendor }));
                    setTimeout(() => navigate("/vendor/dashboard"), 100);
                }
            } else if (userProfile) {
                // Pre-fill shop name from user name if new vendor
                setShopName(`${userProfile.name || 'My'}'s Shop`);
            }
        };
        checkSession();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!shopName.trim()) return toast.error("Shop Name is required");
        if (!phone.trim()) return toast.error("Phone Number is required");

        // If no existing aadhaar and no new image, validation error
        if (!existingVendor?.aadhaar_url && !aadhaarImage) {
            return toast.error("Please upload your Aadhaar Card");
        }

        setLoading(true);
        try {
            // 1. Upload Image if provided
            let publicUrl = existingVendor?.aadhaar_url || null;
            if (aadhaarImage) {
                const uploadedUrls = await uploadImagesToCloudinary([aadhaarImage]);
                if (!uploadedUrls || uploadedUrls.length === 0) throw new Error("Image upload failed");
                publicUrl = uploadedUrls[0];
            }

            // 2. Ensure Role is Vendor
            const { data: userCheck } = await supabase.from('users').select('role').eq('id', userId).single();
            if (userCheck?.role !== 'vendor') {
                await supabase.from('users').update({ role: 'vendor' }).eq('id', userId);
            }

            // 3. Create or Update Vendor Profile using RPC or Insert
            // RPC is safer for "Create if not exists" logic we need
            const { error: rpcError } = await supabase.rpc("create_vendor_profile", {
                p_user_id: userId,
                p_shop_name: shopName,
                p_shop_description: shopDescription,
                p_phone: phone,
                p_aadhaar_url: publicUrl
            });

            if (rpcError) throw rpcError;

            // 4. Force Update of Local Data
            const { data: newVendor } = await supabase
                .from("vendors")
                .select("*")
                .eq("user_id", userId)
                .single();

            localStorage.setItem("vendor", JSON.stringify(newVendor));

            toast.success("Profile verified successfully!");
            window.dispatchEvent(new Event("vendor-profile-update"));
            setTimeout(() => navigate("/vendor/dashboard"), 1000);

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-lg">
                <h1 className="text-3xl font-bold mb-2 text-center">Complete Your Profile 🏪</h1>
                <p className="text-gray-600 mb-8 text-center">
                    Tell us a bit about your shop and verify your identity to start selling.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Shop Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                        <input
                            type="text"
                            required
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none transition"
                            placeholder="e.g. Fashion Hub"
                        />
                    </div>

                    {/* Shop Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
                        <textarea
                            rows="2"
                            value={shopDescription}
                            onChange={(e) => setShopDescription(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none transition"
                            placeholder="What do you sell?"
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none transition"
                            placeholder="+91 98765 43210"
                        />
                    </div>

                    {/* Aadhaar Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Aadhaar Card</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:bg-gray-50 transition cursor-pointer relative text-center">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setAadhaarImage(e.target.files[0])}
                            />
                            {aadhaarImage ? (
                                <div className="text-green-600 font-medium break-all">
                                    📄 {aadhaarImage.name}
                                </div>
                            ) : existingVendor?.aadhaar_url ? (
                                <div className="text-blue-600 font-medium">
                                    ✅ Aadhaar Already Uploaded <span className="text-xs text-gray-500">(Upload new to replace)</span>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <span className="text-2xl block mb-1">📤</span>
                                    Click to Upload Identity Proof
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 mt-4"
                    >
                        {loading ? "Verifying & Creating Shop..." : "Complete Setup 🚀"}
                    </button>
                </form>
            </div>
        </div>
    );
}
