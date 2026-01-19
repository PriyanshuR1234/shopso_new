export default function VendorTopbar() {
  const vendor = JSON.parse(localStorage.getItem("vendor"));

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-xl font-bold text-gray-800">
        Vendor Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">
          {vendor?.shop_name || "Vendor"}
        </span>

        <button
          onClick={() => {
            localStorage.removeItem("vendor");
            window.location.href = "/vendor/login";
          }}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
