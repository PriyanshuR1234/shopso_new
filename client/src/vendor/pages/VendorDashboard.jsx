import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";

export default function VendorDashboard() {
  const vendor = JSON.parse(localStorage.getItem("vendor"));
  const vendor_id = vendor?.id;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH PRODUCTS
  useEffect(() => {
    if (!vendor_id) {
      toast.error("Vendor not logged in");
      return;
    }

    API.get(`/products/vendor/${vendor_id}`)
      .then((res) => {
        setProducts(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load products");
      })
      .finally(() => setLoading(false));
  }, [vendor_id]);

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await API.delete(`/products/delete/${id}/${vendor_id}`);

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading products...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Vendor Dashboard
        </h1>

        <button
          className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2 rounded-lg shadow-md"
          onClick={() => (window.location.href = "/vendor/add-product")}
        >
          + Add Product
        </button>
      </div>

      {/* EMPTY STATE */}
      {products.length === 0 && (
        <div className="text-center mt-20 text-gray-600 text-lg">
          <p>No products added yet.</p>
          <button
            className="mt-4 bg-black text-white px-4 py-2 rounded-lg"
            onClick={() => (window.location.href = "/vendor/add-product")}
          >
            Add your first product
          </button>
        </div>
      )}

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white shadow-lg rounded-xl overflow-hidden border hover:shadow-xl transition"
          >
            <img
              src={p.product_images?.[0]?.image_url}
              alt={p.name}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h2 className="font-bold text-lg">{p.name}</h2>
              <p className="text-gray-600 mb-2 text-sm">
                {p.description}
              </p>

              <p className="text-xl font-semibold text-blue-600">
                ₹{p.price}
              </p>

              <div className="flex justify-between mt-4">
                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  onClick={() =>
                    (window.location.href = `/vendor/edit-product/${p.id}`)
                  }
                >
                  Edit
                </button>

                <button
                  className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  onClick={() => deleteProduct(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
