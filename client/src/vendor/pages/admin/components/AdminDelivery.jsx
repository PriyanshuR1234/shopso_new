import React from "react";

export default function AdminDelivery({ partners, newPartner, setNewPartner, onAddPartner, onUpdateStatus }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold">Delivery Partners</h2>

            {/* Add Partner Form */}
            <div className="bg-gray-50 rounded-xl p-4 border-2 space-y-3">
                <p className="font-semibold text-sm md:text-base italic">Onboard New Logistics Partner</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs md:text-sm font-black text-gray-500 uppercase">Partner Name *</label>
                        <input
                            className="border-2 rounded px-2 md:px-3 py-2 w-full mt-1 font-medium text-sm outline-none focus:border-black transition"
                            value={newPartner.name}
                            onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                            placeholder="e.g. FastShip"
                        />
                    </div>
                    <div>
                        <label className="text-xs md:text-sm font-black text-gray-500 uppercase">Phone</label>
                        <input
                            className="border-2 rounded px-2 md:px-3 py-2 w-full mt-1 font-medium text-sm outline-none focus:border-black transition"
                            value={newPartner.phone}
                            onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                            placeholder="+91..."
                        />
                    </div>
                    <div>
                        <label className="text-xs md:text-sm font-black text-gray-500 uppercase">Email</label>
                        <input
                            type="email"
                            className="border-2 rounded px-2 md:px-3 py-2 w-full mt-1 font-medium text-sm outline-none focus:border-black transition"
                            value={newPartner.email || ""}
                            onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                            placeholder="partner@ship.com"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            className="w-full px-3 md:px-4 py-2 bg-black text-white rounded font-bold hover:bg-gray-800 transition shadow-lg"
                            onClick={onAddPartner}
                        >
                            Onboard Partner
                        </button>
                    </div>
                </div>
            </div>

            {/* Partners List */}
            <div className="space-y-3">
                {partners.map((p) => (
                    <div key={p.id} className="border-2 rounded-xl p-4 bg-gray-50 hover:bg-white transition shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                            <div>
                                <p className="font-bold text-sm md:text-lg">{p.name}</p>
                                <p className="text-xs md:text-sm text-gray-600">{p.phone || "No phone contact"}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`w-2 h-2 rounded-full ${p.status === "active" ? "bg-green-500" : p.status === "on-hold" ? "bg-yellow-500" : "bg-red-500"
                                        }`}></div>
                                    <span className="text-xs font-black uppercase text-gray-500">{p.status}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <button
                                    className="flex-1 md:flex-none px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded text-xs font-bold hover:bg-green-200 transition"
                                    onClick={() => onUpdateStatus(p.id, "active")}
                                >
                                    Active
                                </button>
                                <button
                                    className="flex-1 md:flex-none px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded text-xs font-bold hover:bg-yellow-200 transition"
                                    onClick={() => onUpdateStatus(p.id, "on-hold")}
                                >
                                    Hold
                                </button>
                                <button
                                    className="flex-1 md:flex-none px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-xs font-bold hover:bg-red-200 transition"
                                    onClick={() => onUpdateStatus(p.id, "inactive")}
                                >
                                    Disable
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {partners.length === 0 && (
                    <p className="text-center text-gray-400 py-12 italic">No delivery partners registered.</p>
                )}
            </div>
        </div>
    );
}
