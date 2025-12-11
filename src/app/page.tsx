"use client";

import { getDashboardStats } from "./actions";
import { exportToExcel } from "../utils/ExportUtils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';


export default function Home() {
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const stored = localStorage.getItem("dashboardYear");
        if (stored) {
            setYear(parseInt(stored));
        }
    }, []);

    useEffect(() => {
        setStats(null); // Show loading between Switches
        getDashboardStats(year)
            .then((data) => {
                console.log("Dashboard Stats loaded for", year, data);
                setStats(data);
            })
            .catch((err) => {
                console.error("Failed to load stats:", err);
                setError("Failed to load dashboard statistics.");
            });
    }, [year]);

    const handleYearChange = (newYear: number) => {
        setYear(newYear);
        localStorage.setItem("dashboardYear", newYear.toString());
    };

    const handleReset = () => {
        const current = new Date().getFullYear();
        setYear(current);
        localStorage.setItem("dashboardYear", current.toString());
    };

    if (error) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">{error}</div>;

    // Simple Loading State
    if (!stats) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span>Loading...</span>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-16 px-6 sm:px-12 lg:px-24">
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        Employee Performance <br /> Rating System
                    </h1>
                    <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Elevate your team's potential with our comprehensive evaluation platform.
                        Track progress, recognize excellence, and foster growth.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Link
                            href="/evaluate"
                            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/30 ring-offset-2 ring-offset-slate-900 hover:ring-2 ring-indigo-500"
                        >
                            Start Evaluation
                        </Link>
                    </div>
                </div>
            </section>

            {/* Dashboard Stats */}
            <section className="py-12 px-6 sm:px-12 lg:px-24 bg-slate-800/50 backdrop-blur-sm relative">
                {stats.isEvaluationOngoing && year === new Date().getFullYear() && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700 m-4">
                        <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-600 max-w-md">
                            <h3 className="text-3xl font-bold text-white mb-4">Evaluation In Progress</h3>
                            <p className="text-slate-300 mb-6">
                                Statistics are hidden while the evaluation period is open.
                                Please complete your evaluations.
                            </p>
                            <Link
                                href="/evaluate"
                                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Go to Evaluation
                            </Link>
                        </div>
                    </div>
                )}

                <div className={`max-w-7xl mx-auto transition-all duration-500 ${stats.isEvaluationOngoing && year === new Date().getFullYear() ? "filter blur-lg opacity-50 select-none pointer-events-none" : ""}`}>

                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <h2 className="text-3xl font-bold text-slate-100 border-l-4 border-indigo-500 pl-4">
                            Year {year} Dashboard
                        </h2>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Export Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const data = stats.breakdown.map((b: any) => ({
                                            Criteria: b.label,
                                            Average_Rating: parseFloat(b.rating.toFixed(2)),
                                            Weight: parseFloat((b.weight * 100).toFixed(0)) + '%',
                                            Weighted_Score: parseFloat(b.weightedScore.toFixed(2)),
                                            Total_Score_Sum: parseFloat(b.sum.toFixed(2)),
                                            Count_Entries: b.count
                                        }));
                                        exportToExcel(data, `Performance_Breakdown_${year}`);
                                    }}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded border border-slate-600 transition-colors"
                                >
                                    Export Summary
                                </button>
                                <button
                                    onClick={() => {
                                        const data = stats.topPerformers.map((p: any, idx: number) => ({
                                            Rank: idx + 1,
                                            Name: p.name,
                                            Total_Weighted_Score: parseFloat(p.score.toFixed(2)),
                                            // Detailed Breakdown from 'details' object
                                            Punctuality_Avg: parseFloat((p.details?.punctuality || 0).toFixed(2)),
                                            Uniform_Avg: parseFloat((p.details?.wearing_uniform || 0).toFixed(2)),
                                            Quality_Avg: parseFloat((p.details?.quality_of_work || 0).toFixed(2)),
                                            Productivity_Avg: parseFloat((p.details?.productivity || 0).toFixed(2)),
                                            Teamwork_Avg: parseFloat((p.details?.teamwork || 0).toFixed(2)),
                                            Adaptability_Avg: parseFloat((p.details?.adaptability || 0).toFixed(2)),
                                            Evaluation_Count: p.counts?.punctuality || 0
                                        }));
                                        exportToExcel(data, `Top_Performers_${year}`);
                                    }}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded border border-slate-600 transition-colors"
                                >
                                    Top 5
                                </button>
                                <button
                                    onClick={() => {
                                        // Flatten evaluations
                                        const data = stats.evaluations.map((ev: any) => ({
                                            Date: new Date(ev.createdAt).toLocaleDateString(),
                                            Evaluator: `${ev.evaluator.last_name}, ${ev.evaluator.first_name}`,
                                            Role: ev.evaluator.role.name,
                                            Evaluatee: `${ev.evaluatee.last_name}, ${ev.evaluatee.first_name}`,
                                            Punctuality: ev.score_punctuality,
                                            Uniform: ev.score_wearing_uniform,
                                            Quality: ev.score_quality_of_work,
                                            Productivity: ev.score_productivity,
                                            Teamwork: ev.score_teamwork,
                                            Adaptability: ev.score_adaptability,
                                            Remarks: ev.remarks
                                        }));
                                        exportToExcel(data, `All_Evaluations_${year}`);
                                    }}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded border border-slate-600 transition-colors"
                                >
                                    Export All Data
                                </button>
                            </div>

                            <div className="w-px h-8 bg-slate-700 mx-2 hidden md:block"></div>

                            <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-lg">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleYearChange(year - 1)}
                                        className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <span className="font-bold text-xl px-2 min-w-[4rem] text-center">{year}</span>
                                    <button
                                        onClick={() => handleYearChange(year + 1)}
                                        className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>

                                {year !== new Date().getFullYear() && (
                                    <>
                                        <div className="w-px h-6 bg-slate-600 mx-2"></div>
                                        <button
                                            onClick={handleReset}
                                            className="text-xs font-semibold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* Stat Card 1 */}
                        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-200">Total Evaluations</h3>
                            </div>
                            <p className="text-5xl font-bold text-white tracking-widest">{stats.totalEvaluations}</p>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-200">Overall Weighted Score</h3>
                            </div>
                            <p className="text-5xl font-bold text-white tracking-widest">{stats.totalWeightedScore.toFixed(2)} <span className="text-lg text-slate-500 font-normal">/ 5.00</span></p>
                        </div>
                    </div>

                    {/* Performance Trend Chart */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mb-12 h-[400px]">
                        <h3 className="text-xl font-bold text-white mb-4">Company Performance Trends (Year-over-Year)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.trend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="year" stroke="#94a3b8" />
                                <YAxis domain={[0, 5]} stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6, fill: "#8b5cf6" }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Chart */}
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl h-[650px] col-span-1 lg:col-span-1">
                            <h3 className="text-xl font-bold text-white mb-4">Average Scores by Category</h3>
                            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                                <BarChart data={stats.breakdown} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis type="number" domain={[0, 5]} stroke="#94a3b8" />
                                    <YAxis dataKey="label" type="category" width={100} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                        cursor={{ fill: '#334155', opacity: 0.4 }}
                                    />
                                    <Bar dataKey="rating" fill="#6366f1" radius={[0, 4, 4, 0]}>
                                        {stats.breakdown.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#818cf8' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top Performers */}
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl overflow-hidden col-span-1 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">Top 5 Performers</h3>
                            </div>

                            <div className="space-y-4">
                                {stats.topPerformers.map((p: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-lg font-bold w-6 text-center ${i === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>#{i + 1}</span>
                                            <div>
                                                <p className="font-semibold text-white">{p.name}</p>
                                                <p className="text-xs text-slate-400">weighted score</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-indigo-400">{p.score.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                                {stats.topPerformers.length === 0 && (
                                    <div className="text-center text-slate-500 italic py-8">No ratings yet.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Score Derivation Documentation */}
                    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl mb-12">
                        <h3 className="text-xl font-bold text-white mb-4">📊 How Scores are Calculated</h3>
                        <p className="text-slate-300 mb-4">
                            The Final Score is calculated using a <span className="text-indigo-400 font-semibold">Weighted Average</span> of all assessed criteria.
                            Each criterion has a different weight based on its importance to overall performance.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Punctuality:</span>
                                <span className="text-white font-bold">10%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Uniform:</span>
                                <span className="text-white font-bold">5%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Quality of Work:</span>
                                <span className="text-white font-bold">30%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Productivity:</span>
                                <span className="text-white font-bold">35%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Teamwork:</span>
                                <span className="text-white font-bold">10%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Adaptability:</span>
                                <span className="text-white font-bold">10%</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-4 italic">
                            Formula: (Punctuality × 0.10) + (Uniform × 0.05) + (Quality × 0.30) + (Productivity × 0.35) + (Teamwork × 0.10) + (Adaptability × 0.10) = Final Score
                        </p>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Performance Breakdown (Company Average)</h3>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Criteria</th>
                                    <th className="px-6 py-4 text-right">Avg Rating</th>
                                    <th className="px-6 py-4 text-right">Weight</th>
                                    <th className="px-6 py-4 text-right">Weighted Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {stats.breakdown.map((item: any) => (
                                    <tr key={item.label} className="hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-200">{item.label}</td>
                                        <td className="px-6 py-4 text-right text-slate-300">{item.rating.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-slate-400">{(item.weight * 100).toFixed(0)}%</td>
                                        <td className="px-6 py-4 text-right text-indigo-400 font-bold">{item.weightedScore.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section >
        </main >
    );
}
