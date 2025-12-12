"use client";

import { useState } from "react";
import { type EvaluationData, submitNominees } from "@/app/actions";
import Toast from "./Toast";
import { useRouter } from "next/navigation";

type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    role: { name: string };
};

type Props = {
    evaluator: Employee;
    employees: Employee[];
    initialNominees: number[];
    isLocked: boolean;
    initialEvaluations?: any[];
};

export default function NomineeForm({ evaluator, employees, initialNominees, isLocked, initialEvaluations = [] }: Props) {
    const router = useRouter();
    const [nominees, setNominees] = useState<number[]>(initialNominees);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);

    const [peerReviews, setPeerReviews] = useState<Record<number, { score_teamwork?: number; score_adaptability?: number }>>(() => {
        const initialState: Record<number, any> = {};
        initialEvaluations?.forEach((ev: any) => {
            if (ev.score_teamwork || ev.score_adaptability) {
                initialState[ev.evaluateeId] = {
                    score_teamwork: ev.score_teamwork,
                    score_adaptability: ev.score_adaptability
                };
            }
        });
        return initialState;
    });

    // Filtered employees
    const filteredEmployees = employees.filter(e =>
        e.id !== evaluator.id &&
        (e.last_name.toLowerCase().includes(search.toLowerCase()) ||
            e.first_name.toLowerCase().includes(search.toLowerCase()))
    );

    const toggleNominee = (id: number) => {
        if (isLocked) return;
        if (nominees.includes(id)) {
            setNominees(nominees.filter((n) => n !== id));
            const newReviews = { ...peerReviews };
            delete newReviews[id];
            setPeerReviews(newReviews);
        } else {
            if (nominees.length >= 5) {
                setToast({ message: "You can only nominate up to 5 peers.", type: "warning" });
                return;
            }
            setNominees([...nominees, id]);
        }
    };

    const handlePeerScoreChange = (nomineeId: number, field: "score_teamwork" | "score_adaptability", value: number) => {
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

    const handleSubmit = async () => {
        if (isLocked) return;
        setSubmitting(true);
        try {
            await submitNominees(evaluator.id, nominees, peerReviews);
            setToast({ message: "Nominations submitted successfully!", type: "success" });
            router.refresh();
        } catch (e) {
            console.error(e);
            setToast({ message: "Error submitting nominations", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Peer Nominations
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Select up to 5 colleagues who demonstrate exceptional teamwork and adaptability.
                        </p>
                    </div>
                    {!isLocked && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-indigo-900/20 disabled:opacity-50 transition-all"
                        >
                            {submitting ? "Saving..." : "Save Nominations"}
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="mb-4 relative">
                    <input
                        type="text"
                        placeholder="Search colleagues..."
                        disabled={isLocked}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="h-[400px] overflow-y-auto custom-scrollbar border border-slate-700/50 rounded-xl bg-slate-900/30 relative">

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

                    {/* Available Employees */}
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEmployees
                            .filter(emp => !nominees.includes(emp.id))
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

            {/* Rate Nominees */}
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
    );
}
