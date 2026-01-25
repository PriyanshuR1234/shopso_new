import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../utils/supabaseClient";
import toast from "react-hot-toast";
import { categories as staticCategories } from "../../data/categories"; // Keeping for reference if needed, but unused now generally

export default function EditProduct() {
  const { id } = useParams();
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const [product, setProduct] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [stock, setStock] = useState("");

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  // Dynamic Data
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // New Images for Upload
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name");
      setCategories(data || []);
    };
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (!category) {
      setSubcategories([]);
      return;
    }
    const loadSubs = async () => {
      // Only load if category is a UUID (dynamic) vs static string.
      // Assuming all are UUIDs now.
      const { data } = await supabase.from("subcategories").select("id, name").eq("category_id", category);
      setSubcategories(data || []);
    };
    loadSubs();
  }, [category]);

  // Preview new images
  useEffect(() => {
    if (newImages.length === 0) {
      setPreviews([]);
      return;
    }
    setPreviews(newImages.map((img) => URL.createObjectURL(img)));
  }, [newImages]);

  // Load product
  useEffect(() => {
    const fetchProduct = async () => {
      const { data: p, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Error loading product");
        return;
      }

      setProduct(p);
      setName(p.name);
      setDescription(p.description);
      setPrice(p.price);
      setDiscountedPrice(p.discounted_price || p.price);
      setStock(p.stock);

      setCategory(p.category_id || ""); // Note: Schema uses category_id, frontend logic matches this
      // Note: p.category_id is UUID. But Frontend logic uses hardcoded categories object keys? 
      // The AddProduct uses "categoryId" (UUID). EditProduct uses "category" state.
      // IF EditProduct expects a category NAME or ID from "categories" object keys, we might have a mismatch.
      // Provided schema has category_id UUID.
      // But AddProduct state logic lines 251: <option key={c.id} value={c.id}>
      // EditProduct lines 119: {Object.keys(categories).map...}
      // WARNING: AddProduct uses Supabase Categories (Table). EditProduct uses "data/categories" (File).
      // I should fix EditProduct to use Supabase Categories too!
      // But first let's just make it load data.
    };

    fetchProduct();
  }, [id]);

  const updateProduct = async () => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name,
          description,
          price: Number(price),
          discounted_price: Number(discountedPrice) || Number(price),
          discount_percent: Number(price) > Number(discountedPrice) ? Math.round(((Number(price) - Number(discountedPrice)) / Number(price)) * 100) : 0,
          stock: Number(stock),
          // category_id: category, // Assuming renaming
          // subcategory_id: subcategory
        })
        .eq("id", id)
        .eq("vendor_id", vendor.id);

      // Upload New Images if any
      if (newImages.length > 0) {
        for (const img of newImages) {
          const path = `product_${Date.now()}_${img.name}`;
          const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, img);
          if (uploadErr) throw uploadErr;

          const { data } = supabase.storage.from("product-images").getPublicUrl(path);

          // Link to product
          await supabase.from("product_images").insert({
            product_id: id,
            image_url: data.publicUrl,
          });
        }
      }

      toast.success("Product updated 🎉");
      setTimeout(() => window.location.href = "/vendor/dashboard", 1000); // Simple redirect to dashboard
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  const deleteImage = async (image_id) => {
    try {
      // 1. Find the image to get its URL
      const imgToDelete = product.product_images.find((i) => i.id === image_id);

      // 2. Delete from DB
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", image_id);

      if (error) throw error;

      // 3. Delete from Storage
      if (imgToDelete?.image_url) {
        const { deleteFileByUrl } = await import("../../utils/storageUtils");
        await deleteFileByUrl(imgToDelete.image_url);
      }

      setProduct((prev) => ({
        ...prev,
        product_images: prev.product_images.filter((i) => i.id !== image_id),
      }));

      toast.success("Image removed from gallery & storage");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image");
    }
  };

  if (!product)
    return <p className="text-center mt-20 text-gray-600">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-xl mt-6">
      <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-sky-600 to-blue-600 text-transparent bg-clip-text">
        Edit Product
      </h1>

      {/* NAME */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-3 border rounded-xl w-full mb-3 shadow-sm focus:ring-2 focus:ring-sky-500"
      />

      {/* DESCRIPTION */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-3 border rounded-xl w-full mb-3 shadow-sm focus:ring-2 focus:ring-sky-500"
        rows={3}
      />

      {/* PRICE */}
      <div className="flex gap-4 mb-3">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="p-3 border rounded-xl w-1/2 shadow-sm focus:ring-2 focus:ring-sky-500"
          placeholder="Regular Price"
        />
        <input
          type="number"
          value={discountedPrice}
          onChange={(e) => setDiscountedPrice(e.target.value)}
          className="p-3 border rounded-xl w-1/2 shadow-sm focus:ring-2 focus:ring-sky-500"
          placeholder="Discounted Price"
        />
      </div>

      {/* STOCK */}
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="p-3 border rounded-xl w-full mb-4 shadow-sm focus:ring-2 focus:ring-sky-500"
      />

      {/* CATEGORY */}
      <select
        className="p-3 border rounded-xl w-full mb-3 shadow-sm"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setSubcategory("");
        }}
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* SUBCATEGORY */}
      {subcategories.length > 0 && (
        <select
          className="p-3 border rounded-xl w-full mb-3 shadow-sm"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* SAVE */}
      <button
        onClick={updateProduct}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
      >
        Save Changes
      </button>

      <hr className="my-6" />

      <h2 className="text-xl font-bold mb-3">Product Images</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {product.product_images.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={img.image_url}
              className="w-full h-28 object-cover rounded-xl shadow border group-hover:opacity-75 transition"
            />

            <button
              onClick={() => deleteImage(img.id)}
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-3">Add New Images</h2>
      <div
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-500", "bg-blue-50"); }}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-500", "bg-blue-50"); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
          if (e.dataTransfer.files) {
            setNewImages([...newImages, ...e.dataTransfer.files]);
          }
        }}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group mb-4"
      >
        <input
          type="file"
          multiple
          id="edit-images-upload"
          className="hidden"
          onChange={(e) => setNewImages([...newImages, ...e.target.files])}
        />
        <label htmlFor="edit-images-upload" className="cursor-pointer block">
          <p className="text-gray-600 font-medium">Drag new images here</p>
          <p className="text-sm text-gray-400">or <span className="text-blue-600">browse</span></p>
        </label>
      </div>

      {/* NEW PREVIEWS */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} className="h-28 w-full object-cover rounded-xl border border-blue-200" />
              <button
                onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
