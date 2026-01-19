import { NavLink } from "react-router-dom";

export default function VendorSidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Vendor Panel
      </div>

      <nav className="p-4 space-y-2">
        <NavLink
          to="/vendor/dashboard"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? "bg-blue-600" : "hover:bg-gray-700"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/vendor/add-product"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? "bg-blue-600" : "hover:bg-gray-700"
            }`
          }
        >
          Add Product
        </NavLink>
      </nav>
    </aside>
  );
}
