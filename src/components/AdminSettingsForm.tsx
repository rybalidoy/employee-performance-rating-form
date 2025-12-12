"use client";

import { useState } from "react";
import { setEvaluationPeriod, unlockEvaluationPeriod, lockEvaluationPeriod } from "@/app/actions";
import { useRouter } from "next/navigation";

type Props = {
    initialStartDate?: Date;
    initialEndDate?: Date;
    initialIsLocked?: boolean;
    initialIsManuallyUnlocked?: boolean;
    initialIsManuallyLocked?: boolean;
    year: number;
};

export default function AdminSettingsForm({ initialStartDate, initialEndDate, initialIsLocked = false, initialIsManuallyUnlocked = false, initialIsManuallyLocked = false, year }: Props) {
    const [startDate, setStartDate] = useState(initialStartDate ? new Date(initialStartDate).toISOString().split('T')[0] : "");
    const [endDate, setEndDate] = useState(initialEndDate ? new Date(initialEndDate).toISOString().split('T')[0] : "");
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState(false);
    const router = useRouter();

    const currentYear = new Date().getFullYear();
    const isCurrentYear = year === currentYear;

    // Check lock state from database
    const isLocked = initialIsLocked;
    const isManuallyUnlocked = initialIsManuallyUnlocked;
    const isManuallyLocked = initialIsManuallyLocked;

    // Derived effective state for UI
    const isSystemLocked = isLocked || isManuallyLocked;

    // Auto-adjust dates when one changes to prevent invalid ranges
    const handleStartDateChange = (newStartDate: string) => {
        setStartDate(newStartDate);

        // If end date is before new start date, adjust end date
        if (endDate && newStartDate > endDate) {
            setEndDate(newStartDate);
        }
    };

    const handleEndDateChange = (newEndDate: string) => {
        setEndDate(newEndDate);

        // If start date is after new end date, adjust start date
        if (startDate && newEndDate < startDate) {
            setStartDate(newEndDate);
        }
    };

    const handleYearChange = (newYear: number) => {
        router.push(`/admin/settings?year=${newYear}`);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!startDate || !endDate) {
                alert("Please select both start and end dates.");
                return;
            }

            if (startDate > endDate) {
                alert("Start date cannot be after end date.");
                return;
            }

            await setEvaluationPeriod(year, new Date(startDate), new Date(endDate));
            alert("Settings saved successfully.");
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleUnlock = async () => {
        if (!confirm("This will unlock the evaluation period for the current year. Continue?")) {
            return;
        }

        setToggling(true);
        try {
            await unlockEvaluationPeriod(year);
            alert("Evaluation period unlocked successfully.");
            router.refresh();
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Failed to unlock evaluation period.");
        } finally {
            setToggling(false);
        }
    };

    const handleLock = async () => {
        if (!confirm("This will lock the evaluation period. Users will not be able to submit evaluations. Continue?")) {
            return;
        }

        setToggling(true);
        try {
            await lockEvaluationPeriod(year);
            alert("Evaluation period locked successfully.");
            router.refresh();
        } catch (e: any) {
            console.error(e);
            alert(e.message || "Failed to lock evaluation period.");
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6 bg-slate-700/50 p-4 rounded-lg">
                <label className="text-sm font-medium text-slate-300">Managing Year:</label>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleYearChange(year - 1)} className="p-2 hover:bg-slate-600 rounded text-slate-400 hover:text-white">
                        ←
                    </button>
                    <span className="text-xl font-bold text-white">{year}</span>
                    <button onClick={() => handleYearChange(year + 1)} className="p-2 hover:bg-slate-600 rounded text-slate-400 hover:text-white">
                        →
                    </button>
                </div>

                {isManuallyLocked && (
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/50 font-semibold">
                            🔒 Manually Locked
                        </span>
                    </div>
                )}

                {!isManuallyLocked && isLocked && (
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/50 font-semibold">
                            🔒 Auto Locked (Ended)
                        </span>
                    </div>
                )}

                {!isSystemLocked && isManuallyUnlocked && (
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/50 font-semibold">
                            🔓 Manually Unlocked
                        </span>
                    </div>
                )}

                {!isSystemLocked && !isManuallyUnlocked && (
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/50 font-semibold">
                            ⏰ Open (Date Range)
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Start Date</label>
                    <input
                        type="date"
                        className={`w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none ${isSystemLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        disabled={isSystemLocked}
                    />
                    {isSystemLocked && (
                        <p className="text-xs text-slate-500 mt-1">Disabled: Evaluation period is locked</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">End Date</label>
                    <input
                        type="date"
                        className={`w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none ${isSystemLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        disabled={isSystemLocked}
                    />
                    {isSystemLocked && (
                        <p className="text-xs text-slate-500 mt-1">Disabled: Evaluation period is locked</p>
                    )}
                </div>
            </div>

            <div className="flex gap-4 flex-wrap">
                <button
                    onClick={handleSave}
                    disabled={saving || isSystemLocked}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? "Saving..." : "Save Settings"}
                </button>

                {isCurrentYear && (
                    <>
                        {isSystemLocked ? (
                            <button
                                onClick={handleUnlock}
                                disabled={toggling}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {toggling ? "Unlocking..." : (
                                    <>
                                        🔓 Unlock Period
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleLock}
                                disabled={toggling}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {toggling ? "Locking..." : (
                                    <>
                                        🔒 Lock Period
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}

                {!isCurrentYear && (
                    <div className="flex items-center text-sm text-slate-500 italic">
                        Cannot lock/unlock past years
                    </div>
                )}
            </div>

            {isCurrentYear && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg text-sm text-blue-300">
                    <strong>Lock/Unlock Controls:</strong>
                    {isManuallyLocked ? (
                        <> The evaluation period is <strong>manually locked</strong>. Users cannot submit. Unlock to allow access.</>
                    ) : isLocked ? (
                        <> The evaluation period is <strong>auto-locked</strong> (date ended). Unlock to force it open.</>
                    ) : isManuallyUnlocked ? (
                        <> The evaluation period is <strong>manually forced open</strong>. Lock to close it.</>
                    ) : (
                        <> The evaluation period is currently <strong>open</strong> based on dates. Lock to manually close it.</>
                    )}
                </div>
            )}
        </div>
    );
}
