import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import supabase from "../../utils/supabaseClient";

export default function AddProduct() {
  const [vendorId, setVendorId] = useState(null);

  // Product Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [stock, setStock] = useState("");

  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [tags, setTags] = useState("");

  // Category
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Images
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);

  /* -----------------------------------
     GET VENDOR FROM LOCAL STORAGE
  ------------------------------------ */
  useEffect(() => {
    const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");

    if (!vendor?.id) {
      toast.error("Please login again");
      return (window.location.href = "/vendor/login");
    }

    setVendorId(vendor.id);
  }, []);

  /* -----------------------------------
     LOAD CATEGORIES FROM SUPABASE
  ------------------------------------ */
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase.from("categories").select("id, name");
      if (!error) setCategories(data || []);
    };
    loadCategories();
  }, []);

  /* -----------------------------------
     LOAD SUBCATEGORIES WHEN CATEGORY SELECTED
  ------------------------------------ */
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    const loadSubs = async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name")
        .eq("category_id", categoryId);

      if (!error) setSubcategories(data || []);
    };

    loadSubs();
  }, [categoryId]);

  /* -----------------------------------
     IMAGE PREVIEW
  ------------------------------------ */
  useEffect(() => {
    if (images.length === 0) return;
    setPreviews(images.map((img) => URL.createObjectURL(img)));
  }, [images]);

  /* -----------------------------------
     UPLOAD IMAGES TO SUPABASE STORAGE
  ------------------------------------ */
  const uploadImages = async () => {
    try {
      const urls = [];

      for (const img of images) {
        const path = `product_${Date.now()}_${img.name}`;

        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(path, img);

        if (uploadErr) {
          toast.error("Image upload failed");
          return null;
        }

        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }

      return urls;
    } catch {
      toast.error("Image upload failed");
      return null;
    }
  };

  /* -----------------------------------
     ADD PRODUCT
  ------------------------------------ */
  const addProduct = async () => {
    if (!name || !description || !price || !stock || !categoryId) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);

    try {
      // Upload Images First
      const imageUrls = await uploadImages();
      if (!imageUrls) return setLoading(false);

      // Insert product
      const { data: product, error } = await supabase
        .from("products")
        .insert({
          vendor_id: vendorId,
          name,
          description,
          price: Number(price),
          discounted_price: Number(discountedPrice) || Number(price),
          discount_percent: Number(price) > Number(discountedPrice) ? Math.round(((Number(price) - Number(discountedPrice)) / Number(price)) * 100) : 0,
          stock: Number(stock),
          brand,
          color,
          size,
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
          category_id: categoryId,
          subcategory_id: subcategoryId || null,
        })
        .select()
        .single();

      if (error) {
        console.log(error);
        toast.error("Could not create product");
        return;
      }

      // Insert images
      for (const url of imageUrls) {
        await supabase.from("product_images").insert({
          product_id: product.id,
          image_url: url,
        });
      }

      toast.success("Product added successfully 🎉");
      window.location.href = "/vendor/dashboard";
    } catch (err) {
      console.log(err);
      toast.error("Error adding product");
    }

    setLoading(false);
  };

  /* -----------------------------------
     UI STARTS HERE
  ------------------------------------ */
  return (
    <div className="max-w-xl mx-auto p-8 mt-6 bg-white rounded-3xl shadow-xl">

      <h2 className="text-3xl font-bold mb-6 text-center">Add Product</h2>

      {/* NAME */}
      <input
        className="p-3 border rounded-xl w-full mb-3"
        placeholder="Product Name"
        onChange={(e) => setName(e.target.value)}
      />

      {/* DESCRIPTION */}
      <textarea
        className="p-3 border rounded-xl w-full mb-3"
        placeholder="Description"
        rows={3}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* PRICE */}
      <div className="flex gap-4 mb-3">
        <input
          type="number"
          className="p-3 border rounded-xl w-1/2 shadow-sm"
          placeholder="Regular Price"
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="number"
          className="p-3 border rounded-xl w-1/2 shadow-sm"
          placeholder="Discounted Price"
          onChange={(e) => setDiscountedPrice(e.target.value)}
        />
      </div>

      {/* STOCK */}
      <input
        type="number"
        className="p-3 border rounded-xl w-full mb-3"
        placeholder="Stock"
        onChange={(e) => setStock(e.target.value)}
      />

      {/* BRAND */}
      <input
        className="p-3 border rounded-xl w-full mb-3"
        placeholder="Brand"
        onChange={(e) => setBrand(e.target.value)}
      />

      {/* COLOR */}
      <input
        className="p-3 border rounded-xl w-full mb-3"
        placeholder="Color"
        onChange={(e) => setColor(e.target.value)}
      />

      {/* SIZE */}
      <input
        className="p-3 border rounded-xl w-full mb-3"
        placeholder="Size"
        onChange={(e) => setSize(e.target.value)}
      />

      {/* TAGS */}
      <input
        className="p-3 border rounded-xl w-full mb-3"
        placeholder="Tags (comma separated)"
        onChange={(e) => setTags(e.target.value)}
      />

      {/* CATEGORY */}
      <select
        className="p-3 border rounded-xl w-full mb-3"
        value={categoryId}
        onChange={(e) => {
          setCategoryId(e.target.value);
          setSubcategoryId("");
        }}
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* SUBCATEGORY */}
      {subcategories.length > 0 && (
        <select
          className="p-3 border rounded-xl w-full mb-3"
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      {/* IMAGES */}
      <div
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-500", "bg-blue-50"); }}
        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-500", "bg-blue-50"); }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
          if (e.dataTransfer.files) {
            setImages([...images, ...e.dataTransfer.files]);
          }
        }}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
      >
        <input
          type="file"
          multiple
          className="hidden"
          id="product-images-upload"
          onChange={(e) => setImages([...images, ...e.target.files])}
        />
        <label htmlFor="product-images-upload" className="cursor-pointer block">
          <div className="text-4xl mb-2 opacity-50 group-hover:scale-110 transition-transform">📸</div>
          <p className="text-gray-600 font-medium">Drag & drop product images</p>
          <p className="text-sm text-gray-400">or <span className="text-blue-600">browse files</span></p>
        </label>
      </div>

      {/* PREVIEW */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          {previews.map((src, i) => (
            <img key={i} src={src} className="h-28 w-full object-cover rounded-xl" />
          ))}
        </div>
      )}

      {/* SUBMIT */}
      <button
        onClick={addProduct}
        className="w-full py-3 bg-black text-white rounded-xl"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  );
}
