"use client";

import { login } from "@/app/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        // Basic Client Validation
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        if (!username || !password) {
            setError("Please enter both username and password.");
            setLoading(false);
            return;
        }

        const res = await login(formData);
        if (res?.error) {
            setError(res.error);
            setLoading(false);
        } else {
            router.push("/evaluate");
        }
    }

    return (
        <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    Employee Login
                </h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                        <input
                            name="username"
                            type="text"
                            placeholder="lastname.firstname"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Default password is <code className="bg-slate-700 px-1 py-0.5 rounded text-indigo-300">password123</code>
                    </p>
                </div>
            </div>
        </main>
    );
}
