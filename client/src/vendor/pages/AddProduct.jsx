import { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

export default function AddProduct() {
  const [vendor, setVendor] = useState(null);
  const [vendorId, setVendorId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load vendor
  useEffect(() => {
    const storedVendor = JSON.parse(localStorage.getItem("vendor") || "{}");

    if (!storedVendor || !storedVendor.id) {
      toast.error("Please login again");
      setTimeout(() => {
        window.location.href = "/vendor/login";
      }, 1200);
      return;
    }

    setVendor(storedVendor);
    setVendorId(storedVendor.id);
  }, []);

  // PREVIEW SELECTED IMAGES
  useEffect(() => {
    if (images.length === 0) return;

    const urls = images.map((img) => URL.createObjectURL(img));
    setPreviews(urls);
  }, [images]);

  // Upload multiple images
  const uploadImages = async () => {
    try {
      const formData = new FormData();
      images.forEach((img) => formData.append("images", img));

      const res = await API.post("/products/upload-multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data.urls; // array of uploaded URLs
    } catch (err) {
      toast.error("Failed to upload images");
      throw err;
    }
  };

  // Add product
  const addProduct = async () => {
    try {
      if (!vendorId) {
        toast.error("Vendor not logged in");
        return;
      }

      if (!name || !description || !price) {
        toast.error("All fields are required");
        return;
      }

      if (images.length === 0) {
        toast.error("Please select at least 1 image");
        return;
      }

      if (images.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      setLoading(true);
      toast.loading("Uploading images...");

      const image_urls = await uploadImages();

      toast.dismiss();
      toast.loading("Saving product...");

      await API.post("/products/add", {
        vendor_id: vendorId,
        name,
        description,
        price: Number(price),
        image_urls,
      });

      toast.dismiss();
      toast.success("Product added successfully!");

      setTimeout(() => {
        window.location.href = "/vendor/dashboard";
      }, 1000);
    } catch (err) {
      console.error("ADD PRODUCT ERROR:", err);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>

      <input
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
        className="p-2 border w-full mb-3"
      />

      <textarea
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 border w-full mb-3"
      />

      <input
        type="number"
        placeholder="Price"
        onChange={(e) => setPrice(e.target.value)}
        className="p-2 border w-full mb-3"
      />

      {/* MULTI IMAGE UPLOAD */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages([...e.target.files])}
        className="mb-3"
      />

      {/* PREVIEW GALLERY */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {previews.map((src, i) => (
          <img key={i} src={src} className="w-24 h-24 object-cover rounded shadow" />
        ))}
      </div>

      <button
        onClick={addProduct}
        disabled={loading}
        className="bg-black text-white p-3 rounded w-full"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  );
}
