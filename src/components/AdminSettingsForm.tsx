"use client";

import { useState } from "react";
import { setEvaluationPeriod } from "@/app/actions";

type Props = {
    initialStartDate?: Date;
    initialEndDate?: Date;
    year: number;
};

export default function AdminSettingsForm({ initialStartDate, initialEndDate, year }: Props) {
    const [startDate, setStartDate] = useState(initialStartDate ? new Date(initialStartDate).toISOString().split('T')[0] : "");
    const [endDate, setEndDate] = useState(initialEndDate ? new Date(initialEndDate).toISOString().split('T')[0] : "");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!startDate || !endDate) {
                alert("Please select both start and end dates.");
                return;
            }
            await setEvaluationPeriod(year, new Date(startDate), new Date(endDate));
            alert("Settings saved successfully.");
        } catch (e) {
            console.error(e);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Start Date</label>
                    <input
                        type="date"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">End Date</label>
                    <input
                        type="date"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Settings"}
            </button>
        </div>
    );
}
