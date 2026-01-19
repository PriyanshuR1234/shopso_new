import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";

export default function EditProduct() {
  const { id } = useParams();
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // Load product
  useEffect(() => {
    API.get(`/products/${id}`).then((res) => {
      setProduct(res.data);
      setName(res.data.name);
      setDescription(res.data.description);
      setPrice(res.data.price);
    });
  }, [id]);

  // UPDATE PRODUCT DETAILS
  const updateProduct = async () => {
    try {
      await API.put(`/products/update/${id}`, {
        vendor_id: vendor.id,
        name,
        description,
        price,
      });

      toast.success("Product updated");
    } catch {
      toast.error("Failed to update product");
    }
  };

  // DELETE INDIVIDUAL IMAGE
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

  if (!product) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Edit Product</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 border w-full mb-2"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 border w-full mb-2"
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="p-2 border w-full mb-2"
      />

      <button
        className="bg-blue-600 text-white p-2 rounded w-full mt-2"
        onClick={updateProduct}
      >
        Save Changes
      </button>

      <hr className="my-6" />

      <h2 className="text-xl font-bold mb-2">Product Images</h2>

      {/* MULTI IMAGE GALLERY */}
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
