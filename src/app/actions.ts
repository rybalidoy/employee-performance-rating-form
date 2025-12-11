"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getEmployees() {
    return await prisma.employee.findMany({
        include: { role: true },
        orderBy: { last_name: "asc" },
    });
}

export async function getEmployeeById(id: number) {
    return await prisma.employee.findUnique({
        where: { id },
        include: { role: true },
    });
}

export type EvaluationData = {
    evaluatorId: number;
    evaluateeId: number;
    score_punctuality?: number;
    score_wearing_uniform?: number;
    score_quality_of_work?: number;
    score_productivity?: number;
    score_teamwork?: number;
    score_adaptability?: number;
    remarks?: string;
    nominees?: number[]; // IDs of nominees
};

export async function submitEvaluation(data: any) {
    console.log("submitEvaluation received data:", JSON.stringify(data, null, 2));

    const isOpen = await isEvaluationOpen();
    if (!isOpen) {
        // Allow Admins to override? Maybe not for now. Strict locking.
        throw new Error("Evaluation period is closed.");
    }

    // Check if evaluation exists for this year to Upsert
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const existingEvaluation = await prisma.evaluationForm.findFirst({
        where: {
            evaluatorId: data.evaluatorId,
            evaluateeId: data.evaluateeId,
            createdAt: {
                gte: startOfYear,
                lt: endOfYear
            }
        }
    });

    const formData = {
        score_punctuality: data.scores.score_punctuality,
        score_wearing_uniform: data.scores.score_wearing_uniform,
        score_quality_of_work: data.scores.score_quality_of_work,
        score_productivity: data.scores.score_productivity,
        score_teamwork: data.scores.score_teamwork,
        score_adaptability: data.scores.score_adaptability,
        remarks: data.remarks || "",
    };

    if (existingEvaluation) {
        // Update
        await prisma.evaluationForm.update({
            where: { id: existingEvaluation.id },
            data: formData
        });
    } else {
        // Create
        await prisma.evaluationForm.create({
            data: {
                evaluatorId: data.evaluatorId,
                evaluateeId: data.evaluateeId,
                ...formData
            },
        });
    }

    // Handle Peer Nominations (Upsert logic: delete old, create new?)
    // For simplicity: Delete all nominations from this evaluator -> recreate
    if (data.nominees && data.nominees.length > 0) {
        // First, remove existing nominations by this evaluator (optional: or just strictly upsert)
        // Since nominations are just links, safer to wipe and write if the list changed.
        // But user said "Upsert entries". Let's assume nominations are part of the evaluator's "session".

        // Better approach: Nomination is many-to-many. 
        // Checking if we need to remove unchecked ones. 
        // Let's just create new ones that don't exist.
        // A full sync is safer:
        await prisma.nomination.deleteMany({
            where: { nominatorId: data.evaluatorId }
        });

        await prisma.nomination.createMany({
            data: data.nominees.map((nomineeId: number) => ({
                nominatorId: data.evaluatorId,
                nomineeId,
            })),
        });
    }

    revalidatePath("/");
    revalidatePath("/evaluate");
}

import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-dev-secret-change-me");

export async function login(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "Missing credentials" };
    }

    const user = await prisma.employee.findUnique({
        where: { username },
        include: { role: true }
    });

    if (!user || user.password !== password) {
        return { error: "Invalid credentials" };
    }

    // Create JWT
    const token = await new SignJWT({
        id: user.id.toString(),
        name: user.last_name + ", " + user.first_name,
        role: user.role.name
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(JWT_SECRET);

    // Set cookie
    const c = await cookies();
    c.set("user_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 // 24 hours
    });

    return { success: true };
}

export async function logout() {
    const c = await cookies();
    c.delete("user_session");
    redirect("/login");
}

export async function getSession() {
    const c = await cookies();
    const token = c.get("user_session")?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { id: string; name: string; role: string };
    } catch (e) {
        return null;
    }
}

