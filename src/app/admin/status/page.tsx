"use strict";

import { getRespondentStatus, getSession } from "@/app/actions";
import { redirect } from "next/navigation";

export default async function RespondentStatusPage() {
    const session = await getSession();
    if (!session || session.role !== "Admin") redirect("/");

    const respondents = await getRespondentStatus();
    const completedCount = respondents.filter(r => r.isCompleted).length;
    const progressPercentage = (completedCount / respondents.length) * 100;

    return (
        <main className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Respondent Status</h1>
                    <div className="text-right">
                        <p className="text-slate-400">Total Progress</p>
                        <p className="text-2xl font-bold text-indigo-400">
                            {completedCount} / {respondents.length} ({progressPercentage.toFixed(0)}%)
                        </p>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Progress / Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {respondents.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-700/30">
                                    <td className="px-6 py-4 font-medium text-slate-200">
                                        {r.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {r.role}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.isCompleted
                                                ? "bg-green-400/10 text-green-400"
                                                : "bg-amber-400/10 text-amber-400"
                                            }`}>
                                            {r.isCompleted ? "Completed" : "Pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        {r.progress}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
