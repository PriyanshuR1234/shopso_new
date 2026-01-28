import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPasswordRequest } from "../../../api/auth";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await resetPasswordRequest(email);
        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            setSent(true);
            toast.success("Reset link sent! Please check your email.");
        }
    };

    if (sent) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
                <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
                    <div className="text-6xl mb-6">📩</div>
                    <h1 className="text-3xl font-extrabold mb-4 text-gray-900">Check Your Email</h1>
                    <p className="text-gray-600 mb-8">
                        If an account exists for <span className="font-semibold text-gray-800">{email}</span>, you will receive a password reset link shortly.
                    </p>
                    <Link
                        to="/user/login"
                        className="text-sky-600 font-semibold hover:underline"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm">
                <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-sky-600 to-blue-600 text-transparent bg-clip-text">
                    Forgot Password
                </h1>
                <p className="text-gray-600 text-center mb-6 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition"
                        placeholder="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <button
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition font-semibold"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link
                        to="/user/login"
                        className="text-sky-600 font-semibold hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
