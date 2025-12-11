import { getEmployees, getSession } from "@/app/actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import UserManagementList from "@/components/UserManagementList";

export default async function AdminUsersPage() {
    const session = await getSession();
    if (!session || session.role !== "Admin") {
        redirect("/login");
    }

    const employees = await getEmployees();

    return (
        <main className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        User Management
                    </h1>
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        Dashboard &rarr;
                    </Link>
                </div>

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <UserManagementList employees={employees} />
                </div>
            </div>
        </main>
    );
}
