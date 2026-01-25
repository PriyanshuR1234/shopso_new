import VendorSidebar from "./VendorSidebar";
import VendorTopbar from "./VendorTopbar";
import { Outlet } from "react-router-dom";
import PendingVendorModal from "../../components/PendingVendorModal";

export default function VendorLayout() {
  const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");

  // If vendor exists but not approved → show restriction modal
  if (vendor && vendor.status !== "approved") {
    return <PendingVendorModal />;
  }

  return (
    <div className="flex">
      <VendorSidebar />

      <div className="flex-1 ml-64 bg-gray-100 min-h-screen">
        <VendorTopbar />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
