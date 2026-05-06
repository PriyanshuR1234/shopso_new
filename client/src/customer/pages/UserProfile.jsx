import React, { useState, useEffect } from "react";
import supabase from "../../utils/supabaseClient";
import toast from "react-hot-toast";

export default function UserProfile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [initialPhone, setInitialPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  if (!user) {
    window.location.href = "/user/login";
    return null;
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist - create it (common for OAuth users)
        console.log("Profile not found, creating one...");

        const { data: { user: authUser } } = await supabase.auth.getUser();

        // Use UPSERT instead of INSERT to preserve any existing data (like verified phone)
        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .upsert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || "User",
            role: authUser.user_metadata?.role || "customer",
            // Don't overwrite phone or phone_verified if they already exist
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (createError) {
          console.error("Failed to create profile:", createError);
          toast.error("Failed to load profile. Please try logging in again.");
          setLoading(false);
          return;
        }

        if (newProfile) {
          setFormData({
            name: newProfile.name || "",
            mobile: newProfile.mobile || newProfile.phone || "",
            address: newProfile.address || "",
            city: newProfile.city || "",
            state: newProfile.state || "",
            zip: newProfile.zip || "",
          });
          setInitialPhone(newProfile.phone || "");
          setPhoneVerified(newProfile.phone_verified || false);
          toast.success("Profile loaded successfully!");
        }
      } else if (error) {
        throw error;
      } else if (data) {
        setFormData({
          name: data.name || "",
          mobile: data.mobile || data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
        });
        setInitialPhone(data.phone || "");
        setPhoneVerified(data.phone_verified || false);
      }
    } catch (err) {
      console.error("Profile fetch error", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if phone number has changed
      const isPhoneChanged = formData.mobile !== initialPhone;

      const updates = {
        id: user.id,
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        email: user.email,
      };

      // If phone changed, reset verification status
      if (isPhoneChanged) {
        updates.phone_verified = false;
        // Also sync 'phone' column if schema uses both
        updates.phone = formData.mobile;
      }

      // Use the secure function if available, otherwise upsert
      // Since we might be setting phone_verified to FALSE, standard upsert is fine/safer than TRUE
      const { error } = await supabase
        .from("users")
        .upsert(updates);

      if (error) throw error;

      // Update Local Storage User Object
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          name: formData.name
        }
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-session-change"));

      if (isPhoneChanged) {
        setInitialPhone(formData.mobile);
        setPhoneVerified(false);
        toast.success("Profile updated! Phone number changed - please verify it again.");
      } else {
        toast.success("Profile updated successfully!");
      }

      setEditMode(false);
    } catch (err) {
      console.error("Save error", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-session-change")); // Update Navbar
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-sky-100 mt-1">Manage your details and orders</p>
            </div>
            <div className="flex gap-3">
              <a
                href="/orders"
                className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg hover:bg-white/30 transition border border-white/40"
              >
                📦 My Orders
              </a>
              <button
                onClick={logout}
                className="bg-red-500/80 backdrop-blur-md px-4 py-2 rounded-lg hover:bg-red-600/90 transition border border-red-400/50"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <p>Loading profile...</p>
            ) : (
              <div className="space-y-8">
                {/* Personal Details */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-2 w-full">Personal Details</h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-sky-600 font-semibold hover:underline bg-sky-50 px-4 py-1 rounded-full whitespace-nowrap ml-4"
                  >
                    {editMode ? "Cancel Edit" : "Edit Profile"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <input
                      name="name"
                      disabled={!editMode}
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-lg border ${editMode ? "border-sky-300 bg-white" : "border-transparent bg-gray-100"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input
                      disabled
                      value={user.email}
                      className="w-full p-3 rounded-lg border border-transparent bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Mobile Number
                      {phoneVerified ? (
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                            ✓ Verified
                          </span>
                          <a
                            href="/verify-phone?redirect=profile"
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200 transition font-medium"
                          >
                            Change
                          </a>
                        </div>
                      ) : (
                        <a
                          href="/verify-phone?redirect=profile"
                          className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full hover:bg-amber-200 transition font-semibold"
                        >
                          ⚠ Not Verified - Click to Verify
                        </a>
                      )}
                    </label>
                    <input
                      name="mobile"
                      disabled={!editMode}
                      value={formData.mobile || ""}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      className={`w-full p-3 rounded-lg border ${editMode ? "border-sky-300 bg-white" : "border-transparent bg-gray-100"} ${!editMode ? "text-gray-700 cursor-not-allowed" : "text-gray-900"}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {phoneVerified
                        ? "Your phone is verified and ready for orders"
                        : "Phone verification is required to place orders"}
                    </p>
                  </div>
                </div>

                {/* Address Section */}
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Street Address</label>
                    <input
                      name="address"
                      disabled={!editMode}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main St"
                      className={`w-full p-3 rounded-lg border ${editMode ? "border-sky-300 bg-white" : "border-transparent bg-gray-100"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                    <input
                      name="city"
                      disabled={!editMode}
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-lg border ${editMode ? "border-sky-300 bg-white" : "border-transparent bg-gray-100"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                    <input
                      name="state"
                      disabled={!editMode}
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-lg border ${editMode ? "border-sky-300 bg-white" : "border-transparent bg-gray-100"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ZIP Code</label>
                    <input
                      name="zip"
                      disabled={!editMode}
                      value={formData.zip}
                      onChange={handleChange}
                      className={`w-full p-3 rounded-lg border ${editMode ? "border-sky-300 bg-white" : "border-transparent bg-gray-100"}`}
                    />
                  </div>
                </div>

                {/* Save Button */}
                {editMode && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-sky-600 text-white px-8 py-3 rounded-xl hover:bg-sky-700 transition font-semibold shadow-lg shadow-sky-200"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
