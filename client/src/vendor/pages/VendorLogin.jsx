import { useState } from "react";
import { loginAndGetVendor, signInWithGoogle } from "../../api/auth";
import supabase from "../../utils/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginVendor = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Invalid credentials");
      setLoading(false);
      return;
    }

    const user = data.user;

    // Fetch vendor
    const { data: vendor, error: vErr } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (vErr || !vendor) {
      // Check if this is a Google OAuth user without vendor profile
      const { data: userProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      // If user exists but no vendor profile, redirect to vendor onboarding
      if (userProfile && userProfile.role === "vendor") {
        toast.error("Please complete vendor registration.");
        window.location.href = "/vendor/signup";
        return;
      }

      toast.error("You are not registered as vendor.");
      setLoading(false);
      return;
    }

    // ALLOW PENDING LOGIN - Dashboard will handle the "Pending" screen
    /*
    if (vendor.status !== "approved") {
      toast.error("Vendor approval pending.");
      setLoading(false);
      return;
    }
    */

    // SAVE CORRECT VENDOR OBJECT
    localStorage.setItem(
      "vendor",
      JSON.stringify({
        id: vendor.id,            // vendor table PK
        user_id: vendor.user_id,  // auth user id
        shop_name: vendor.shop_name,
        shop_logo: vendor.shop_logo, // Added persistence
        shop_banner: vendor.shop_banner,
        status: vendor.status,
      })
    );

    window.location.href = "/vendor/dashboard";
  };


  const googleLogin = async () => {
    const { error } = await signInWithGoogle("vendor");
    if (error) {
      toast.error(error.message || "Google login failed");
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

          <div className="flex justify-end">
            <Link to="/user/forgot-password" size="sm" className="text-sm text-sky-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          onClick={googleLogin}
          className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg"
        >
          Continue with Google
        </button>

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
