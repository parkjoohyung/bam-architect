
import fs from 'fs';
import path from 'path';

const INPUT_FILE = path.resolve('js/law_data_ordinance.js');

console.log('Starting read test...');
try {
    const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
    console.log(`Read ${rawData.length} bytes.`);

    const jsonStr = rawData.replace(/^window\.ordinanceData\s*=\s*/, '').replace(/;\s*$/, '');
    console.log(`Stripped length: ${jsonStr.length}`);

    const data = new Function('return ' + jsonStr)();
    console.log(`Parsed items: ${data.length}`);
} catch (e) {
    console.error('Error:', e);
}
console.log('Done.');
