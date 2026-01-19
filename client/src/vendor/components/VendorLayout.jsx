import VendorSidebar from "./VendorSidebar";
import VendorTopbar from "./VendorTopbar";
import { Outlet } from "react-router-dom";

export default function VendorLayout() {
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
