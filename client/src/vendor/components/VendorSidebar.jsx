import { NavLink } from "react-router-dom";

export default function VendorSidebar() {
  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed left-0 top-0 shadow-xl">

      {/* Brand / Logo */}
      <div className="p-6 text-2xl font-bold border-b border-white/10 tracking-wide">
        Vendor Panel
        <p className="text-sm text-gray-400 font-normal mt-1">
          Manage your store
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        <SidebarLink to="/vendor/dashboard" icon="📦" label="Dashboard" />
        <SidebarLink to="/vendor/analytics" icon="📊" label="Analytics" />
        <SidebarLink to="/vendor/orders" icon="📬" label="Orders" />   {/* ✅ ADDED */}
        <SidebarLink to="/vendor/add-product" icon="➕" label="Add Product" />
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-white/10 text-sm text-gray-400">
        © {new Date().getFullYear()} Vendor Admin
      </div>
    </aside>
  );
}

/* Reusable Sidebar Link */
function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${isActive
          ? "bg-blue-600 shadow-md"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}
