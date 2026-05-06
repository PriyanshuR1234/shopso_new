// src/api/auth.js
import supabase from "../utils/supabaseClient";

/* ------------------------------------------------------------------
   USER SIGNUP (CUSTOMER)
   Creates Supabase Auth user + row in "users" table
------------------------------------------------------------------ */
export async function userSignup({ email, password, name }) {
  try {
    // 1️⃣ Create Supabase auth user (Trigger creates public.users row)
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "customer"
        }
      }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { error: "Email already exists. Please try logging in." };
      }
      return { error: authError.message };
    }

    return { user: authUser.user, error: null };
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
    // 1️⃣ Create auth user (Trigger handles Profile & Vendor creation)
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "vendor",
          phone,
          shop_name,
          shop_description,
          aadhaar_url
        },
        emailRedirectTo: `${window.location.origin}/vendor/dashboard`
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { error: "This email is already registered as a vendor/user." };
      }
      return { error: authError.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return { error: err.message };
  }
}

/* ------------------------------------------------------------------
   GOOGLE AUTH
------------------------------------------------------------------ */
export async function signInWithGoogle(role = "customer") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${role === "vendor" ? "/vendor/dashboard" : "/"}`,
      data: { role }
    },
  });

  // Provide more helpful error messages
  if (error) {
    if (error.message?.includes("OAuth secret") || error.message?.includes("Unsupported provider")) {
      return {
        error: {
          message: "Google login is not configured. Please contact support or use email/password login."
        }
      };
    }
    return { error };
  }

  return { data, error: null };
}

/* ------------------------------------------------------------------
   PASSWORD RECOVERY
------------------------------------------------------------------ */
export async function resetPasswordRequest(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/user/reset-password`,
  });
  return { error };
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
}

/* ------------------------------------------------------------------
   PHONE OTP (Verification step)
------------------------------------------------------------------ */
export async function sendPhoneOTP(phone) {
  const { error } = await supabase.auth.signInWithOtp({
    phone: phone,
  });
  return { error };
}

export async function verifyPhoneOTP(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
  return { data, error };
}

/* ------------------------------------------------------------------
   LOGOUT
------------------------------------------------------------------ */
export async function logoutUser() {
  await supabase.auth.signOut();
}
