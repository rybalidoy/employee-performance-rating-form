import Link from "next/link";
import { getSession, logout } from "@/app/actions";

export default async function Navbar() {
    const session = await getSession();

    return (
        <nav className="bg-slate-900 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                Performance Rating
                            </span>
                        </Link>
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <Link href="/" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                Dashboard
                            </Link>
                            <Link href="/evaluate" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                Evaluate
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {session ? (
                            <div className="flex items-center gap-4">
                                <span className="text-slate-400 text-sm hidden sm:block">
                                    {session.name} ({session.role})
                                </span>
                                <form action={async () => { "use server"; await logout() }}>
                                    <button className="text-sm bg-red-500/10 text-red-400 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">
                                        Logout
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
