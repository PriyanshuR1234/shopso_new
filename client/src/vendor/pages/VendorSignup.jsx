import { useState } from "react";
import { vendorSignup, signInWithGoogle } from "../../api/auth";
import supabase from "../../utils/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function VendorSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shop_name: "",
    shop_description: "",
  });

  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const registerVendor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      let aadhaar_url = null;
      if (aadhaarImage) {
        try {
          const path = `aadhaar_${Date.now()}_${aadhaarImage.name}`;
          const { error: uploadErr } = await supabase.storage
            .from("product-images")
            .upload(path, aadhaarImage);

          if (uploadErr) throw uploadErr;

          const { data } = supabase.storage.from("product-images").getPublicUrl(path);
          aadhaar_url = data.publicUrl;
        } catch (uploadErr) {
          console.error("Supabase upload error:", uploadErr);
          toast.error("Image upload failed. Please try again.");
          setLoading(false);
          return;
        }
      }

      const { error } = await vendorSignup({
        ...form,
        aadhaar_url,
      });

      if (error) {
        toast.error(error);
      } else {
        setConfirmed(true);
        toast.success("Registration initiated! Please verify your email. 🎉");
      }
    } catch (err) {
      console.error("Signup exception:", err);
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
          <div className="text-6xl mb-6">📬</div>
          <h1 className="text-3xl font-extrabold mb-4 text-gray-900">
            Verify Vendor Email
          </h1>
          <p className="text-gray-600 mb-8">
            Step 1 complete! We've sent a verification link to <span className="font-semibold">{form.email}</span>.
            Once verified, your profile will be reviewed by admin.
          </p>
          <button
            onClick={() => navigate("/vendor/login")}
            className="w-full bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Vendor Signup</h2>

        <form onSubmit={registerVendor} className="space-y-4">

          <input
            name="name"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg"
            required
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            required
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            required
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone Number"
            className="w-full p-3 border rounded-lg"
            required
            onChange={handleChange}
          />

          <input
            name="shop_name"
            placeholder="Shop Name"
            className="w-full p-3 border rounded-lg"
            required
            onChange={handleChange}
          />

          <textarea
            name="shop_description"
            placeholder="Shop Description"
            className="w-full p-3 border rounded-lg"
            required
            onChange={handleChange}
          />

          <label className="font-semibold">Upload Aadhaar Card:</label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-sky-500", "bg-sky-50");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-sky-500", "bg-sky-50");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-sky-500", "bg-sky-50");
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setAadhaarImage(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-all group"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="aadhaar-upload"
              onChange={(e) => setAadhaarImage(e.target.files[0])}
            />
            <label htmlFor="aadhaar-upload" className="cursor-pointer block">
              {aadhaarImage ? (
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{aadhaarImage.name}</span>
                  <span className="text-xs text-green-600 mt-1">Ready to upload ✓</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl">📄</div>
                  <p className="text-sm text-gray-500">Drag & drop or <span className="text-sky-600 font-semibold group-hover:underline">browse</span></p>
                  <p className="text-xs text-gray-400">JPG, PNG, PDF up to 5MB</p>
                </div>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="border-t border-gray-200"></div>
          <p className="text-center text-sm text-gray-500 -mt-3 bg-white w-fit mx-auto px-2">
            OR
          </p>
        </div>

        <button
          onClick={async () => {
            const { error } = await signInWithGoogle("vendor");
            if (error) {
              toast.error(error.message || "Google signup failed");
            }
          }}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 p-3 rounded-xl hover:bg-gray-50 transition shadow-sm mb-4"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google"
            className="w-5 h-5"
          />
          <span className="font-medium">Sign up with Google</span>
        </button>

        <p className="text-center text-gray-600 mt-4">
          Already registered?{" "}
          <Link to="/vendor/login" className="text-sky-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
