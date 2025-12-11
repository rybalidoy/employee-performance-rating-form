"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Grid, List, ChevronDown } from "lucide-react";

type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    role: { name: string };
};

export default function EvaluatorSelector({ employees }: { employees: Employee[] }) {
    const [viewMode, setViewMode] = useState<"grid" | "dropdown">(employees.length > 10 ? "dropdown" : "grid");
    const [search, setSearch] = useState("");

    // For dropdown custom implementation to look good
    const [isOpen, setIsOpen] = useState(false);

    const filtered = employees.filter(e =>
        `${e.last_name} ${e.first_name}`.toLowerCase().includes(search.toLowerCase()) ||
        e.role.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
            <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Identify Yourself
            </h1>
            <p className="text-slate-400 text-center mb-6">
                Select your name to proceed.
            </p>

            <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 mr-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search name..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClick={() => viewMode === "dropdown" && setIsOpen(true)}
                    />
                </div>
                <button
                    onClick={() => setViewMode(viewMode === "grid" ? "dropdown" : "grid")}
                    className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
                    title="Toggle View"
                >
                    {viewMode === "grid" ? <List size={20} /> : <Grid size={20} />}
                </button>
            </div>

            {viewMode === "grid" ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {filtered.map((emp) => (
                        <Link
                            key={emp.id}
                            href={`/evaluate/${emp.id}`}
                            className="block w-full p-4 text-left bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 hover:border-indigo-500 transition-all duration-200 group relative overflow-hidden"
                        >
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <div className="font-semibold text-lg text-slate-200 group-hover:text-white">
                                        {emp.last_name}, {emp.first_name}
                                    </div>
                                    <div className="text-xs text-indigo-400 uppercase tracking-wider font-bold mt-1">
                                        {emp.role.name}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {filtered.length === 0 && <div className="text-center text-slate-500 py-4">No results found.</div>}
                </div>
            ) : (
                <div className="relative">
                    <div
                        className="w-full p-4 bg-slate-700 rounded-xl flex items-center justify-between cursor-pointer border border-slate-600 hover:border-indigo-500"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="text-slate-300">Select an employee...</span>
                        <ChevronDown className="text-slate-400" size={20} />
                    </div>

                    {(isOpen || search) && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                            {filtered.map(emp => (
                                <Link
                                    key={emp.id}
                                    href={`/evaluate/${emp.id}`}
                                    className="block px-4 py-3 hover:bg-indigo-600/20 text-slate-200 hover:text-white transition-colors border-b border-slate-700 last:border-0"
                                >
                                    <div className="font-medium">{emp.last_name}, {emp.first_name}</div>
                                    <div className="text-xs text-slate-500">{emp.role.name}</div>
                                </Link>
                            ))}
                            {filtered.length === 0 && <div className="p-4 text-center text-slate-500">No results.</div>}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8 text-center">
                <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    &larr; Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
