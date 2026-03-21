
import fs from 'fs';

const filePath = 'd:\\park\\05.web\\js\\law_data_ordinance.js';

let content = fs.readFileSync(filePath, 'utf8');
const prefix = 'window.ordinanceData = ';
const start = content.indexOf(prefix);
const jsonPart = content.substring(start + prefix.length);
const lastBracket = jsonPart.lastIndexOf(']');
const cleanJson = jsonPart.substring(0, lastBracket + 1);
let data = JSON.parse(cleanJson);

function findFirst(items) {
    for (const item of items) {
        if (item.url && (item.url.includes('자치법규') || item.url.includes('%EC%9E%90%EC%B9%98%EB%B2%95%EA%B7%9C'))) {
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

const url = findFirst(data);
console.log('Exact URL:', url);
console.log('Stringified:', JSON.stringify(url));
