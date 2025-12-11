"use client";

import { useState } from "react";
import UserFormModal from "./UserFormModal";
import { deleteEmployee } from "@/app/actions";
import { useRouter } from "next/navigation";

type Props = {
    initialEmployees: any[];
};

export default function UserManagementClient({ initialEmployees }: Props) {
    const router = useRouter(); // To refresh data
    const [employees, setEmployees] = useState(initialEmployees);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const handleAdd = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            await deleteEmployee(id);
            router.refresh(); // Refresh server data
            // Optimistic update unlikely needed for admin panel, but router.refresh is good.
            // Actually, we might want to update local state too or just wait for refresh.
            // Let's just use router.refresh() and useEffect? 
            // Better: server action revalidates path.
            window.location.reload(); // Simple reload for now to sync
        }
    };

    const handleSuccess = () => {
        window.location.reload();
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    + Add User
                </button>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
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
                        {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-700/30">
                                <td className="px-6 py-4 font-medium text-slate-200">
                                    {emp.last_name}, {emp.first_name} {emp.middle_initial}
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    {emp.username}
                                </td>
                                <td className="px-6 py-4 text-slate-300">
                                    {emp.role.name}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(emp)}
                                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(emp.id)}
                                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={editingUser}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
