import { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { categories } from "../../data/categories";

export default function AddProduct() {
  const [vendorId, setVendorId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");

    if (!vendor?.id) {
      toast.error("Please login again");
      window.location.href = "/vendor/login";
      return;
    }

    setVendorId(vendor.id);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    setPreviews(images.map((img) => URL.createObjectURL(img)));
  }, [images]);

  const uploadImages = async () => {
    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));
    const res = await API.post("/products/upload-multiple", formData);
    return res.data.urls;
  };

  const addProduct = async () => {
    if (!name || !description || !price || !stock || !category) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const image_urls = await uploadImages();

      await API.post("/products/add", {
        vendor_id: vendorId,
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        subcategory,
        image_urls,
      });

      toast.success("Product added!");
      window.location.href = "/vendor/dashboard";
    } catch (err) {
      toast.error("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-bold mb-6">Add Product</h2>

      <input className="p-3 border rounded w-full mb-3" placeholder="Name" onChange={(e) => setName(e.target.value)} />

      <textarea className="p-3 border rounded w-full mb-3" placeholder="Description" rows={4}
        onChange={(e) => setDescription(e.target.value)} />

      <input type="number" className="p-3 border rounded w-full mb-3" placeholder="Price"
        onChange={(e) => setPrice(e.target.value)} />

      <input type="number" className="p-3 border rounded w-full mb-3" placeholder="Stock"
        onChange={(e) => setStock(e.target.value)} />

      {/* CATEGORY */}
      <select
        className="p-3 border rounded w-full mb-3"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setSubcategory("");
        }}
      >
        <option value="">Select Category</option>
        {Object.keys(categories).map((cat) => (
          <option key={cat} value={cat}>
            {categories[cat].label}
          </option>
        ))}
      </select>

      {/* SUBCATEGORY */}
      {category && categories[category].sub.length > 0 && (
        <select
          className="p-3 border rounded w-full mb-3"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
        >
          <option value="">Select Subcategory</option>
          {categories[category].sub.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      )}

      <input type="file" multiple className="mb-3" onChange={(e) => setImages([...e.target.files])} />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {previews.map((src, i) => (
            <img key={i} src={src} className="h-24 object-cover rounded" />
          ))}
        </div>
      )}

      <button
        onClick={addProduct}
        className="p-3 bg-black text-white w-full rounded"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  );
}
