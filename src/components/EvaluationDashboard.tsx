"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitEvaluation, type EvaluationData } from "@/app/actions";
import Toast from "./Toast";
import NomineeForm from "./NomineeForm";

type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    role: { name: string };
};

type Props = {
    evaluator: Employee;
    evaluatee?: Employee;
    employees: Employee[];
    initialEvaluation?: any;
    initialNominations?: number[];
    initialEvaluations?: any[];
    isLocked?: boolean;
    showNominations?: boolean;
};

export default function EvaluationDashboard({ evaluator, evaluatee, employees, initialEvaluation, initialNominations = [], initialEvaluations = [], isLocked = false, showNominations = true }: Props) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);

    // Admin/DivHead State: Single Evaluation form
    const [scores, setScores] = useState<Partial<EvaluationData>>(initialEvaluation || {});

    useEffect(() => {
        if (initialEvaluation) {
            setScores({
                score_punctuality: initialEvaluation.score_punctuality,
                score_wearing_uniform: initialEvaluation.score_wearing_uniform,
                score_quality_of_work: initialEvaluation.score_quality_of_work,
                score_productivity: initialEvaluation.score_productivity,
                score_teamwork: initialEvaluation.score_teamwork,
                score_adaptability: initialEvaluation.score_adaptability,
                remarks: initialEvaluation.remarks
            });
        }
    }, [initialEvaluation]);

    const RATING_DESC = {
        5: "Excellent (Always exceeds expectations)",
        4: "Very Good (Often exceeds expectations)",
        3: "Satisfactory (Meets expectations)",
        2: "Needs Improvement (Sometimes below expectations)",
        1: "Poor (Frequently below expectations)"
    };

    const role = evaluator.role.name;

    const handleScoreChange = (employeeId: number, field: keyof EvaluationData, value: number) => {
        if (isLocked) return;
        // Limit entry to 5
        if (value > 5) value = 5;
        if (value < 0) value = 0;

        setScores(prev => ({ ...prev, [field]: value }));
    };

    const submitDirectEvaluation = async () => {
        if (isLocked) return;
        setSubmitting(true);
        try {
            if (!evaluatee) return;
            await submitEvaluation({
                evaluatorId: evaluator.id,
                evaluateeId: evaluatee.id,
                scores,
            });
            setToast({ message: "Evaluation submitted successfully!", type: "success" });
            router.refresh();
        } catch (e) {
            console.error(e);
            setToast({ message: "Error submitting evaluations", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div>
                    <h2 className="text-2xl font-bold text-white">Welcome, {evaluator.first_name}</h2>
                    <p className="text-indigo-400 font-medium">{role} View</p>
                </div>
            </div>

            {/* Rating Scale Alert */}
            <div className="bg-indigo-900/40 border border-indigo-500/30 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-shrink-0 text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="text-sm text-indigo-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 w-full">
                    {Object.entries(RATING_DESC).reverse().map(([key, desc]) => (
                        <div key={key}><span className="font-bold text-white">{key}</span> - {desc.split(" (")[0]}</div>
                    ))}
                </div>
            </div>

            {/* Punctuality & Uniform Specific Rubric */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-xs space-y-2">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider mb-2">Punctuality & Uniform Guidelines</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 text-slate-400">
                    <div className="flex gap-2">
                        <span className="font-bold text-white w-4">5:</span>
                        <span>1x or no tardiness / complete uniform</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold text-white w-4">4:</span>
                        <span>2x-3x tardy / incomplete uniform</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold text-white w-4">3:</span>
                        <span>4x-5x tardy / incomplete uniform</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold text-white w-4">2:</span>
                        <span>6x-7x tardy / incomplete uniform</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold text-white w-4">1:</span>
                        <span>8x-9x tardy / incomplete uniform</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-bold text-white w-4">0:</span>
                        <span>10 or more tardy / incomplete uniform</span>
                    </div>
                </div>
            </div>

            {/* Score Derivation Documentation */}
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl text-sm text-slate-400">
                <p className="mb-2">
                    <span className="font-bold text-slate-200">How Scores are Derived:</span> The Final Score is calculated using a
                    <span className="text-indigo-400 font-semibold"> Weighted Average</span> of all assessed criteria.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs mt-2">
                    <div><span className="text-slate-300">Punctuality:</span> 10%</div>
                    <div><span className="text-slate-300">Uniform:</span> 5%</div>
                    <div><span className="text-slate-300">Quality of Work:</span> 30%</div>
                    <div><span className="text-slate-300">Productivity:</span> 35%</div>
                    <div><span className="text-slate-300">Teamwork:</span> 10%</div>
                    <div><span className="text-slate-300">Adaptability:</span> 10%</div>
                </div>
                <p className="text-xs mt-2 text-slate-500">
                    Example: (Punctuality×0.10) + (Uniform×0.05) + (Quality×0.30) + (Productivity×0.35) + (Teamwork×0.10) + (Adaptability×0.10) = Final Score
                </p>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* 1. PEER NOMINATIONS SECTION (For All Roles now, or just separate block) */}
            {/* The requirement: "add nominee form to admin and division head" */}
            {showNominations && (
                <NomineeForm
                    evaluator={evaluator}
                    employees={employees}
                    initialNominees={initialNominations}
                    isLocked={isLocked}
                    initialEvaluations={initialEvaluations}
                />
            )}

            {/* 2. DIRECT EVALUATION SECTION */}
            {/* Admin and Div Head evaluate specific people. Employee DOES NOT have this section usually, unless they evaluate subordinates? */}
            {/* Assuming Employee role ONLY does peer nominations. */}

            {role !== "Employee" && evaluatee && (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl mt-8">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-700/20">
                        <h3 className="text-xl font-bold text-white">
                            Evaluation Form for: {evaluatee.last_name}, {evaluatee.first_name}
                        </h3>
                        {!isLocked && (
                            <button
                                onClick={submitDirectEvaluation}
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 disabled:opacity-50 transition-all"
                            >
                                {submitting ? "Submitting..." : "Submit Evaluation"}
                            </button>
                        )}
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Criteria</th>
                                <th className="px-6 py-4 w-32 text-center">Score (1-5)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {role === "Admin" && (
                                <>
                                    <tr className="hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            <div>
                                                Punctuality
                                                <div className="text-xs text-slate-400 font-normal mt-0.5">Reports to work on time</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                disabled={isLocked}
                                                value={scores.score_punctuality || ""}
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white disabled:opacity-50"
                                                onChange={(e) =>
                                                    handleScoreChange(evaluator.id, "score_punctuality", parseInt(e.target.value))
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            <div>
                                                Wearing Uniform
                                                <div className="text-xs text-slate-400 font-normal mt-0.5">Consistently wears proper and complete uniform</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                disabled={isLocked}
                                                value={scores.score_wearing_uniform || ""}
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white disabled:opacity-50"
                                                onChange={(e) =>
                                                    handleScoreChange(
                                                        evaluator.id,
                                                        "score_wearing_uniform",
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                            />
                                        </td>
                                    </tr>
                                </>
                            )}
                            {(role === "Division Head" || role === "Assistant Division Head") && (
                                <>
                                    <tr className="hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            <div>
                                                Quality of Work
                                                <div className="text-xs text-slate-400 font-normal mt-0.5">Accuracy, neatness, attention to detail</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                disabled={isLocked}
                                                value={scores.score_quality_of_work || ""}
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white disabled:opacity-50"
                                                onChange={(e) =>
                                                    handleScoreChange(evaluator.id, "score_quality_of_work", parseInt(e.target.value))
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            <div>
                                                Productivity
                                                <div className="text-xs text-slate-400 font-normal mt-0.5">Completes task efficiently and meets deadlines</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                disabled={isLocked}
                                                value={scores.score_productivity || ""}
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white disabled:opacity-50"
                                                onChange={(e) =>
                                                    handleScoreChange(evaluator.id, "score_productivity", parseInt(e.target.value))
                                                }
                                            />
                                        </td>
                                    </tr>

                                </>
                            )}
                        </tbody>
                    </table>
                    <div className="p-6 border-t border-slate-700">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Remarks / Comments</label>
                        <textarea
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32 disabled:opacity-50"
                            placeholder="Enter any additional comments here..."
                            disabled={isLocked}
                            value={scores.remarks || ""}
                            onChange={(e) => handleScoreChange(evaluator.id, "remarks", e.target.value as any)}
                        ></textarea>
                    </div>
                </div>
            )}
        </div>
    );
}
