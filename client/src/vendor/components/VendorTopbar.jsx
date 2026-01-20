import { useState } from "react";

export default function VendorTopbar() {
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">

      {/* LEFT SIDE - PAGE TITLE */}
      <h1 className="text-xl font-bold text-gray-800 tracking-wide">
        Vendor Dashboard
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* Search Bar */}
        <div className="hidden md:block relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Language Selector */}
        <div className="hidden md:flex items-center gap-1 cursor-pointer text-gray-600 hover:text-gray-900">
          🇮🇳 <span className="text-sm font-medium">EN</span>
        </div>

        {/* NOTIFICATION ICON */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
          >
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            🔔
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-lg border border-gray-100 p-4 z-50">
              <p className="font-semibold text-gray-800">Notifications</p>
              <ul className="mt-3 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 text-lg">⚙️</span>
                  <div>
                    <p className="font-semibold text-gray-700">Settings Update</p>
                    <p className="text-gray-500">Dashboard refreshed</p>
                  </div>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-purple-500 text-lg">📅</span>
                  <div>
                    <p className="font-semibold text-gray-700">Event Update</p>
                    <p className="text-gray-500">New data event</p>
                  </div>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">🧑</span>
                  <div>
                    <p className="font-semibold text-gray-700">Profile</p>
                    <p className="text-gray-500">Update your profile</p>
                  </div>
                </li>

                <li className="flex items-start gap-2">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div>
                    <p className="font-semibold text-gray-700">Application Error</p>
                    <p className="text-gray-500">Check running process</p>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* PROFILE MENU */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <img
              src="https://i.pravatar.cc/40?img=12"
              className="w-10 h-10 rounded-full border"
              alt="Vendor"
            />
            <span className="hidden sm:block font-semibold text-gray-700">
              {vendor?.shop_name || "Vendor"}
            </span>
          </button>

          {/* DROPDOWN */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-50">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">
                Settings
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("vendor");
                  window.location.href = "/vendor/login";
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
