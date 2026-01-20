import { useState } from "react";
import API from "../../utils/api";
import { Link } from "react-router-dom";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginVendor = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/login", { email, password });

      if (res.data.vendor) {
        localStorage.setItem("vendor", JSON.stringify(res.data.vendor));
        window.location.href = "/vendor/dashboard";
      } else {
        alert("Not a vendor account");
      }
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center">Vendor Login</h2>

        <form onSubmit={loginVendor} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* ---------------- NEW SIGNUP LINK ---------------- */}
        <p className="text-center text-gray-600 mt-4">
          Not registered yet?{" "}
          <Link
            to="/vendor/signup"
            className="text-sky-600 font-semibold hover:underline"
          >
            Create Vendor Account
          </Link>
        </p>
      </div>
    </div>
  );
}
