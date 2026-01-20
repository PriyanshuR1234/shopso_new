export function requireVendor() {
  const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");
  if (!vendor?.id) {
    window.location.href = "/vendor/login";
    return false;
  }
  return vendor;
}
