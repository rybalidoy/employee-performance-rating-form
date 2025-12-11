"use client";

import { useState } from "react";
import { updatePassword } from "@/app/actions";

type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    role: { name: string };
};

export default function UserManagementList({ employees }: { employees: Employee[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handlePasswordUpdate = async (id: number) => {
        const newPassword = prompt("Enter new password (min 6 chars):");
        if (!newPassword || newPassword.length < 6) {
            if (newPassword) alert("Password too short.");
            return;
        }

        setLoadingId(id);
        await updatePassword(id, newPassword);
        setLoadingId(null);
        alert("Password updated successfully.");
    };

    const filtered = employees.filter(e =>
        e.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="p-4 border-b border-slate-700">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {filtered.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-200">
                                {emp.last_name}, {emp.first_name}
                            </td>
                            <td className="px-6 py-4 text-slate-400">{emp.username}</td>
                            <td className="px-6 py-4">
                                <span className={`text-xs px-2 py-1 rounded-full border ${emp.role.name === 'Admin' ? 'border-purple-500 text-purple-400 bg-purple-500/10' :
                                        emp.role.name === 'Division Head' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' :
                                            'border-slate-500 text-slate-400 bg-slate-500/10'
                                    }`}>
                                    {emp.role.name}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handlePasswordUpdate(emp.id)}
                                    disabled={loadingId === emp.id}
                                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded transition-colors disabled:opacity-50"
                                >
                                    {loadingId === emp.id ? "Updating..." : "Reset Password"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
