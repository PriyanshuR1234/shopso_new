import React, { useState } from "react";
import API from "../../../utils/api";
import { Link } from "react-router-dom";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMsg("Login successful!");

      // Redirect to homepage
      window.location.href = "/";
    } catch {
      setMsg("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">

        <h1 className="text-2xl font-bold mb-6 text-center">User Login</h1>

        <form className="space-y-4" onSubmit={login}>
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-3 rounded-lg"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-sky-600 text-white p-3 rounded-lg hover:bg-sky-700 transition">
            Login
          </button>
        </form>

        {msg && <p className="mt-3 text-gray-700 text-center">{msg}</p>}

        {/* Signup Redirect */}
        <p className="mt-6 text-center text-sm text-gray-600">
          New user?{" "}
          <Link
            to="/user/signup"
            className="text-sky-600 font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
