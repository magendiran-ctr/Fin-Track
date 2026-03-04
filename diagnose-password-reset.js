const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing connection to MongoDB...');
        await prisma.$connect();
        console.log('Successfully connected to MongoDB.');

        console.log('Checking if PasswordResetToken model exists in the client...');
        if (prisma.passwordResetToken) {
            console.log('PasswordResetToken model exists in Prisma Client.');
        } else {
            console.log('PasswordResetToken model is MISSING in Prisma Client. You MUST run npx prisma generate.');
        }

        console.log('Testing a query to PasswordResetToken collection...');
        try {
            const count = await prisma.passwordResetToken.count();
            console.log(`PasswordResetToken collection exists. Current count: ${count}`);
        } catch (e) {
            console.log('Failed to query PasswordResetToken. The collection might not exist in the database yet.');
            console.error('Error detail:', e.message);
        }

    } catch (e) {
        console.error('Database connection failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
