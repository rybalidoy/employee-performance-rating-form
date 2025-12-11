import { getEmployees, getSession, getExistingEvaluation } from "../actions";
import EvaluatorSelector from "@/components/EvaluatorSelector"; // Reuse for Evaluatee selection
import EvaluationDashboard from "@/components/EvaluationDashboard";
import { redirect } from "next/navigation";

export default async function EvaluatePage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const employees = await getEmployees();
    const evaluatorId = parseInt(session.id); // Assuming session.id is stored

    // Fetch full employee object for the dashboard props
    const evaluator = employees.find(e => e.id === evaluatorId);
    if (!evaluator) redirect("/login");

    if (session.role === "Employee") {
        // Employee View - Peer Review
        // We need existing data for pre-fill (Peer Nominations)
        const { nominations } = await getExistingEvaluation(evaluatorId, 0); // 0 as dummy evaluateeId for peer mode

        return (
            <main className="min-h-screen bg-slate-900 text-white p-6">
                <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Welcome, {session.name}</h1>
                    <form action={async () => { "use server"; await import("../actions").then(m => m.logout()) }}>
                        <button className="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">Logout</button>
                    </form>
                </div>
                <EvaluationDashboard
                    evaluator={evaluator}
                    employees={employees}
                    initialNominations={nominations}
                />
            </main>
        );
    } else {
        // Admin/DivHead View - Select Employee to Rate
        return (
            <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md flex justify-end mb-4 absolute top-6 right-6">
                    <form action={async () => { "use server"; await import("../actions").then(m => m.logout()) }}>
                        <button className="text-sm bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">Logout</button>
                    </form>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold mb-2">Welcome, {session.name}</h1>
                    <p className="text-slate-400">Select an employee to evaluate.</p>
                </div>

                <EvaluatorSelector employees={employees} />
            </main>
        );
    }
}