// src/api/auth.js
import supabase from "../utils/supabaseClient";

/* ------------------------------------------------------------------
   USER SIGNUP (CUSTOMER)
   Creates Supabase Auth user + row in "users" table
------------------------------------------------------------------ */
export async function userSignup({ email, password, name }) {
  try {
    // 1️⃣ Create Supabase auth user
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { error: "Email already exists. Please try logging in." };
      }
      return { error: authError.message };
    }

    const userId = authUser.user.id;

    // 2️⃣ Store basic user info
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        name,
        role: "customer",
      })
      .select()
      .single();

    return { user: data, error };
  } catch (err) {
    return { error: err.message };
  }
}

/* ------------------------------------------------------------------
   USER LOGIN
------------------------------------------------------------------ */
export async function userLogin({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: "Invalid email or password" };

    return { user: data.user, error: null };
  } catch (err) {
    return { error: err.message };
  }
}

/* ------------------------------------------------------------------
   VENDOR LOGIN (Login + Vendor Fetch)
------------------------------------------------------------------ */
export async function loginAndGetVendor({ email, password }) {
  try {
    // 1️⃣ Login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: "Invalid login" };

    const user = data.user;

    // 2️⃣ Fetch vendor details
    const { data: vendor, error: vendorFetchError } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (vendorFetchError) {
      return { error: "Vendor profile not found" };
    }

    return {
      user,
      vendor,
      error: null,
    };
  } catch (err) {
    return { error: err.message };
  }
}

/* ------------------------------------------------------------------
   VENDOR SIGNUP
   Creates Auth User → Adds to "users" → Adds vendor row
------------------------------------------------------------------ */
export async function vendorSignup({
  email,
  password,
  name,
  phone,
  shop_name,
  shop_description,
  aadhaar_url,
}) {
  try {
    // 1️⃣ Create auth user
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "vendor",
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { error: "This email is already registered as a vendor/user." };
      }
      return { error: authError.message };
    }

    const userId = authUser.user.id;

    // 2️⃣ Insert into "users" table
    const { error: userErr } = await supabase.from("users").insert({
      id: userId,
      email,
      name,
      phone,
      role: "vendor",
    });

    if (userErr) return { error: userErr.message };

    // 3️⃣ Insert into "vendors" table
    const { error: vendorErr } = await supabase.from("vendors").insert({
      user_id: userId,
      shop_name,
      shop_description,
      phone,
      aadhaar_url,
      status: "pending",
    });

    if (vendorErr) return { error: vendorErr.message };

    return { success: true, error: null };
  } catch (err) {
    return { error: err.message };
  }
}

/* ------------------------------------------------------------------
   LOGOUT
------------------------------------------------------------------ */
export async function logoutUser() {
  await supabase.auth.signOut();
}
