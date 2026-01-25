import supabase from "../utils/supabaseClient";

/* GET ALL VENDORS */
export async function getAllVendors() {
  const { data, error } = await supabase
    .from("vendors")
    .select("*, users(name, email, phone)")
    .order("created_at", { ascending: false });

  return { vendors: data, error };
}

/* APPROVE VENDOR */
export async function approveVendor(vendor_id) {
  const { error } = await supabase
    .from("vendors")
    .update({ status: "approved" })
    .eq("id", vendor_id);

  return { error };
}

/* REJECT VENDOR */
export async function rejectVendor(vendor_id) {
  const { error } = await supabase
    .from("vendors")
    .update({ status: "rejected" })
    .eq("id", vendor_id);

  return { error };
}
