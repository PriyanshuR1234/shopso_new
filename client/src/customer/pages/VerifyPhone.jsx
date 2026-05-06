import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import supabase from "../../utils/supabaseClient";
import { sendPhoneOTP, verifyPhoneOTP } from "../../api/auth";

export default function VerifyPhone() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";

    const [user, setUser] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        // Get current user and their phone if already exists
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please login first");
                navigate("/user/login");
                return;
            }
            setUser(user);

            // Fetch phone from database
            const { data: profile } = await supabase
                .from("users")
                .select("phone, phone_verified")
                .eq("id", user.id)
                .single();

            // Allow re-verification for updates - removed auto-redirect
            // if (profile?.phone_verified) {
            //     toast.success("Phone already verified!");
            //     navigate(`/${redirectTo}`);
            //     return;
            // }

            if (profile?.phone) {
                setPhoneNumber(profile.phone);
            }
        };
        fetchUser();
    }, [navigate, redirectTo]);

    useEffect(() => {
        // Countdown timer for resend
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;

        const { error } = await sendPhoneOTP(formattedPhone);
        setLoading(false);

        if (error) {
            toast.error(error.message || "Failed to send OTP");
        } else {
            setOtpSent(true);
            setResendTimer(60); // 60 seconds cooldown
            toast.success("OTP sent to your phone!");
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;

        const { error } = await verifyPhoneOTP(formattedPhone, otp);

        if (error) {
            setLoading(false);
            toast.error("Invalid OTP. Please try again.");
            return;
        }

        // Update phone_verified in database using Secure RPC to avoid RLS issues
        const { error: updateError } = await supabase.rpc("verify_and_update_phone", {
            p_id: user.id,
            p_phone: formattedPhone,
            p_phone_verified: true
        });

        // Fetch updated profile for local storage sync
        const { data: updatedProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        setLoading(false);

        if (updateError) {
            console.error("Update error:", updateError);
            toast.error(`Failed to save verification: ${updateError.message || 'Unknown error'}`);
        } else {
            toast.success("Phone verified successfully! 🎉");
            // Update local storage with verified phone
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            if (currentUser && updatedProfile) {
                currentUser.profile = { ...currentUser.profile, ...updatedProfile };
                localStorage.setItem("user", JSON.stringify(currentUser));
                window.dispatchEvent(new Event("user-session-change"));
            }
            setTimeout(() => navigate(`/${redirectTo}`), 1500);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">📱</div>
                    <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-sky-600 to-blue-600 text-transparent bg-clip-text">
                        Verify Your Phone
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Phone verification is required to place orders
                    </p>
                </div>

                {!otpSent ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition"
                                    placeholder="Enter phone number"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading || !phoneNumber}
                                    className="bg-sky-600 text-white px-6 rounded-xl hover:bg-sky-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Enter with country code (e.g., +91 for India) or just 10 digits
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter OTP Code
                            </label>
                            <input
                                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition text-center text-2xl tracking-widest"
                                placeholder="000000"
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                OTP sent to {phoneNumber}
                            </p>
                        </div>

                        <button
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Verify & Continue"}
                        </button>

                        <div className="text-center">
                            {resendTimer > 0 ? (
                                <p className="text-sm text-gray-500">
                                    Resend OTP in {resendTimer}s
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpSent(false);
                                        setOtp("");
                                    }}
                                    className="text-sm text-sky-600 hover:underline font-medium"
                                >
                                    Change Phone Number or Resend
                                </button>
                            )}
                        </div>
                    </form>
                )}

                <button
                    onClick={() => navigate(`/${redirectTo}`)}
                    className="w-full mt-6 text-gray-600 text-sm hover:text-gray-800 transition"
                >
                    ← Back to {redirectTo === "checkout" ? "Checkout" : "Home"}
                </button>
            </div>
        </div>
    );
}
