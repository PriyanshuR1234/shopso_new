import React from "react";

export default function UserProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "/user/login";
    return null;
  }

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow rounded-xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <p className="text-gray-600">Name</p>
          <p className="text-lg font-semibold">{user.name}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <p className="text-gray-600">Email</p>
          <p className="text-lg font-semibold">{user.email}</p>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <a
          href="/orders"
          className="bg-sky-600 text-white px-5 py-2 rounded-lg hover:bg-sky-700 transition"
        >
          View Orders
        </a>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
