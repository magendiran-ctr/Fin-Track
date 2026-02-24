const { PrismaClient } = require("@prisma/client");

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log("--- DATABASE DIAGNOSTICS ---");

        // Count users
        const userCount = await prisma.user.count();
        console.log(`Total Users: ${userCount}`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                take: 10,
                select: { id: true, email: true, name: true }
            });
            console.log("\nRecent Users:");
            users.forEach(u => console.log(`- ${u.email} (${u.name}) [ID: ${u.id}]`));
        }

        // Count expenses
        const expenseCount = await prisma.expense.count();
        console.log(`\nTotal Expenses: ${expenseCount}`);

        if (expenseCount > 0) {
            const expenses = await prisma.expense.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' }
            });
            console.log("\nRecent Expenses:");
            expenses.forEach(e => console.log(`- ${e.title}: ₹${e.amount} (User: ${e.userId}) [ID: ${e.id}]`));
        }

        console.log("\n--- END DIAGNOSTICS ---");
    } catch (e) {
        console.error("Diagnostic failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
