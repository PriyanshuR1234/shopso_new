import React, { useState } from "react";
import StatBox from "./StatBox";

export default function AdminVendors({ vendors, filter, setFilter, onApprove, onBan, onUpdateCommission }) {
    const [expandedVendor, setExpandedVendor] = useState(null);
    const [commissionDrafts, setCommissionDrafts] = useState({});

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <h2 className="text-xl md:text-2xl font-bold">Vendors</h2>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border-2 rounded-lg px-3 md:px-4 py-2 font-medium text-sm md:text-base w-full md:w-auto outline-none focus:ring-2 focus:ring-black"
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="banned">Banned</option>
                    <option value="all">All Vendors</option>
                </select>
            </div>

            <div className="space-y-4">
                {vendors.map((vendor) => (
                    <div key={vendor.id} className="border-2 rounded-xl p-4 md:p-6 bg-gray-50 hover:border-gray-300 transition-colors">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900">{vendor.shop_name || "Unknown Shop"}</h3>
                                <p className="text-xs md:text-sm text-gray-600">Owner: {vendor.name || "N/A"}</p>
                                <p className="text-xs md:text-sm text-gray-600 truncate">Email: {vendor.user_email || "N/A"}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${vendor.status === "approved" ? "bg-green-100 text-green-800 border-green-200" :
                                        vendor.status === "banned" ? "bg-red-100 text-red-800 border-red-200" :
                                            "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    }`}>
                                    {(vendor.status || "pending").toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <StatBox label="Products" value={vendor.totalProducts || 0} />
                            <StatBox label="Orders" value={vendor.totalOrders || 0} />
                            <StatBox label="Revenue" value={`₹${vendor.vendorRevenue || 0}`} />
                            <StatBox label="Commission" value={`${vendor.commission_rate || 10}%`} />
                        </div>

                        <p className="text-xs md:text-sm text-gray-700 mb-4 line-clamp-2">{vendor.shop_description || "No description"}</p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 items-start md:items-end mt-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                                <label className="text-xs md:text-sm font-semibold whitespace-nowrap">Edit Commission %:</label>
                                <div className="flex gap-1 w-full sm:w-auto">
                                    <input
                                        type="number"
                                        className="border-2 rounded px-2 md:px-3 py-1 w-20 md:w-24 font-medium text-sm"
                                        value={commissionDrafts[vendor.id] ?? vendor.commission_rate ?? ""}
                                        onChange={(e) => setCommissionDrafts({ ...commissionDrafts, [vendor.id]: e.target.value })}
                                    />
                                    <button
                                        className="px-3 md:px-4 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 text-xs md:text-sm transition shadow-sm"
                                        onClick={() => onUpdateCommission(vendor.id, commissionDrafts[vendor.id])}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            <button
                                className="px-3 md:px-4 py-1 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 text-xs md:text-sm"
                                onClick={() => setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id)}
                            >
                                {expandedVendor === vendor.id ? "Hide" : "View"} Products
                            </button>

                            {vendor.status !== "approved" && (
                                <button
                                    className="px-3 md:px-4 py-1 bg-green-600 text-white rounded font-medium hover:bg-green-700 text-xs md:text-sm"
                                    onClick={() => onApprove(vendor.id, commissionDrafts[vendor.id])}
                                >
                                    ✓ Approve
                                </button>
                            )}

                            {vendor.status !== "banned" && (
                                <button
                                    className="px-3 md:px-4 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700 text-xs md:text-sm"
                                    onClick={() => onBan(vendor.id)}
                                >
                                    ✕ Ban
                                </button>
                            )}
                        </div>

                        {/* Expanded Products */}
                        {expandedVendor === vendor.id && vendor.totalProducts > 0 && (
                            <div className="mt-4 pt-4 border-t-2 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <h4 className="font-bold text-gray-800 text-sm">Products ({vendor.totalProducts})</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                                    {(vendor.products || []).map((product) => (
                                        <div key={product.id} className="bg-white border rounded-lg p-3 flex gap-3 shadow-sm hover:shadow-md transition">
                                            {product.product_images?.[0]?.image_url ? (
                                                <img
                                                    src={product.product_images[0].image_url}
                                                    className="w-12 md:w-16 h-12 md:h-16 object-cover rounded"
                                                    alt={product.name}
                                                />
                                            ) : (
                                                <div className="w-12 md:w-16 h-12 md:h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-[10px]">No Image</div>
                                            )}
                                            <div className="flex-1 text-xs md:text-sm">
                                                <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                                                <p className="text-blue-600 font-bold">₹{product.price}</p>
                                                <div className="flex gap-3 text-gray-500 mt-1">
                                                    <span>Stock: {product.stock}</span>
                                                    <span>Sold: {product.sold || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {vendors.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium italic">No vendors found for this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
