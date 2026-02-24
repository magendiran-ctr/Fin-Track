const fs = require('fs');
try {
    const buffer = fs.readFileSync('prisma_log.txt');
    // Try to detect/convert UTF-16LE
    const content = buffer.toString('utf16le');
    console.log(content);
} catch (e) {
    console.error('Failed to read file:', e.message);
}
