import { useState } from "react";
import API from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";

export default function VendorSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    shop_name: "",
    shop_description: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerVendor = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/vendor-signup", form);

      alert("Vendor account created successfully!");
      navigate("/vendor/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Vendor Signup
        </h2>

        <form onSubmit={registerVendor} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Your Full Name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="text"
            name="shop_name"
            placeholder="Shop Name"
            required
            value={form.shop_name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <textarea
            name="shop_description"
            placeholder="Shop Description"
            required
            value={form.shop_description}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link
            to="/vendor/login"
            className="text-sky-600 font-semibold hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
