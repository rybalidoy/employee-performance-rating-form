import { getEmployees, getSession, getExistingEvaluation, getEvaluatorHistory } from "../actions";
import BulkEvaluationTable from "@/components/BulkEvaluationTable";
import RawDataViewer from "@/components/RawDataViewer";
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

    // Fetch history for pre-fill
    const history = await getEvaluatorHistory(evaluatorId);

    if (session.role === "Employee") {
        // Employee View - Peer Review
        // We need existing data for pre-fill (Peer Nominations)
        const { nominations } = await getExistingEvaluation(evaluatorId, 0); // 0 as dummy evaluateeId for peer mode

        return (
            <main className="min-h-screen bg-slate-900 text-white p-6">
                <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Welcome, {session.name}</h1>
                    {/* <form action={async () => { "use server"; await import("../actions").then(m => m.logout()) }}>
                        <button className="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">Logout</button>
                    </form> */}
                </div>
                <EvaluationDashboard
                    evaluator={evaluator}
                    employees={employees}
                    initialNominations={nominations}
                    initialEvaluations={history}
                />
            </main>
        );
    } else {
        // Admin/DivHead View - Bulk Rating + Raw Data for Div Head
        // Note: Div Head sees Quality/Productivity. Admin sees Punctuality/Uniform.
        // Handled inside BulkEvaluationTable based on role.

        const showRawData = session.role === "Division Head" || session.role === "Assistant Division Head";
        let evaluations: any[] = [];
        if (showRawData) {
            // We need to fetch evaluations. Since getDashboardStats returns them now, let's reuse or fetch directly.
            // Using getDashboardStats might be heavy if we just want raw list.
            // But we modified getDashboardStats to include it.
            const stats = await import("../actions").then(m => m.getDashboardStats());
            evaluations = stats.evaluations;
        }

        return (
            <main className="min-h-screen bg-slate-900 text-white p-6">
                <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Welcome, {session.name}</h1>
                    {/* <form action={async () => { "use server"; await import("../actions").then(m => m.logout()) }}>
                        <button className="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">Logout</button>
                    </form> */}
                </div>

                <div className="max-w-7xl mx-auto">
                    <BulkEvaluationTable
                        employees={employees}
                        evaluator={evaluator}
                        initialEvaluations={history}
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