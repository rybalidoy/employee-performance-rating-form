"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitEvaluation, type EvaluationData } from "@/app/actions";

type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    role: { name: string };
};

type Props = {
    evaluator: Employee;
    evaluatee?: Employee; // The person being rated (for Admin/DivHead)
    employees: Employee[];
    initialEvaluation?: any;
    initialNominations?: number[];
};

export default function EvaluationDashboard({ evaluator, evaluatee, employees, initialEvaluation, initialNominations = [] }: Props) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

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

    const [peerReviews, setPeerReviews] = useState<Record<number, Partial<EvaluationData>>>({});

    const RATING_DESC = {
        5: "Excellent (Always exceeds expectations)",
        4: "Very Good (Often exceeds expectations)",
        3: "Satisfactory (Meets expectations)",
        2: "Needs Improvement (Sometimes below expectations)",
        1: "Poor (Adjusts well to changes, stays positive under pressure)"
    };

    const role = evaluator.role.name;

    const handleScoreChange = (employeeId: number, field: keyof EvaluationData, value: number) => {
        // Limit entry to 5
        if (value > 5) value = 5;
        if (value < 1) value = 1;

        setScores(prev => ({ ...prev, [field]: value }));
    };

    const handlePeerScoreChange = (nomineeId: number, field: keyof EvaluationData, value: number) => {
        if (value > 5) value = 5;
        if (value < 1) value = 1;

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
        if (nominees.includes(id)) {
            setNominees(nominees.filter((n) => n !== id));
            const newPeerReviews = { ...peerReviews };
            delete newPeerReviews[id];
            setPeerReviews(newPeerReviews);
        } else {
            if (nominees.length >= 5) {
                alert("You can only nominate up to 5 peers.");
                return;
            }
            setNominees([...nominees, id]);
        }
    };

    const submitAll = async () => {
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
            alert("Evaluations submitted successfully!");
            router.push("/evaluate");
        } catch (e) {
            console.error(e);
            alert("Error submitting evaluations");
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
                <button
                    onClick={submitAll}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 disabled:opacity-50 transition-all"
                >
                    {submitting ? "Submitting..." : "Submit Evaluations"}
                </button>
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
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={peerSearch}
                                onChange={(e) => setPeerSearch(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[400px] overflow-y-auto custom-scrollbar p-2 border border-slate-700/50 rounded-xl bg-slate-900/30">
                            {filteredEmployees.map((emp) => (
                                <div
                                    key={emp.id}
                                    onClick={() => toggleNominee(emp.id)}
                                    className={`p-4 rounded-lg cursor-pointer border transition-all relative select-none ${nominees.includes(emp.id)
                                        ? "bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500 sticky top-0 z-10 backdrop-blur-md"
                                        : "bg-slate-700/30 border-slate-600 hover:bg-slate-700"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-4 h-4 rounded-full border ${nominees.includes(emp.id)
                                                    ? "bg-indigo-500 border-indigo-500"
                                                    : "border-slate-400"
                                                    }`}
                                            ></div>
                                            <span className="text-slate-200">
                                                {emp.last_name}, {emp.first_name}
                                            </span>
                                        </div>
                                        {nominees.includes(emp.id) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleNominee(emp.id); }}
                                                className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <div className="col-span-full text-center text-slate-500 py-8">No colleagues found.</div>
                            )}
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
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="5"
                                                        value={peerReviews[id]?.score_teamwork || ""}
                                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                                                        onChange={(e) =>
                                                            handlePeerScoreChange(
                                                                id,
                                                                "teamwork", // Using correct key from EvaluationData interface
                                                                parseInt(e.target.value)
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-slate-400 mb-1">
                                                        Adaptability (1-5)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="5"
                                                        value={peerReviews[id]?.score_adaptability || ""}
                                                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                                                        onChange={(e) =>
                                                            handlePeerScoreChange(
                                                                id,
                                                                "adaptability", // Using correct key from EvaluationData interface
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
                                            Punctuality
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={scores.score_punctuality || ""}
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white"
                                                onChange={(e) =>
                                                    handleScoreChange(evaluator.id, "punctuality", parseInt(e.target.value))
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            Wearing Uniform
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={scores.score_wearing_uniform || ""}
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white"
                                                onChange={(e) =>
                                                    handleScoreChange(
                                                        evaluator.id,
                                                        "wearing_uniform",
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
                                            Quality of Work
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={scores.score_quality_of_work || ""}
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white"
                                                onChange={(e) =>
                                                    handleScoreChange(evaluator.id, "quality_of_work", parseInt(e.target.value))
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            Productivity
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={scores.score_productivity || ""}
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white"
                                                onChange={(e) =>
                                                    handleScoreChange(evaluator.id, "productivity", parseInt(e.target.value))
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
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                            placeholder="Enter any additional comments here..."
                            value={scores.remarks || ""}
                            onChange={(e) => handleScoreChange(evaluator.id, "remarks", e.target.value as any)}
                        ></textarea>
                    </div>
                </div>
            )}
        </div>
    );
}
