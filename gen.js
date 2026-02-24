const { spawn } = require('child_process');

function generate() {
    console.log('Starting prisma generate...');
    const prs = spawn('npx.cmd', ['prisma', 'generate'], {
        cwd: process.cwd(),
        shell: true,
        env: process.env
    });

    prs.stdout.on('data', (data) => {
        console.log(`STDOUT: ${data}`);
    });

    prs.stderr.on('data', (data) => {
        console.error(`STDERR: ${data}`);
    });

    prs.on('close', (code) => {
        console.log(`Process exited with code ${code}`);
    });
}

generate();
