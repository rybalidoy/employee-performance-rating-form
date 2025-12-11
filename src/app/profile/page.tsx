import { getSession, getEmployeeById } from "@/app/actions";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = await getEmployeeById(parseInt(session.id));
    if (!user) redirect("/login"); // Should not happen

    return (
        <main className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
                    <ProfileForm user={user} />
                </div>
            </div>
        </main>
    );
}
