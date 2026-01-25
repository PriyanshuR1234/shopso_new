import React, { useState, useEffect } from "react";
import supabase from "../../../../utils/supabaseClient";
import toast from "react-hot-toast";

export default function AdminNotifications({ userId }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        loadNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel('admin-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
                toast("System Alert! Check your notifications.", { icon: "🔔" });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const loadNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(10);

            if (error) throw error;
            setNotifications(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return null;

    return (
        <div className="bg-white rounded-2xl shadow-lg border p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    System Alerts
                    {notifications.filter(n => !n.is_read).length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                            {notifications.filter(n => !n.is_read).length} NEW
                        </span>
                    )}
                </h2>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${n.is_read ? "bg-gray-50 border-transparent opacity-60" : "bg-blue-50 border-blue-100 scale-[1.01]"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${n.type === 'refund' ? "bg-red-100 text-red-700" :
                                n.type === 'vendor' ? "bg-yellow-100 text-yellow-700" :
                                    "bg-blue-100 text-blue-700"
                                }`}>
                                {n.type}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="font-bold text-sm text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                        {n.link && (
                            <a
                                href={n.link}
                                className="inline-block mt-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                            >
                                View Details →
                            </a>
                        )}
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-10 italic text-gray-400 text-sm border-2 border-dashed rounded-xl">
                        No system alerts at the moment.
                    </div>
                )}
            </div>
        </div>
    );
}
