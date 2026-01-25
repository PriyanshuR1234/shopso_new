import React from "react";

export default function StatCard({ title, value, color }) {
    const colorClasses = {
        green: "bg-green-50 border-green-200 text-green-700",
        red: "bg-red-50 border-red-200 text-red-700",
        yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
        blue: "bg-blue-50 border-blue-200 text-blue-700",
        purple: "bg-purple-50 border-purple-200 text-purple-700",
    };

    return (
        <div className={`${colorClasses[color]} border-2 rounded-lg p-4 shadow-sm hover:translate-y-[-2px] transition-transform`}>
            <p className="text-sm font-bold uppercase tracking-wide opacity-80">{title}</p>
            <p className="text-3xl font-black mt-1 leading-none">{value}</p>
        </div>
    );
}
