const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching users...');
        const users = await prisma.user.findMany();

        console.log(`Found ${users.length} total users.`);

        for (const user of users) {
            if (!user.User_id) {
                const newId = crypto.randomUUID();
                await prisma.user.update({
                    where: { id: user.id },
                    data: { User_id: newId }
                });
                console.log(`Updated user ${user.email} with User_id: ${newId}`);
            } else {
                console.log(`User ${user.email} already has User_id: ${user.User_id}`);
            }
        }

        console.log('Finished updating users.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
