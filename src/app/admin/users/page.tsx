"use strict";

import { getEmployees, deleteEmployee, getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import UserManagementClient from "@/components/UserManagementClient"; // We need a client wrapper for interactivity

export default async function UserManagementPage() {
    const session = await getSession();
    if (!session || session.role !== "Admin") redirect("/");

    const employees = await getEmployees();

    return (
        <main className="min-h-screen bg-slate-900 text-white p-6">
            <UserManagementClient initialEmployees={employees} />
        </main>
    );
}
