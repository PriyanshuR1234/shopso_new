import React, { useState } from "react";
import API from "../../../utils/api";

export default function UserSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const signup = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/signup", { email, name, password });
      setMsg("Account created!");
    } catch {
      setMsg("Signup failed");
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create User Account</h1>
      <form className="space-y-4" onSubmit={signup}>
        <input className="w-full border p-2" placeholder="Name"
               onChange={(e) => setName(e.target.value)} />

        <input className="w-full border p-2" placeholder="Email"
               onChange={(e) => setEmail(e.target.value)} />

        <input type="password" className="w-full border p-2"
               placeholder="Password"
               onChange={(e) => setPassword(e.target.value)} />

        <button className="w-full bg-sky-600 text-white p-2 rounded">
          Create Account
        </button>
      </form>

      {msg && <p className="mt-3 text-gray-700">{msg}</p>}
    </div>
  );
}