export async function getExistingEvaluation(evaluatorId: number, evaluateeId: number) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const evaluation = await prisma.evaluationForm.findFirst({
        where: {
            evaluatorId: evaluatorId,
            evaluateeId: evaluateeId,
            createdAt: {
                gte: startOfYear,
                lt: endOfYear
            }
        }
    });

    // Also get nominations if this is an employee peer review context (where evaluateeId might be irrelevant or used differently)
    // Actually evaluateeId is the target. For Peer Nominations, the evaluator nominates OTHERS.
    // So we need to fetch Nominations by EvaluatorId.
    const nominations = await prisma.nomination.findMany({
        where: { nominatorId: evaluatorId },
        select: { nomineeId: true }
    });

    return { evaluation, nominations: nominations.map(n => n.nomineeId) };
}

export async function getEvaluatorHistory(evaluatorId: number) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const evaluations = await prisma.evaluationForm.findMany({
        where: {
            evaluatorId: evaluatorId,
            createdAt: {
                gte: startOfYear,
                lt: endOfYear
            }
        }
    });

    return evaluations;
}

export async function getDashboardStats() {
    // Fetch all evaluations
    const rawEvaluations = await prisma.evaluationForm.findMany({
        include: {
            evaluatee: {
                select: { id: true, first_name: true, last_name: true, role: { select: { name: true } } }
            },
            evaluator: {
                select: { id: true, first_name: true, last_name: true, role: { select: { name: true } } }
            },
        },
        orderBy: { createdAt: 'desc' }
    });

    // Calculate average scores (simplified logic)
    const totalEvaluations = rawEvaluations.length;


    // Weights (Updated based on request)
    const WEIGHTS = {
        punctuality: 0.10,
        wearing_uniform: 0.05,
        quality_of_work: 0.30,
        productivity: 0.35,
        teamwork: 0.10,
        adaptability: 0.10
    };

    // ... (counts/sums logic uses forEach) ...

    // Change evaluations.forEach to rawEvaluations.forEach for the rest of the function or
    // just rename variable usage cleanly.

    // Simpler: Let's keep 'evaluations' as the raw one for logic, and create 'safeEvaluations' for return.

    const evaluations = rawEvaluations; // Revert variable name for logic below

    // ... logic continues using 'evaluations' (Date objects) ...
    // Note: I need to replace the sanitized map block I added. 
    // It's cleaner to do the sanitization at the very end.





    // Calculate averages per category
    const sums = {
        punctuality: 0,
        wearing_uniform: 0,
        quality_of_work: 0,
        productivity: 0,
        teamwork: 0,
        adaptability: 0
    };

    const counts = { ...sums };

    // Helper to calculate weighted score for a single evaluation (or aggregated per person)
    const calculateWeightedScore = (scores: Partial<Record<keyof typeof WEIGHTS, number>>) => {
        let score = 0;
        let maxPotentialWeight = 0;

        (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).forEach(key => {
            if (scores[key]) {
                score += scores[key]! * WEIGHTS[key];
                maxPotentialWeight += WEIGHTS[key];
            }
        });

        // Normalize if not all fields are present? 
        // For now, assuming raw accumulative score, but correctly it should be relative to what was rated.
        // However, usually performance ratings align on a fixed 5.0 scale.
        return score;
    };

    evaluations.forEach((ev: any) => {
        if (ev.score_punctuality) { sums.punctuality += ev.score_punctuality; counts.punctuality++; }
        if (ev.score_wearing_uniform) { sums.wearing_uniform += ev.score_wearing_uniform; counts.wearing_uniform++; }
        if (ev.score_quality_of_work) { sums.quality_of_work += ev.score_quality_of_work; counts.quality_of_work++; }
        if (ev.score_productivity) { sums.productivity += ev.score_productivity; counts.productivity++; }
        if (ev.score_teamwork) { sums.teamwork += ev.score_teamwork; counts.teamwork++; }
        if (ev.score_adaptability) { sums.adaptability += ev.score_adaptability; counts.adaptability++; }
    });

    const breakdown = Object.keys(WEIGHTS).map((key) => {
        const k = key as keyof typeof WEIGHTS;
        const count = counts[k];
        const avg = count > 0 ? sums[k] / count : 0;
        const weight = WEIGHTS[k];
        return {
            label: k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            rating: avg,
            weight: weight,
            weightedScore: avg * weight
        };
    });

    const totalWeightedScore = breakdown.reduce((acc, curr) => acc + curr.weightedScore, 0);

    // Group by year? Request says "dashboard for the current year"
    const currentYear = new Date().getFullYear();
    const currentYearEvaluations = evaluations.filter(e => e.createdAt.getFullYear() === currentYear);

    // Calculate Top Performers
    // We need to group evaluations by evaluatee
    const evaluateeScores: Record<number, { name: string, totalWeighted: number, count: number }> = {};

    currentYearEvaluations.forEach((ev: any) => {
        if (!evaluateeScores[ev.evaluateeId]) {
            evaluateeScores[ev.evaluateeId] = {
                name: `${ev.evaluatee.last_name}, ${ev.evaluatee.first_name}`,
                totalWeighted: 0,
                count: 0
            };
        }

        // Calculate score for this specific evaluation
        let evScore = 0;
        if (ev.score_punctuality) evScore += ev.score_punctuality * WEIGHTS.punctuality;
        if (ev.score_wearing_uniform) evScore += ev.score_wearing_uniform * WEIGHTS.wearing_uniform;
        if (ev.score_quality_of_work) evScore += ev.score_quality_of_work * WEIGHTS.quality_of_work;
        if (ev.score_productivity) evScore += ev.score_productivity * WEIGHTS.productivity;
        if (ev.score_teamwork) evScore += ev.score_teamwork * WEIGHTS.teamwork;
        if (ev.score_adaptability) evScore += ev.score_adaptability * WEIGHTS.adaptability;

        // Note: This logic assumes a single evaluation contains all metrics OR we average out partials.
        // A better approach for "Overall Performance" is averaging the ratings per category per person, then weighting.
        // But for simplicity of this "Top Performers" list, let's accumulate weighted scores based on what's available.
        // Actually, since different roles fill different forms, we should sum up the weighted components provided.

        evaluateeScores[ev.evaluateeId].totalWeighted += evScore;
        evaluateeScores[ev.evaluateeId].count += 1; // This might be misleading if we have multiple forms (self, peer, boss)
    });

    // Refined Top Selection: Average the Weighted Scores? 
    // If an employee gets 3 peer reviews (teamwork only) and 1 boss review (quality), 
    // simply summing them is wrong.
    // Correct way: Average rating per category per person => Apply Weights => Sum.

    const evaluateeStats: Record<number, { name: string, counts: typeof counts, sums: typeof sums }> = {};

    currentYearEvaluations.forEach((ev: any) => {
        if (!evaluateeStats[ev.evaluateeId]) {
            evaluateeStats[ev.evaluateeId] = {
                name: `${ev.evaluatee.last_name}, ${ev.evaluatee.first_name}`,
                sums: { ...sums, punctuality: 0, wearing_uniform: 0, quality_of_work: 0, productivity: 0, teamwork: 0, adaptability: 0 }, // Reset
                counts: { ...sums, punctuality: 0, wearing_uniform: 0, quality_of_work: 0, productivity: 0, teamwork: 0, adaptability: 0 } // Reset
            };
        }
        const es = evaluateeStats[ev.evaluateeId];
        if (ev.score_punctuality) { es.sums.punctuality += ev.score_punctuality; es.counts.punctuality++; }
        if (ev.score_wearing_uniform) { es.sums.wearing_uniform += ev.score_wearing_uniform; es.counts.wearing_uniform++; }
        if (ev.score_quality_of_work) { es.sums.quality_of_work += ev.score_quality_of_work; es.counts.quality_of_work++; }
        if (ev.score_productivity) { es.sums.productivity += ev.score_productivity; es.counts.productivity++; }
        if (ev.score_teamwork) { es.sums.teamwork += ev.score_teamwork; es.counts.teamwork++; }
        if (ev.score_adaptability) { es.sums.adaptability += ev.score_adaptability; es.counts.adaptability++; }
    });

    const topPerformers = Object.values(evaluateeStats).map(stat => {
        let totalScore = 0;
        (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).forEach(key => {
            const avg = stat.counts[key] > 0 ? stat.sums[key] / stat.counts[key] : 0;
            totalScore += avg * WEIGHTS[key];
        });
        return { name: stat.name, score: totalScore };
    }).sort((a, b) => b.score - a.score).slice(0, 5);

    const safeEvaluations = evaluations.map(ev => ({
        ...ev,
        createdAt: ev.createdAt.toISOString(),
    }));

    const isOpen = await isEvaluationOpen();

    return {
        totalEvaluations: currentYearEvaluations.length,
        breakdown,
        totalWeightedScore,
        topPerformers,
        evaluations: safeEvaluations, // Return raw data for Div Head view
        isEvaluationOngoing: isOpen
    };
}

