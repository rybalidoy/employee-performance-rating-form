"use client";

import { useState } from "react";
import { submitEvaluation, type EvaluationData } from "@/app/actions";
import { useRouter } from "next/navigation";

type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    role: { name: string };
};

type Props = {
    employees: Employee[];
    evaluator: Employee;
    initialEvaluations?: any[]; // Using any to avoid complex type matching for now, or use mapped type
};

export default function BulkEvaluationTable({ employees, evaluator, initialEvaluations = [] }: Props) {
    const router = useRouter();
    const role = evaluator.role.name;

    const [scores, setScores] = useState<Record<number, Partial<EvaluationData>>>(() => {
        const initialState: Record<number, Partial<EvaluationData>> = {};
        initialEvaluations?.forEach((ev: any) => {
            initialState[ev.evaluateeId] = {
                score_punctuality: ev.score_punctuality,
                score_wearing_uniform: ev.score_wearing_uniform,
                score_quality_of_work: ev.score_quality_of_work,
                score_productivity: ev.score_productivity,
                score_teamwork: ev.score_teamwork,
                score_adaptability: ev.score_adaptability,
                remarks: ev.remarks
            };
        });
        return initialState;
    });

    const [submitting, setSubmitting] = useState(false);

    // Filter out the evaluator themselves
    const targets = employees.filter(e => e.id !== evaluator.id);

    const handleScoreChange = (employeeId: number, field: keyof EvaluationData, value: number) => {
        if (value > 5) value = 5;
        if (value < 1) value = 1;

        setScores(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [field]: value
            }
        }));
    };

    const submitAll = async () => {
        setSubmitting(true);
        try {
            // Sequential submission to avoid race conditions/server overload? 
            // Better to make a bulk action, but reuse existing single is fine for small scale
            let count = 0;
            const entries = Object.entries(scores);

            if (entries.length === 0) {
                alert("No ratings entered.");
                setSubmitting(false);
                return;
            }

            for (const [empId, data] of entries) {
                await submitEvaluation({
                    evaluatorId: evaluator.id,
                    evaluateeId: parseInt(empId),
                    scores: data,
                });
                count++;
            }
            alert(`Successfully submitted reviews for ${count} employees.`);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Error submitting evaluations.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Bulk Evaluation ({role})</h2>
                    <p className="text-slate-400 text-sm">Enter ratings for all employees below. Scale: 1 (Poor) - 5 (Excellent)</p>
                </div>
                <button
                    onClick={submitAll}
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                >
                    {submitting ? "Submitting..." : "Submit All Changes"}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Role</th>
                            {role === "Admin" && (
                                <>
                                    <th className="px-6 py-4 text-center w-32">Punctuality</th>
                                    <th className="px-6 py-4 text-center w-32">Uniform</th>
                                </>
                            )}
                            {(role === "Division Head" || role === "Assistant Division Head") && (
                                <>
                                    <th className="px-6 py-4 text-center w-32">Quality</th>
                                    <th className="px-6 py-4 text-center w-32">Productivity</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {targets.map(emp => (
                            <tr key={emp.id} className="hover:bg-slate-700/30">
                                <td className="px-6 py-4 font-medium text-slate-200">
                                    {emp.last_name}, {emp.first_name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    {emp.role.name}
                                </td>
                                {role === "Admin" && (
                                    <>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1" max="5"
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="-"
                                                value={scores[emp.id]?.score_punctuality || ""}
                                                onChange={(e) => handleScoreChange(emp.id, 'score_punctuality', parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1" max="5"
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="-"
                                                value={scores[emp.id]?.score_wearing_uniform || ""}
                                                onChange={(e) => handleScoreChange(emp.id, 'score_wearing_uniform', parseInt(e.target.value))}
                                            />
                                        </td>
                                    </>
                                )}
                                {(role === "Division Head" || role === "Assistant Division Head") && (
                                    <>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1" max="5"
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="-"
                                                value={scores[emp.id]?.score_quality_of_work || ""}
                                                onChange={(e) => handleScoreChange(emp.id, 'score_quality_of_work', parseInt(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1" max="5"
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="-"
                                                value={scores[emp.id]?.score_productivity || ""}
                                                onChange={(e) => handleScoreChange(emp.id, 'score_productivity', parseInt(e.target.value))}
                                            />
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
