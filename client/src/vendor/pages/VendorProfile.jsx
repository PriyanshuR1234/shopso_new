import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import supabase from "../../utils/supabaseClient";

export default function VendorProfile() {
    const vendorLocalStorage = JSON.parse(localStorage.getItem("vendor") || "{}");
    const vendor_id = vendorLocalStorage?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Fields
    const [shopName, setShopName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [aadhaarUrl, setAadhaarUrl] = useState("");

    // Images
    const [logoUrl, setLogoUrl] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");

    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    // Load Vendor Data
    useEffect(() => {
        if (!vendor_id) return;
        loadProfile();
    }, [vendor_id]);

    const loadProfile = async () => {
        const { data, error } = await supabase
            .from("vendors")
            .select("*")
            .eq("id", vendor_id)
            .single();

        if (error) {
            toast.error("Failed to load profile");
            setLoading(false);
            return;
        }

        setShopName(data.shop_name || "");
        setDescription(data.shop_description || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setGstNumber(data.gst_number || "");
        setAadhaarUrl(data.aadhaar_url || "");
        setLogoUrl(data.shop_logo || "");
        setBannerUrl(data.shop_banner || "");

        setLoading(false);
    };

    const uploadImage = async (file, prefix) => {
        const ext = file.name.split(".").pop();
        const fileName = `${prefix}_${vendor_id}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from("product-images") // Reusing bucket for simplicity as RLS is set
            .upload(fileName, file);

        if (error) throw error;

        const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

        return data.publicUrl;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let newLogo = logoUrl;
            let newBanner = bannerUrl;
            const { deleteFileByUrl } = await import("../../utils/storageUtils");

            // Upload new images if selected and cleanup old ones
            if (logoFile) {
                if (logoUrl) await deleteFileByUrl(logoUrl);
                newLogo = await uploadImage(logoFile, "logo");
            }
            if (bannerFile) {
                if (bannerUrl) await deleteFileByUrl(bannerUrl);
                newBanner = await uploadImage(bannerFile, "banner");
            }

            // Update Database
            const { error } = await supabase
                .from("vendors")
                .update({
                    shop_name: shopName,
                    shop_description: description,
                    address,
                    phone,
                    gst_number: gstNumber,
                    shop_logo: newLogo,
                    shop_banner: newBanner
                })
                .eq("id", vendor_id);

            if (error) throw error;

            // Update LocalStorage
            const updatedVendor = {
                ...vendorLocalStorage,
                shop_name: shopName,
                shop_logo: newLogo,
                shop_banner: newBanner
            };
            localStorage.setItem("vendor", JSON.stringify(updatedVendor));

            // Dispatch event to notify other components (e.g. Topbar/Sidebar)
            window.dispatchEvent(new Event("vendor-profile-update"));

            // Update State
            setLogoUrl(newLogo);
            setBannerUrl(newBanner);
            setLogoFile(null);
            setBannerFile(null);

            toast.success("Profile updated! 🎉");

            // Optional: short delay before reload if absolutely necessary, 
            // but the event should handle most UI updates.
            setTimeout(() => window.location.reload(), 800);

        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">

            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Shop Profile</h1>
                <p className="text-gray-500">Manage your store details and branding</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">

                {/* IMAGES SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Logo */}
                    <div className="space-y-2">
                        <label className="block font-semibold text-gray-700">Shop Logo</label>
                        <div
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-blue-500"); }}
                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("ring-2", "ring-blue-500"); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove("ring-2", "ring-blue-500");
                                if (e.dataTransfer.files?.[0]) setLogoFile(e.dataTransfer.files[0]);
                            }}
                            className="flex items-center gap-4 group p-2 rounded-2xl transition-all"
                        >
                            <label htmlFor="logo-upload" className="cursor-pointer relative">
                                <img
                                    src={logoFile ? URL.createObjectURL(logoFile) : (logoUrl || "https://placehold.co/100")}
                                    className="w-24 h-24 rounded-full object-cover border group-hover:opacity-80 transition"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <span className="bg-black/40 text-white text-[10px] px-2 py-1 rounded-full text-center">Change</span>
                                </div>
                            </label>
                            <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files[0])}
                                className="hidden"
                            />
                            <div className="text-xs text-gray-400">Drag logo here or click image</div>
                        </div>
                    </div>

                    {/* Banner */}
                    <div className="space-y-2">
                        <label className="block font-semibold text-gray-700">Shop Banner</label>
                        <div
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-blue-500"); }}
                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("ring-2", "ring-blue-500"); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove("ring-2", "ring-blue-500");
                                if (e.dataTransfer.files?.[0]) setBannerFile(e.dataTransfer.files[0]);
                            }}
                            className="space-y-2 group transition-all"
                        >
                            <label htmlFor="banner-upload" className="cursor-pointer block relative">
                                <img
                                    src={bannerFile ? URL.createObjectURL(bannerFile) : (bannerUrl || "https://placehold.co/400x120")}
                                    className="w-full h-32 rounded-xl object-cover border group-hover:opacity-80 transition"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <span className="bg-black/40 text-white px-4 py-2 rounded-full font-medium">Drop Banner Here</span>
                                </div>
                            </label>
                            <input
                                id="banner-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setBannerFile(e.target.files[0])}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                <hr />

                {/* DETAILS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="font-semibold text-gray-700">Shop Name</label>
                        <input
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="My Awesome Shop"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-semibold text-gray-700">Phone</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="+91 98765 43210"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-semibold text-gray-700">GST Number</label>
                        <input
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                            placeholder="22AAAAA0000A1Z5"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-semibold text-gray-700 flex items-center gap-2">
                            Aadhaar Card
                            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ Verified</span>
                        </label>
                        <div className="relative group">
                            <input
                                value="Securely Uploaded - Cannot be edited"
                                disabled
                                className="w-full p-3 border rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            {aadhaarUrl && (
                                <a
                                    href={aadhaarUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute right-3 top-3 text-sm text-blue-600 font-medium hover:underline"
                                >
                                    View Document
                                </a>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            * Identity documents are locked for security purposes. Contact Admin to update.
                        </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="font-semibold text-gray-700">Address</label>
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Shop 12, Market Street..."
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="font-semibold text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Tell us about your shop..."
                        />
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

            </div>
        </div>
    );
}
