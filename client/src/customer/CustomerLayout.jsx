import Navigation from "./Navigation";
import { Outlet } from "react-router-dom";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Outlet />
    </div>
  );
}
