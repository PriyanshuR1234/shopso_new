import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import supabase from "../../../utils/supabaseClient";

export default function UserLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Invalid email or password");
      setLoading(false);
      return;
    }

    // 2. Fetch full profile from DB to sync details (CRITICAL for role synchronization)
    let profile = null;
    const { data: profileData, error: profileErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!profileErr && profileData) {
      profile = profileData;
    } else {
      console.warn("Profile fetch failed, using metadata fallback:", profileErr);
      profile = {
        role: data.user.user_metadata?.role || "customer",
        name: data.user.user_metadata?.name || data.user.user_metadata?.username || "User"
      };
    }

    const fullUser = {
      ...data.user,
      profile: profile
    };

    // Save session
    localStorage.setItem("user", JSON.stringify(fullUser));
    window.dispatchEvent(new Event("user-session-change")); // Notify Navigation

    toast.success("Login successful 🎉");

    setTimeout(() => {
      // Redirect based on role if needed, or just home
      if (profile.role === "admin") navigate("/admin");
      else navigate("/");
    }, 800);

    setLoading(false);
  };

  const googleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) toast.error("Google login failed");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm transform transition-all hover:scale-[1.01]">

        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-sky-600 to-blue-600 text-transparent bg-clip-text">
          User Login
        </h1>

        <form className="space-y-4" onSubmit={login}>
          <input
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition"
            placeholder="Email"
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="border-t"></div>
          <p className="text-center text-sm text-gray-500 -mt-3 bg-white w-fit mx-auto px-2">
            OR
          </p>
        </div>

        {/* Google Login */}
        <button
          onClick={googleLogin}
          className="w-full flex items-center justify-center gap-3 border p-3 rounded-xl hover:bg-gray-50 transition shadow-sm"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google"
            className="w-5 h-5"
          />
          <span className="font-medium">Continue with Google</span>
        </button>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          New user?{" "}
          <Link
            to="/user/signup"
            className="text-sky-600 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
