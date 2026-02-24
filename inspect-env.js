const fs = require('fs');
const content = fs.readFileSync('.env');
console.log('Hex representation:');
console.log(content.toString('hex').match(/.{1,32}/g).join('\n'));
console.log('\nText representation:');
console.log(content.toString('utf-8'));
