async function testFlow() {
    const baseUrl = 'http://localhost:3000';
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    // 1. Register
    console.log('--- Registering ---');
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User', email, password })
    });
    const regData = await regRes.json();
    console.log('Register Status:', regRes.status);
    if (regRes.status !== 201) {
        console.error('Register failed:', regData);
        return;
    }
    const token = regData.token;
    const userId = regData.user.id;
    console.log('Registered. User ID:', userId);

    // 2. Create Expense
    console.log('\n--- Creating Expense ---');
    const expRes = await fetch(`${baseUrl}/api/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            title: 'Test Expense',
            amount: 50.75,
            category: 'Food',
            date: new Date().toISOString().split('T')[0]
        })
    });
    const expData = await expRes.json();
    console.log('Expense Creation Status:', expRes.status);
    console.log('Response Body:', JSON.stringify(expData, null, 2));

    if (expRes.status === 201) {
        console.log('\n✅ Flow successful!');
    } else {
        console.log('\n❌ Flow failed at expense creation.');
    }
}

testFlow();
