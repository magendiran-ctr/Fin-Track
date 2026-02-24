const { execSync } = require('child_process');
try {
    console.log('Running: npx prisma generate --schema=test.prisma');
    const output = execSync('npx prisma generate --schema=test.prisma', { encoding: 'utf8', stdio: 'pipe' });
    console.log('Output:');
    console.log(output);
} catch (error) {
    console.log('Error Code:', error.status);
    console.log('StdOut:', error.stdout.toString('utf8'));
    console.log('StdErr:', error.stderr.toString('utf8'));
}
