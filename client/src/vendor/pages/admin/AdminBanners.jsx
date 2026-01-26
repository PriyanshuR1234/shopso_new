import React, { useState, useEffect } from "react";
import supabase from "../../../utils/supabaseClient";
import { toast } from "react-hot-toast";
import { uploadImagesToCloudinary } from "../../../api/cloudinary";

export default function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [bannerFile, setBannerFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        path: "/",
        cta: "Shop Now",
        order_index: 0
    });

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("homepage_banners")
                .select("*")
                .order("order_index", { ascending: true });

            if (error) throw error;
            setBanners(data);
        } catch (err) {
            console.error("Error fetching banners:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, []);

    const handleFile = (file) => {
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        // Revoke old preview to avoid memory leaks
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setBannerFile(file);
        toast.success("Image staged for deployment");
    };

    const onDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const uploadToSupabase = async (file) => {
        const path = `banner_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from("product-images") // Using verified existing bucket for maximum reliability
            .upload(path, file);

        if (error) {
            // If bucket doesn't exist, this might fail, but product-images is verified in AddProduct.jsx
            throw new Error("Supabase upload failed: " + error.message);
        }

        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bannerFile) {
            toast.error("Please provide a banner image");
            return;
        }

        try {
            setUploading(true);
            let finalUrl = "";

            // 1. Primary: Cloudinary
            try {
                const urls = await uploadImagesToCloudinary([bannerFile]);
                if (urls && urls.length > 0) {
                    finalUrl = urls[0];
                    toast.success("Deployed via Cloudinary ☁️");
                }
            } catch (cloudinaryErr) {
                console.warn("Cloudinary failed, attempting Supabase fallback:", cloudinaryErr);

                // 2. Fallback: Supabase Storage
                toast.loading("Cloudinary preset mismatch. Falling back to Supabase...", { id: "upload-status" });
                finalUrl = await uploadToSupabase(bannerFile);
                toast.success("Deployed via Supabase Fallback 🛡️", { id: "upload-status" });
            }

            if (!finalUrl) throw new Error("All upload methods failed");

            const finalData = {
                ...formData,
                image_url: finalUrl
            };

            // 3. Database Save
            const { error: dbError } = await supabase
                .from("homepage_banners")
                .insert([finalData]);

            if (dbError) throw dbError;

            toast.success("Banner is now Live! 🚀");
            setShowForm(false);
            resetForm();
            fetchBanners();
        } catch (err) {
            console.error("Deployment error:", err);
            toast.error("Deployment failed: " + err.message, { id: "upload-status" });
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: "", subtitle: "", path: "/", cta: "Shop Now", order_index: 0 });
        setBannerFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
    };

    const deleteBanner = async (id) => {
        if (!window.confirm("Delete this banner?")) return;
        try {
            const { error } = await supabase
                .from("homepage_banners")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Banner removed");
            fetchBanners();
        } catch (err) {
            toast.error("Failed to delete banner");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Syncing Banners...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">Banner Logistics</h2>
                    <p className="text-sky-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">Atomic Deployment Suite</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) resetForm();
                    }}
                    className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${showForm
                        ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white"
                        : "bg-black text-white hover:bg-sky-600 shadow-xl shadow-black/10"
                        }`}
                >
                    {showForm ? "Cancel Operation" : "New Deployment"}
                </button>
            </div>

            {showForm && (
                <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 p-8 rounded-[3rem] shadow-2xl overflow-hidden relative">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                            {/* Image Selection Area (Drag & Drop) */}
                            <div className="lg:col-span-1 space-y-4">
                                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Image Asset</label>
                                <div
                                    onDragEnter={onDrag}
                                    onDragLeave={onDrag}
                                    onDragOver={onDrag}
                                    onDrop={onDrop}
                                    className={`relative aspect-square rounded-[2rem] border-3 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden group ${dragActive ? 'border-sky-500 bg-sky-50' :
                                        previewUrl ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    {previewUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={previewUrl} alt="Ready" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white text-[10px] font-black uppercase">Drop new to change</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <input type="file" onChange={(e) => handleFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                                            <div className="text-center p-6">
                                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-sky-500">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                </div>
                                                <p className="text-gray-900 font-black text-[11px] uppercase tracking-tighter">Drag & Drop</p>
                                                <p className="text-gray-400 text-[9px] font-bold uppercase mt-1 tracking-widest">or click to browse</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Text Metadata Area */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Headline Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-black focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner placeholder-gray-400"
                                            placeholder="e.g. SHOP NOW & SAVE BIG"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Offer Subtext</label>
                                        <input
                                            type="text"
                                            name="subtitle"
                                            value={formData.subtitle}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner placeholder-gray-400"
                                            placeholder="e.g. Upto 70% OFF on all items"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">App Route</label>
                                        <input
                                            type="text"
                                            name="path"
                                            value={formData.path}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-mono text-[10px] focus:outline-none focus:border-sky-500 transition-all shadow-inner border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Action Button (CTA)</label>
                                        <input
                                            type="text"
                                            name="cta"
                                            value={formData.cta}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-black focus:outline-none focus:border-sky-500 transition-all shadow-inner border-gray-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Visual Priority (Index)</label>
                                        <input
                                            type="number"
                                            name="order_index"
                                            value={formData.order_index}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 font-black focus:outline-none focus:border-sky-500 transition-all shadow-inner border-gray-200"
                                        />
                                    </div>
                                </div>

                                {/* REAL-TIME PREVIEW CARD */}
                                {previewUrl && (
                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Deployment Layout Preview</h3>
                                        <div className="relative w-full aspect-[21/8] rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 bg-gray-50">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center px-12 md:px-20 text-white">
                                                <h4 className="text-2xl md:text-5xl font-black uppercase tracking-tighter italic leading-none animate-in slide-in-from-left duration-500">{formData.title || "Headline Title"}</h4>
                                                <p className="text-sky-400 font-black text-[10px] md:text-sm uppercase tracking-[0.2em] mt-3 animate-in fade-in delay-200 duration-500">{formData.subtitle || "Offer Subtext Section"}</p>
                                                <div className="mt-8 animate-in slide-in-from-bottom-2 duration-500">
                                                    <span className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl">
                                                        {formData.cta} →
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="absolute top-6 left-6 bg-sky-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/50 shadow-xl">Live Preview Mode</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-12 flex justify-end gap-4 border-t border-gray-100 pt-8">
                            <button
                                type="submit"
                                disabled={uploading}
                                className={`bg-gray-900 text-white px-12 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-black/20 flex items-center gap-3 ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black hover:scale-105 active:scale-95'}`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                        Atomic Syncing...
                                    </>
                                ) : (
                                    <>Execute Deployment 🚀</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Existing Banners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                {banners.map((banner) => (
                    <div key={banner.id} className="group relative bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                        <div className="aspect-[16/10] relative overflow-hidden">
                            <img src={banner.image_url} alt="" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                            <div className="absolute bottom-6 left-8 right-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic leading-none">{banner.title}</h3>
                                <p className="text-sky-400 text-[9px] font-black uppercase tracking-widest mt-2">{banner.subtitle}</p>
                            </div>
                            <button
                                onClick={() => deleteBanner(banner.id)}
                                className="absolute top-4 right-4 bg-rose-500/90 hover:bg-rose-600 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                        <div className="p-6 bg-gray-50/50 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Order</span>
                                        <span className="text-gray-900 font-black italic">#{banner.order_index}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Action</span>
                                        <span className="text-sky-600 font-black text-[10px] uppercase italic">{banner.cta}</span>
                                    </div>
                                </div>
                                <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest text-right">
                                    Route: <span className="text-gray-900 block mt-0.5 font-mono">{banner.path}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
