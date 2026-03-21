
import fs from 'fs';
import https from 'https';

const filePath = 'd:\\park\\05.web\\js\\law_data_ordinance.js';

// Hardcoded known working URL
const hardcoded = 'https://www.law.go.kr/%EC%9E%90%EC%B9%98%EB%B2%95%EA%B7%9C/%EB%B6%80%EC%82%B0%EA%B4%91%EC%97%AD%EC%8B%9C%EB%8F%84%EC%8B%9C%EA%B3%84%ED%9A%8D%EC%A1%B0%EB%A1%80';

function fetch(u, label) {
    console.log(`[${label}] Fetching: ${u}`);
    https.get(u, (res) => {
        console.log(`[${label}] Status: ${res.statusCode}`);
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            const match = data.match(/<iframe[^>]*src="([^"]+)"/);
            if (match) {
                console.log(`[${label}] SUCCESS: ${match[1]}`);
            } else {
                console.log(`[${label}] FAIL: No iframe. Body len: ${data.length}`);
            }
        });
    }).on('error', e => console.error(e));
}

let content = fs.readFileSync(filePath, 'utf8');
const prefix = 'window.ordinanceData = ';
const start = content.indexOf(prefix);
const jsonPart = content.substring(start + prefix.length);
const lastBracket = jsonPart.lastIndexOf(']');
const cleanJson = jsonPart.substring(0, lastBracket + 1);
let data = JSON.parse(cleanJson);

function findFirst(items) {
    for (const item of items) {
        if (item.url === hardcoded) {
            return item.url;
        }
        if (item.ordinances) {
            const found = findFirst(item.ordinances);
            if (found) return found;
        }
        if (item.rows) {
            const found = findFirst(item.rows);
            if (found) return found;
        }
    }
}

const fileUrl = findFirst(data);

if (fileUrl) {
    console.log(`Found matching URL in file.`);
    console.log(`Hardcoded === FileUrl? ${hardcoded === fileUrl}`);
    fetch(fileUrl, 'FILE');
    fetch(hardcoded, 'HARDCODED');
} else {
    console.log('Could not find the specific URL in file to compare.');
    // Find *any* encoded URL
    // ... logic omitted for brevity, assuming Busan exists
}
