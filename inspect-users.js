const { PrismaClient } = require("@prisma/client");

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log("Fetching users...");
        const users = await prisma.user.findMany({
            take: 10,
            select: { id: true, email: true }
        });

        console.log("User IDs and formats:");
        users.forEach(u => {
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(u.id);
            console.log(`- Email: ${u.email}, ID: ${u.id}, IsObjectId: ${isObjectId}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
