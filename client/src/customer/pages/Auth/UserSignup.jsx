import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../utils/supabaseClient";
import toast from "react-hot-toast";

export default function UserSignup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // Added Username
  const [loading, setLoading] = useState(false);

  const signup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create auth account with Metadata
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          username: username,
        }
      }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        toast.error("Account already exists. Try logging in.");
      } else {
        toast.error(authError.message);
      }
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    // Insert into user profile table (Optional backup)
    const { error: dbError } = await supabase.from("users").insert({
      id: userId,
      name,
      email,
      role: "customer",
    });

    if (dbError) {
      console.error("DB Profile Error:", dbError);
    }

    toast.success("Account created successfully! 🎉");
    navigate("/user/login");
  };

  const googleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

    if (error) setMsg("Google signup failed");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">Create User Account</h1>

        <form className="space-y-4" onSubmit={signup}>
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Full Name"
            required
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Username"
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Email"
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-3 rounded-lg"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-sky-600 text-white p-3 rounded-lg hover:bg-sky-700 transition"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="border-t"></div>
          <p className="text-center text-sm text-gray-500 -mt-3 bg-white inline-block px-2">
            OR
          </p>
        </div>

        <button
          onClick={googleSignup}
          className="w-full flex items-center justify-center gap-3 border p-3 rounded-lg hover:bg-gray-50"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google"
            className="w-6 h-6"
          />
          <span className="font-medium">Sign up with Google</span>
        </button>


      </div>
    </div>
  );
}
