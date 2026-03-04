const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testSMTP() {
    console.log('--- SMTP Diagnostic Tool ---');
    console.log(`Host: ${process.env.MAIL_HOST}`);
    console.log(`Port: ${process.env.MAIL_PORT}`);
    console.log(`User: ${process.env.MAIL_USER}`);
    console.log(`Secure: ${process.env.MAIL_SECURE}`);
    console.log('---------------------------');

    const user = (process.env.MAIL_USER || '').trim();
    const pass = (process.env.MAIL_PASSWORD || '').trim();

    let hasError = false;
    if (!user || user.includes('YOUR_REAL_GMAIL')) {
        console.error('ERROR: MAIL_USER is still a placeholder or empty.');
        hasError = true;
    }
    if (!pass || pass.includes('YOUR_16_CHAR')) {
        console.error('ERROR: MAIL_PASSWORD is still a placeholder or empty.');
        hasError = true;
    }

    if (hasError) {
        console.info('\nPlease update both MAIL_USER and MAIL_PASSWORD in your .env file with real credentials.');
        console.info('See .env.example for instructions on how to generate a Gmail App Password.');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
            user: user,
            pass: pass,
        },
    });

    console.log('Attempting to connect to SMTP server...');
    try {
        await transporter.verify();
        console.log('✅ Success: SMTP connection verified!');

        console.log('Sending a test email to yourself...');
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM || user,
            to: user,
            subject: 'SMTP Test from FinTrack',
            text: 'If you are reading this, your SMTP configuration is working correctly!',
            html: '<b>If you are reading this, your SMTP configuration is working correctly!</b>',
        });

        console.log('✅ Success: Test email sent!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Failed: SMTP error occurred:');
        console.error(error.message);
        if (error.code === 'EAUTH') {
            console.error('\nHINT: This is an Authentication error.');
            console.error('If using Gmail, make sure you are using an "App Password", not your regular password.');
            console.error('Link: https://myaccount.google.com/apppasswords');
        }
    }
}

testSMTP();
