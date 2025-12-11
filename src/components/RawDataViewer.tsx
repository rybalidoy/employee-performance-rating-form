"use client";

import { useState } from "react";

type Evaluation = {
    id: number;
    evaluator: { first_name: string; last_name: string };
    evaluatee: { first_name: string; last_name: string };
    createdAt: string;
    score_punctuality?: number;
    score_wearing_uniform?: number;
    score_quality_of_work?: number;
    score_productivity?: number;
    score_teamwork?: number;
    score_adaptability?: number;
    remarks?: string;
};

export default function RawDataViewer({ evaluations }: { evaluations: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!evaluations || evaluations.length === 0) return null;

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden mt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-700/50 transition-colors"
            >
                <div>
                    <h2 className="text-xl font-bold text-white">Raw Data Results</h2>
                    <p className="text-slate-400 text-sm">View all individual evaluation submissions.</p>
                </div>
                <div className="text-indigo-400">
                    {isOpen ? "Hide" : "Show"}
                </div>
            </button>

            {isOpen && (
                <div className="overflow-x-auto p-6 pt-0">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Evaluator</th>
                                <th className="px-4 py-2">Evaluatee</th>
                                <th className="px-4 py-2 text-center">Punct.</th>
                                <th className="px-4 py-2 text-center">Unif.</th>
                                <th className="px-4 py-2 text-center">Qual.</th>
                                <th className="px-4 py-2 text-center">Prod.</th>
                                <th className="px-4 py-2 text-center">Team.</th>
                                <th className="px-4 py-2 text-center">Adapt.</th>
                                <th className="px-4 py-2">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {evaluations.map((ev: any) => (
                                <tr key={ev.id} className="hover:bg-slate-700/30">
                                    <td className="px-4 py-2 text-slate-400">{new Date(ev.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 text-slate-300">{ev.evaluator.last_name}</td>
                                    <td className="px-4 py-2 text-slate-300">{ev.evaluatee.last_name}</td>
                                    <td className="px-4 py-2 text-center text-slate-300">{ev.score_punctuality || "-"}</td>
                                    <td className="px-4 py-2 text-center text-slate-300">{ev.score_wearing_uniform || "-"}</td>
                                    <td className="px-4 py-2 text-center text-slate-300">{ev.score_quality_of_work || "-"}</td>
                                    <td className="px-4 py-2 text-center text-slate-300">{ev.score_productivity || "-"}</td>
                                    <td className="px-4 py-2 text-center text-slate-300">{ev.score_teamwork || "-"}</td>
                                    <td className="px-4 py-2 text-center text-slate-300">{ev.score_adaptability || "-"}</td>
                                    <td className="px-4 py-2 text-slate-400 max-w-xs truncate" title={ev.remarks}>{ev.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
