const { PrismaClient } = require("@prisma/client");

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log("Testing database connection...");
        await prisma.$connect();
        console.log("✅ Successfully connected to the database!");

        const userCount = await prisma.user.count();
        console.log(`📊 Current user count: ${userCount}`);
    } catch (e) {
        console.error("❌ Connection failed!");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
