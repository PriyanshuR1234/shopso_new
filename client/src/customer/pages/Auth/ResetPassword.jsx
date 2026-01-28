import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import supabase from "../../../utils/supabaseClient";
import { updatePassword, sendPhoneOTP, verifyPhoneOTP } from "../../../api/auth";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: OTP, 2: New Password
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is authenticated (via recovery link)
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Invalid or expired reset link.");
                navigate("/user/login");
                return;
            }
            setUser(user);

            // Try to get phone from profile if not in auth
            const { data: profile } = await supabase
                .from("users")
                .select("phone")
                .eq("id", user.id)
                .single();

            if (profile?.phone) {
                setPhoneNumber(profile.phone);
            }
        };
        checkUser();
    }, [navigate]);

    const handleSendOTP = async () => {
        if (!phoneNumber) {
            toast.error("Please provide your phone number");
            return;
        }
        setLoading(true);
        const { error } = await sendPhoneOTP(phoneNumber);
        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("OTP sent to your phone!");
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await verifyPhoneOTP(phoneNumber, otp);
        setLoading(false);

        if (error) {
            toast.error("Invalid OTP. Please try again.");
        } else {
            toast.success("Phone verified! Now set your new password.");
            setStep(2);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        const { error } = await updatePassword(password);

        // Also sync phone to profile if it was verified
        if (!error) {
            await supabase.from("users").update({ phone: phoneNumber }).eq("id", user.id);
        }

        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password updated successfully! 🎉");
            setTimeout(() => navigate("/user/login"), 2000);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-sky-600 to-blue-600 text-transparent bg-clip-text">
                    Reset Password
                </h1>

                {step === 1 ? (
                    <div className="space-y-6">
                        <p className="text-gray-600 text-center text-sm">
                            For security, please verify your identity via phone OTP before resetting your password.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition px-4"
                                    placeholder="Phone Number (e.g. +1...)"
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                    className="bg-gray-100 text-gray-700 px-4 rounded-xl hover:bg-gray-200 transition font-medium text-sm border"
                                >
                                    Send OTP
                                </button>
                            </div>

                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <input
                                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition text-center text-xl tracking-widest"
                                    placeholder="Enter 6-digit OTP"
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <button
                                    disabled={loading || !otp}
                                    className="w-full bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition font-semibold"
                                >
                                    {loading ? "Verifying..." : "Verify & Continue"}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-gray-600 text-center text-sm mb-4">
                            Verification successful. You can now choose a new password.
                        </p>
                        <input
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition"
                            placeholder="New Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition"
                            placeholder="Confirm New Password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition font-semibold"
                        >
                            {loading ? "Updating..." : "Reset Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
