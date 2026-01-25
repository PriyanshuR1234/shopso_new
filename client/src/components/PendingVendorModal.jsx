import React from "react";

export default function PendingVendorModal() {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl text-center">

                <img
                    src="https://cdn-icons-png.flaticon.com/512/565/565547.png"
                    className="w-20 mx-auto mb-4 opacity-80"
                />

                <h2 className="text-2xl font-bold mb-2">Approval Pending</h2>

                <p className="text-gray-600 leading-relaxed">
                    Your vendor account is pending approval.
                    Please wait while our admin verifies your Aadhaar.
                </p>

                <button
                    onClick={() => (window.location.href = "/")}
                    className="mt-6 bg-blue-600 text-white w-full py-3 rounded-xl hover:bg-blue-700 transition"
                >
                    Go to Homepage
                </button>
            </div>
        </div>
    );
}
