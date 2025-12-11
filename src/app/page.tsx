"use client";

import { getDashboardStats } from "./actions";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';


export default function Home() {
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getDashboardStats()
            .then((data) => {
                console.log("Dashboard Stats loaded:", data);
                setStats(data);
            })
            .catch((err) => {
                console.error("Failed to load stats:", err);
                setError("Failed to load dashboard statistics.");
            });
    }, []);

    if (error) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">{error}</div>;
    if (!stats) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading stats...</div>;


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
            <section className="py-12 px-6 sm:px-12 lg:px-24 bg-slate-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-slate-100 border-l-4 border-indigo-500 pl-4">Year {new Date().getFullYear()} Dashboard</h2>

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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Chart */}
                        {/* Chart */}
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl h-[650px] col-span-1 lg:col-span-2">
                            <h3 className="text-xl font-bold text-white mb-4">Average Scores by Category</h3>
                            <ResponsiveContainer width="100%" height="100%" minHeight={600}>
                                <BarChart data={stats.breakdown} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis type="number" domain={[0, 5]} stroke="#94a3b8" />
                                    <YAxis dataKey="label" type="category" width={100} stroke="#94a3b8" tick={{ fontSize: 12 }} />
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
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
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
            </section>
        </main>
    );
}
