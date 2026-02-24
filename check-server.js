async function check() {
    try {
        const res = await fetch('http://localhost:3000');
        console.log('Server Status:', res.status);
        const text = await res.text();
        console.log('Response Snippet:', text.substring(0, 100));
    } catch (e) {
        console.error('Connectivity Error:', e.message);
    }
}
check();
