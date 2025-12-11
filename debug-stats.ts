
import { getDashboardStats } from "./src/app/actions";
import { prisma } from "./src/lib/prisma";

async function main() {
    try {
        console.log("Calling getDashboardStats...");
        const stats = await getDashboardStats();
        console.log("Stats summary:", {
            total: stats.totalEvaluations,
            weighted: stats.totalWeightedScore,
            breakdown: stats.breakdown
        });

        // Check raw data directly from DB to be sure
        const evals = await prisma.evaluationForm.findMany({ take: 3 });
        console.log("First 3 DB Evaluations:", JSON.stringify(evals, null, 2));

    } catch (error) {
        console.error("Error fetching stats:", error);
    }
}

main();
