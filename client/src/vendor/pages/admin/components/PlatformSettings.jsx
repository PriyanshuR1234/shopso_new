import React, { useState, useEffect } from "react";
import supabase from "../../../../utils/supabaseClient";
import toast from "react-hot-toast";

export default function PlatformSettings() {
    const [returnDays, setReturnDays] = useState(7);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from("platform_settings")
                .select("*")
                .eq("setting_key", "return_days_window")
                .single();

            if (error && error.code !== "PGRST116") throw error;
            if (data) {
                setReturnDays(data.setting_value.days);
            }
        } catch (err) {
            console.error("Load settings error:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("platform_settings")
                .upsert({
                    setting_key: "return_days_window",
                    setting_value: { days: Number(returnDays) },
                    updated_at: new Date().toISOString()
                }, { onConflict: "setting_key" });

            if (error) throw error;
            toast.success("Return policy updated!");
        } catch (err) {
            console.error("Save settings error:", err);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Loading settings...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-3">Global Configuration</h2>

            <div className="max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-black text-gray-500 uppercase mb-2">Refund Policy Window (Days)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            className="border-2 rounded-xl px-4 py-2 w-32 font-bold text-lg outline-none focus:border-black transition"
                            value={returnDays}
                            onChange={(e) => setReturnDays(e.target.value)}
                        />
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="bg-black text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Update Policy"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 italic">
                        Customers will see the "Refund" button hidden after this many days from their order date.
                    </p>
                </div>
            </div>
        </div>
    );
}
