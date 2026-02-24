async function testRegister() {
    const url = 'http://localhost:3000/api/auth/register';
    const body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    };

    console.log(`Calling ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();

        // Save HTML to a file to examine it better
        const fs = require('fs');
        fs.writeFileSync('error.html', text);
        console.log('Error HTML saved to error.html');

        if (text.includes('Error:')) {
            const errorMatch = text.match(/Error:[^<]+/);
            if (errorMatch) console.log('Found error in HTML:', errorMatch[0]);
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testRegister();
