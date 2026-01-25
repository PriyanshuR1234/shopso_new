import React from "react";

export default function StatBox({ label, value }) {
    return (
        <div className="bg-white border-2 rounded-lg p-3 text-center shadow-sm hover:shadow-md transition">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}
