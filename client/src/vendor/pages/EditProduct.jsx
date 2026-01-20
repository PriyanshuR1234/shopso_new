import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { categories } from "../../data/categories";

export default function EditProduct() {
  const { id } = useParams();
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const [product, setProduct] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  // Load product
  useEffect(() => {
    API.get(`/products/${id}`).then((res) => {
      const p = res.data;

      setProduct(p);
      setName(p.name);
      setDescription(p.description);
      setPrice(p.price);
      setStock(p.stock);

      setCategory(p.category || "");
      setSubcategory(p.subcategory || "");
    });
  }, [id]);

  const updateProduct = async () => {
    try {
      await API.put(`/products/update/${id}`, {
        vendor_id: vendor.id,
        name,
        description,
        price,
        stock,
        category,
        subcategory,
      });

      toast.success("Product updated");
    } catch {
      toast.error("Failed to update product");
    }
  };

  const deleteImage = async (image_id) => {
    try {
      await API.delete(`/products/delete-image/${image_id}`);
      setProduct((prev) => ({
        ...prev,
        product_images: prev.product_images.filter((i) => i.id !== image_id),
      }));
      toast.success("Image removed");
    } catch {
      toast.error("Failed to delete image");
    }
  };

  if (!product) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4">Edit Product</h1>

      {/* NAME */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-3 border rounded w-full mb-3"
      />

      {/* DESCRIPTION */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-3 border rounded w-full mb-3"
        rows={4}
      />

      {/* PRICE */}
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="p-3 border rounded w-full mb-3"
      />

      {/* STOCK */}
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="p-3 border rounded w-full mb-4"
      />

      {/* CATEGORY */}
      <select
        className="p-3 border rounded w-full mb-3"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setSubcategory(""); // Reset subcategory when category changes
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

      {/* SAVE */}
      <button
        onClick={updateProduct}
        className="bg-blue-600 text-white py-2 rounded w-full hover:bg-blue-700"
      >
        Save Changes
      </button>

      <hr className="my-6" />

      <h2 className="text-xl font-bold mb-3">Product Images</h2>

      <div className="grid grid-cols-3 gap-3">
        {product.product_images.map((img) => (
          <div key={img.id} className="relative">
            <img
              src={img.image_url}
              className="w-full h-28 object-cover rounded shadow"
            />
            <button
              onClick={() => deleteImage(img.id)}
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
