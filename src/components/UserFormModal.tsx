"use client";

import { useState, useEffect } from "react";
import { getRoles, createEmployee, updateEmployee } from "@/app/actions";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    user?: any; // If set, edit mode
    onSuccess: () => void;
};

export default function UserFormModal({ isOpen, onClose, user, onSuccess }: Props) {
    const [roles, setRoles] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        middle_initial: "",
        username: "",
        password: "",
        roleId: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getRoles().then(setRoles);
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                middle_initial: user.middle_initial || "",
                username: user.username,
                password: "", // Don't show password
                roleId: user.roleId.toString()
            });
        } else {
            setFormData({
                first_name: "",
                last_name: "",
                middle_initial: "",
                username: "",
                password: "",
                roleId: ""
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (user) {
                await updateEmployee(user.id, formData);
            } else {
                await createEmployee(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white">{user ? "Edit User" : "Add User"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">First Name</label>
                            <input
                                required
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                                value={formData.first_name}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Last Name</label>
                            <input
                                required
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                                value={formData.last_name}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Middle Initial</label>
                        <input
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                            maxLength={1}
                            value={formData.middle_initial}
                            onChange={e => setFormData({ ...formData, middle_initial: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Username</label>
                        <input
                            required
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            disabled={!!user} // Allow edit? Maybe no for username.
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Password {user && "(Leave blank to keep)"}</label>
                        <input
                            type="password"
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required={!user}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Role</label>
                        <select
                            required
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                            value={formData.roleId}
                            onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                        >
                            <option value="">Select Role</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
