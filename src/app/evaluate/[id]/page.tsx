
import { getEmployees, getEmployeeById, getSession, getExistingEvaluation } from "@/app/actions";
import EvaluationDashboard from "@/components/EvaluationDashboard";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { id } = await params;
    const evaluateeId = parseInt(id);
    const evaluatorId = parseInt(session.id);

    const evaluatee = await getEmployeeById(evaluateeId);
    const allEmployees = await getEmployees();

    // Get logged in evaluator details
    const evaluator = allEmployees.find(e => e.id === evaluatorId);

    if (!evaluatee || !evaluator) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Employee Not Found</h1>
                <Link href="/evaluate" className="text-indigo-400 hover:text-indigo-300">Back to Selection</Link>
            </div>
        );
    }

    // Get pre-fill data
    const { evaluation } = await getExistingEvaluation(evaluatorId, evaluateeId);

    return (
        <main className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
                <Link href="/evaluate" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                    &larr; Back to Selection
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm">Evaluating: <strong className="text-white">{evaluatee.last_name}, {evaluatee.first_name}</strong></span>
                </div>
            </div>
            <EvaluationDashboard
                evaluator={evaluator}
                evaluatee={evaluatee}
                employees={allEmployees}
                initialEvaluation={evaluation}
                showNominations={false}
            />
        </main>
    );
}
