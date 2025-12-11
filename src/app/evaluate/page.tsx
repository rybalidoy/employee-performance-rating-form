import { getEmployees, getSession, getExistingEvaluation, getEvaluatorHistory, getEvaluationPeriod } from "../actions";
import BulkEvaluationTable from "@/components/BulkEvaluationTable";
import RawDataViewer from "@/components/RawDataViewer";
import EvaluationDashboard from "@/components/EvaluationDashboard";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EvaluatePage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string }>;
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    const employees = await getEmployees();
    const evaluatorId = parseInt(session.id); // Assuming session.id is stored

    // Year Logic
    const { year } = await searchParams;
    const currentYear = new Date().getFullYear();
    const selectedYear = year ? parseInt(year) : currentYear;

    // Fetch Period to check lock status
    const period = await getEvaluationPeriod(selectedYear);
    const now = new Date();
    // Open if period exists and we are within range.
    // If no period set for that year, is it locked?
    // Let's assume default is OPEN if current year, but LOCKED if past year?
    // Safer: dependent on admin settings. 
    // Implementation Plan: "Logic: Open if now >= startDate && now <= endDate".
    // Check lock status from database
    let isLocked = true;
    if (period) {
        // Check explicit lock state first
        if (period.isLocked) {
            isLocked = true;
        } else {
            // If not explicitly locked, check date range
            if (now >= period.startDate && now <= period.endDate) {
                isLocked = false;
            } else {
                isLocked = true; // Outside date range
            }
        }
    } else {
        // No period defined
        if (selectedYear === currentYear) isLocked = false; // Default open for current
        else isLocked = true; // Default locked for others
    }

    // Fetch full employee object for the dashboard props
    const evaluator = employees.find(e => e.id === evaluatorId);
    if (!evaluator) redirect("/login");

    // Fetch history for pre-fill
    const history = await getEvaluatorHistory(evaluatorId, selectedYear);

    // Year Selector Component
    const YearSelector = () => (
        <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-sm pl-2">Year:</span>
            <div className="flex gap-1">
                <Link href={`/evaluate?year=${selectedYear - 1}`} className="px-3 py-1 hover:bg-slate-700 rounded text-slate-300">←</Link>
                <span className="px-3 py-1 font-bold text-white min-w-[3rem] text-center">{selectedYear}</span>
                <Link href={`/evaluate?year=${selectedYear + 1}`} className="px-3 py-1 hover:bg-slate-700 rounded text-slate-300">→</Link>
            </div>
        </div>
    );

    if (session.role === "Employee") {
        // Employee View - Peer Review
        // We need existing data for pre-fill (Peer Nominations)
        const { nominations } = await getExistingEvaluation(evaluatorId, 0); // 0 as dummy evaluateeId for peer mode

        return (
            <main className="min-h-screen bg-slate-900 text-white p-6">
                <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Welcome, {session.name}</h1>
                    <YearSelector />
                </div>

                {isLocked && (
                    <div className="max-w-7xl mx-auto mb-6 bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-amber-500 text-xl">🔒</span>
                        <div>
                            <p className="text-amber-200 font-bold">Read Only Mode</p>
                            <p className="text-amber-400/80 text-sm">Evaluation period for {selectedYear} is closed. You can view your submissions but cannot make changes.</p>
                        </div>
                    </div>
                )}

                <EvaluationDashboard
                    evaluator={evaluator}
                    employees={employees}
                    initialNominations={nominations}
                    initialEvaluations={history}
                    isLocked={isLocked}
                />
            </main>
        );
    } else {
        // Admin/DivHead View
        const showRawData = session.role === "Division Head" || session.role === "Assistant Division Head";
        let evaluations: any[] = [];
        if (showRawData) {
            const stats = await import("../actions").then(m => m.getDashboardStats());
            // NOTE: getDashboardStats defaults to current year. We might need to update it to accept year too?
            // User requested "users can also see past records". 
            // For now, let's list evaluations from 'history' which WE DID fetch with year.
            evaluations = history; // 'history' contains the evaluations made by THIS evaluator.
            // Wait, RawDataViewer usually shows ALL evaluations for the company?
            // "Division Head sees...". If they want to see company stats for past years, we need to update getDashboardStats.
            // But here, 'evaluations' variable was filled from getDashboardStats().
            // Let's update evaluations logic if needed. 
            // For now, relying on 'history' (my evaluations) for the TABLE. 
            // Detailed stats viewing is likely on Dashboard page, not Evaluate page.
        }

        return (
            <main className="min-h-screen bg-slate-900 text-white p-6">
                <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Welcome, {session.name}</h1>
                    <YearSelector />
                </div>

                {isLocked && (
                    <div className="max-w-7xl mx-auto mb-6 bg-amber-500/10 border border-amber-500/50 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-amber-500 text-xl">🔒</span>
                        <div>
                            <p className="text-amber-200 font-bold">Read Only Mode</p>
                            <p className="text-amber-400/80 text-sm">Evaluation period for {selectedYear} is closed. You can view your submissions but cannot make changes.</p>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto">
                    <BulkEvaluationTable
                        employees={employees}
                        evaluator={evaluator}
                        initialEvaluations={history}
                        isLocked={isLocked}
                    />


                    {
                        showRawData && evaluations && (
                            <RawDataViewer evaluations={evaluations} />
                        )
                    }
                </div >
            </main >
        );
    }
}