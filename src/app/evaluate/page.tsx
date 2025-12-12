import { getEmployees, getSession, getExistingEvaluation, getEvaluatorHistory, getEvaluationPeriod } from "../actions";
import BulkEvaluationTable from "@/components/BulkEvaluationTable";
import RawDataViewer from "@/components/RawDataViewer";
import EvaluationDashboard from "@/components/EvaluationDashboard";
import NomineeForm from "@/components/NomineeForm";
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
    let isLocked = true; // Initialize as locked by default
    // Open if period exists and we are within range.
    // If no period set for that year, is it locked?
    // Let's assume default is OPEN if current year, but LOCKED if past year?
    // Safer: dependent on admin settings. 
    // Implementation Plan: "Logic: Open if now >= startDate && now <= endDate".
    // Check lock status from database
    if (period) {
        const now = new Date();
        // 1. Check Manual Force Lock
        if (period.isManuallyLocked) {
            isLocked = true;
        }
        // 2. Check System Auto Lock
        else if (period.isLocked) {
            isLocked = true;
        }
        // 3. Check Manual Unlock Override (Bypass date check)
        else if (period.isManuallyUnlocked) {
            isLocked = false;
        }
        else {
            // 4. Default Date Check
            if (now >= period.startDate && now <= period.endDate) {
                isLocked = false;
            } else {
                isLocked = true;
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

        // Fetch Admin's own nominations
        const { nominations } = await getExistingEvaluation(evaluatorId, 0);

        let evaluations: any[] = [];
        if (showRawData) {
            // ... (keep existing logic)
            // For now, relying on 'history' (my evaluations) for the TABLE. 
            evaluations = history;
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

                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Admin Nominee Form */}
                    <NomineeForm
                        evaluator={evaluator}
                        employees={employees}
                        initialNominees={nominations}
                        isLocked={isLocked}
                        initialEvaluations={history}
                    />

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