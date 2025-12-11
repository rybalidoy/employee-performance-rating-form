"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";
import { useRouter } from "next/navigation";

type Props = {
    user: any;
};

export default function ProfileForm({ user }: Props) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        first_name: user.first_name,
        last_name: user.last_name,
        middle_initial: user.middle_initial || "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await updateProfile(user.id, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                middle_initial: formData.middle_initial,
                password: formData.password
            });
            setMessage("Profile updated successfully!");
            router.refresh();
            setFormData(prev => ({ ...prev, password: "", confirmPassword: "" })); // Clear password
        } catch (e) {
            console.error(e);
            setMessage("Error updating profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                    <input
                        type="text" name="first_name" required
                        value={formData.first_name} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                    <input
                        type="text" name="last_name" required
                        value={formData.last_name} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Middle Initial</label>
                    <input
                        type="text" name="middle_initial" maxLength={3}
                        value={formData.middle_initial} onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Username (Read-only)</label>
                    <input
                        type="text" value={user.username} disabled
                        className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-slate-400 cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                        <input
                            type="password" name="password"
                            placeholder="Leave blank to keep current"
                            value={formData.password} onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
                        <input
                            type="password" name="confirmPassword"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword} onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white"
                        />
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.includes("Error") || message.includes("match") ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                    {message}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit" disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
