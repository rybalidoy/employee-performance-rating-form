"use strict";

import { getEvaluationPeriod, setEvaluationPeriod, getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import AdminSettingsForm from "@/components/AdminSettingsForm";

export default async function AdminSettingsPage() {
    const session = await getSession();
    if (!session || session.role !== "Admin") redirect("/");

    const currentYear = new Date().getFullYear();
    const period = await getEvaluationPeriod(currentYear);

    return (
        <main className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">System Settings</h1>

                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
                    <h2 className="text-xl font-bold mb-6">Evaluation Period ({currentYear})</h2>
                    <p className="text-slate-400 mb-6">
                        Set the start and end dates for the evaluation period.
                        Outside of this range, users cannot submit evaluations, and the dashboard will show final statistics.
                    </p>

                    <AdminSettingsForm
                        initialStartDate={period?.startDate}
                        initialEndDate={period?.endDate}
                        year={currentYear}
                    />
                </div>
            </div>
        </main>
    );
}
