import { useState } from "react";
import API from "../../utils/api";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginVendor = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      console.log("Login clicked");

      const res = await API.post("/auth/login", { email, password });
      console.log("Login response:", res.data);

      // ✅ FIX 1 — Check vendor, not user
      if (res.data.vendor) {
        // ✅ FIX 2 — Save vendor correctly
        localStorage.setItem("vendor", JSON.stringify(res.data.vendor));

        alert("Vendor login successful!");
        window.location.href = "/vendor/dashboard";
      } else {
        alert("Not a vendor account");
      }

    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Vendor Login
      </h2>

      <form onSubmit={loginVendor}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 20 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "black",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
