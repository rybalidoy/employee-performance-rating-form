"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitEvaluation, type EvaluationData } from "@/app/actions";
import Toast from "./Toast";

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
};

export default function EvaluationDashboard({ evaluator, evaluatee, employees, initialEvaluation, initialNominations = [], initialEvaluations = [], isLocked = false }: Props) {
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


    // Employee State: Peer Nominations
    const [nominees, setNominees] = useState<number[]>(initialNominations);

    // Peer Search State
    const [peerSearch, setPeerSearch] = useState("");

    const [peerReviews, setPeerReviews] = useState<Record<number, Partial<EvaluationData>>>(() => {
        const initialState: Record<number, Partial<EvaluationData>> = {};
        initialEvaluations?.forEach((ev: any) => {
            // If this evaluation has peer scores, add it.
            if (ev.score_teamwork || ev.score_adaptability) {
                initialState[ev.evaluateeId] = {
                    score_teamwork: ev.score_teamwork,
                    score_adaptability: ev.score_adaptability
                };
            }
        });
        return initialState;
    });

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

    const handlePeerScoreChange = (nomineeId: number, field: keyof EvaluationData, value: number) => {
        if (isLocked) return;
        if (value > 5) value = 5;
        if (value < 0) value = 0;

        setPeerReviews((prev) => ({
            ...prev,
            [nomineeId]: {
                ...prev[nomineeId],
                [field]: value,
            },
        }));
    };

    // Filtered employees for Peer Search
    const filteredEmployees = employees.filter(e =>
        e.id !== evaluator.id && // Cannot nominate self
        (e.last_name.toLowerCase().includes(peerSearch.toLowerCase()) ||
            e.first_name.toLowerCase().includes(peerSearch.toLowerCase()))
    );

    const toggleNominee = (id: number) => {
        if (isLocked) return;
        if (nominees.includes(id)) {
            setNominees(nominees.filter((n) => n !== id));
            const newPeerReviews = { ...peerReviews };
            delete newPeerReviews[id];
            setPeerReviews(newPeerReviews);
        } else {
            if (nominees.length >= 5) {
                setToast({ message: "You can only nominate up to 5 peers.", type: "warning" });
                return;
            }
            setNominees([...nominees, id]);
        }
    };

    const submitAll = async () => {
        if (isLocked) return;
        setSubmitting(true);
        try {
            if (role === "Employee") {
                // Submit peer reviews
                for (const nomineeId of nominees) {
                    const data = peerReviews[nomineeId];
                    // Skip if no data entered, or default to 0? 
                    // Let's assume we just nominate if no data, or require data.
                    // For now, simple submit.

                    await submitEvaluation({
                        evaluatorId: evaluator.id,
                        evaluateeId: nomineeId,
                        scores: data || {},
                        nominees: nominees
                    });
                }
            } else {
                // Admin/DivHead
                if (!evaluatee) return;
                await submitEvaluation({
                    evaluatorId: evaluator.id,
                    evaluateeId: evaluatee.id,
                    scores,
                });
            }
            setToast({ message: "Evaluations submitted successfully!", type: "success" });
            setTimeout(() => {
                router.push("/evaluate");
            }, 1000);
        } catch (e) {
            console.error(e);
            setToast({ message: "Error submitting evaluations", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div>
                    <h2 className="text-2xl font-bold text-white">Welcome, {evaluator.first_name}</h2>
                    <p className="text-indigo-400 font-medium">{role} View</p>
                </div>
                {!isLocked && (
                    <button
                        onClick={submitAll}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 disabled:opacity-50 transition-all"
                    >
                        {submitting ? "Submitting..." : "Submit Evaluations"}
                    </button>
                )}
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

            {role === "Employee" ? (
                <div className="space-y-6">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
                            Peer Nominations
                        </h2>
                        <p className="text-slate-400 mb-4">
                            Select up to 5 colleagues who demonstrate exceptional teamwork and adaptability.
                        </p>

                        {/* Peer Search */}
                        <div className="mb-4 relative">
                            <input
                                type="text"
                                placeholder="Search colleagues..."
                                disabled={isLocked}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                                value={peerSearch}
                                onChange={(e) => setPeerSearch(e.target.value)}
                            />
                        </div>

                        <div className="h-[500px] overflow-y-auto custom-scrollbar border border-slate-700/50 rounded-xl bg-slate-900/30 relative">
                            {/* Dynamic Sticky Styles for up to 5 nominees */}


                            {/* Sticky Header: Selected Nominees */}
                            {nominees.length > 0 && (
                                <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-indigo-500/50 p-3 shadow-lg mb-2">
                                    <div className="flex items-center justify-between mb-2 px-2">
                                        <h3 className="text-xs font-bold uppercase text-indigo-400 tracking-wider">
                                            Selected ({nominees.length}/5)
                                        </h3>
                                        <button
                                            onClick={() => setNominees([])}
                                            disabled={isLocked}
                                            className="text-xs text-slate-400 hover:text-white transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {nominees.map((id) => {
                                            const emp = employees.find((e) => e.id === id);
                                            if (!emp) return null;
                                            return (
                                                <div
                                                    key={emp.id}
                                                    onClick={() => toggleNominee(emp.id)}
                                                    className="p-3 rounded-lg cursor-pointer bg-indigo-600/20 border border-indigo-500 ring-1 ring-indigo-500 relative group transition-all"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></div>
                                                            <span className="text-slate-200 text-sm truncate font-medium">
                                                                {emp.last_name}, {emp.first_name}
                                                            </span>
                                                        </div>
                                                        {!isLocked && (
                                                            <span className="text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
                                                                Remove
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Scrollable List: Available Employees */}
                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredEmployees
                                    .filter(emp => !nominees.includes(emp.id)) // Filter out selected ones (they are in header)
                                    .map((emp) => (
                                        <div
                                            key={emp.id}
                                            onClick={() => toggleNominee(emp.id)}
                                            className={`p-4 rounded-lg cursor-pointer border transition-all relative select-none bg-slate-700/30 border-slate-600 hover:bg-slate-700 group ${isLocked ? "pointer-events-none opacity-80" : ""}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full border border-slate-400"></div>
                                                    <span className="text-slate-200">
                                                        {emp.last_name}, {emp.first_name}
                                                    </span>
                                                </div>
                                                {!isLocked && (
                                                    <span className="text-slate-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Select
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                {filteredEmployees.filter(emp => !nominees.includes(emp.id)).length === 0 && (
                                    <div className="col-span-full text-center text-slate-500 py-8">
                                        {nominees.length === 5 ? "Maximum nominations reached." : "No other colleagues found."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {nominees.length > 0 && (
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                            <h2 className="text-xl font-bold text-white mb-4">Rate Nominees</h2>
                            <div className="space-y-6">
                                {nominees.map((id) => {
                                    const emp = employees.find((e) => e.id === id);
                                    if (!emp) return null;
                                    return (
                                        <div key={id} className="p-4 border border-slate-700 rounded-xl bg-slate-900/50">
                                            <h3 className="font-bold text-lg text-white mb-4">
                                                {emp.last_name}, {emp.first_name}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-slate-400 mb-1">
                                                        Teamwork (1-5)
                                                        <span className="block text-xs text-slate-500 font-normal">Cooperates with coworkers and contributes to group goals</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="5"
                                                        disabled={isLocked}
                                                        value={peerReviews[id]?.score_teamwork || ""}
                                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white disabled:opacity-50"
                                                        onChange={(e) =>
                                                            handlePeerScoreChange(
                                                                id,
                                                                "score_teamwork",
                                                                parseInt(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-slate-400 mb-1">
                                                        Adaptability (1-5)
                                                        <span className="block text-xs text-slate-500 font-normal">Adjusts well to changes, stays positive under pressure</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="5"
                                                        disabled={isLocked}
                                                        value={peerReviews[id]?.score_adaptability || ""}
                                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white disabled:opacity-50"
                                                        onChange={(e) =>
                                                            handlePeerScoreChange(
                                                                id,
                                                                "score_adaptability",
                                                                parseInt(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
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
