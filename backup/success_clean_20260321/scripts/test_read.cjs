
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.resolve('js/law_data_ordinance.js');
const LOG_FILE = path.resolve('debug_log.txt');

function log(msg) {
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

fs.writeFileSync(LOG_FILE, 'Starting CJS test...\n');

try {
    log(`Reading from ${INPUT_FILE}`);
    const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
    log(`Read ${rawData.length} bytes.`);

    // Check start/end
    log(`Start: ${rawData.substring(0, 50)}`);

    const jsonStr = rawData.replace(/^window\.ordinanceData\s*=\s*/, '').replace(/;\s*$/, '');
    log(`Stripped length: ${jsonStr.length}`);

    log('Parsing...');
    // Only parse first 1000 chars to test if eval is the issue
    // Actually full parse
    const data = new Function('return ' + jsonStr)();
    log(`Parsed items: ${data.length}`);

} catch (e) {
    log(`Error: ${e.message}`);
    log(`Stack: ${e.stack}`);
}
log('Done.');