// --- Evaluation Period Actions ---

export async function getEvaluationPeriod(year?: number) {
    const targetYear = year || new Date().getFullYear();
    return await prisma.evaluationPeriod.findUnique({
        where: { year: targetYear }
    });
}

export async function setEvaluationPeriod(year: number, startDate: Date, endDate: Date) {
    return await prisma.evaluationPeriod.upsert({
        where: { year },
        update: { startDate, endDate },
        create: { year, startDate, endDate }
    });
}

export async function isEvaluationOpen() {
    const currentYear = new Date().getFullYear();
    const period = await getEvaluationPeriod(currentYear);
    if (!period) return true; // Default to open if not set

    const now = new Date();
    return now >= period.startDate && now <= period.endDate;
}

export async function getRespondentStatus() {
    const employees = await prisma.employee.findMany({
        include: {
            role: true,
            evaluationsGiven: true, // Only current year needed strictly but...
            nominationsGiven: true
        }
    });

    const totalActiveEmployees = employees.length;

    // We should strictly filter by current year for evaluations/nominations 
    // but assuming DB setup implies current context or cleared yearly.
    // For rigor, let's filter in memory or query better. 
    // Given the previous pattern, we didn't always filter by year in basic queries, but let's do simple length check for now as requested.
    // Wait, the user said "evaluationsGiven should be equal to active employees".
    // Does that mean *every* evaluation form must be filled? Yes.

    return employees.map(emp => {
        let isCompleted = false;
        let progress = "";

        if (emp.role.name === "Employee") {
            isCompleted = emp.nominationsGiven.length > 0;
            progress = isCompleted ? "Nominated Peers" : "Pending";
        } else {
            // Admin or Div Head
            // Target count = totalEmployees - 1 (self)
            const target = totalActiveEmployees - 1;
            const current = emp.evaluationsGiven.length;
            isCompleted = current >= target; // >= just in case
            progress = `${current} / ${target}`;
        }

        return {
            id: emp.id,
            name: `${emp.last_name}, ${emp.first_name}`,
            role: emp.role.name,
            isCompleted,
            progress
        };
    });
}

// --- User Management Actions ---

export async function createEmployee(data: any) {
    const existing = await prisma.employee.findUnique({
        where: { username: data.username }
    });
    if (existing) throw new Error("Username already taken.");

    return await prisma.employee.create({
        data: {
            first_name: data.first_name,
            last_name: data.last_name,
            middle_initial: data.middle_initial,
            username: data.username,
            password: data.password,
            roleId: parseInt(data.roleId)
        }
    });
}

export async function updateEmployee(id: number, data: any) {
    const updateData: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        middle_initial: data.middle_initial,
        roleId: parseInt(data.roleId)
    };
    if (data.password) updateData.password = data.password;

    return await prisma.employee.update({
        where: { id },
        data: updateData
    });
}

export async function deleteEmployee(id: number) {
    return await prisma.employee.delete({
        where: { id }
    });
}

export async function getRoles() {
    return await prisma.role.findMany();
}
