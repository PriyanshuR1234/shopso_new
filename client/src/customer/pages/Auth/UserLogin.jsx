import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import supabase from "../../../utils/supabaseClient";
import { signInWithGoogle } from "../../../api/auth";

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
    } else if (profileErr && profileErr.code === 'PGRST116') {
      // Profile doesn't exist (common for Google OAuth users) - create it
      const { data: newProfile } = await supabase
        .from("users")
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || "User",
          role: data.user.user_metadata?.role || "customer",
        })
        .select()
        .single();

      if (newProfile) {
        profile = newProfile;
      } else {
        console.warn("Failed to create profile, using metadata fallback");
        profile = {
          role: data.user.user_metadata?.role || "customer",
          name: data.user.user_metadata?.name || data.user.user_metadata?.username || "User"
        };
      }
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
    const { error } = await signInWithGoogle("customer");
    if (error) {
      toast.error(error.message || "Google login failed");
    }
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

          <div className="flex justify-end">
            <Link to="/user/forgot-password" size="sm" className="text-sm text-sky-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

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
          className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2.5 text-slate-600 hover:bg-slate-50 transition font-medium bg-white"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
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
