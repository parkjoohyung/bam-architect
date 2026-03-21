
import fs from 'fs';
import https from 'https';

const filePath = 'd:\\park\\05.web\\js\\law_data_ordinance.js';

async function main() {
    console.log(`Checking file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
        console.error('File missing!');
        return;
    }
    const stats = fs.statSync(filePath);
    console.log(`File size: ${stats.size}, MTime: ${stats.mtime}`);

    let content = fs.readFileSync(filePath, 'utf8');
    const prefix = 'window.ordinanceData = ';
    const start = content.indexOf(prefix);
    const jsonPart = content.substring(start + prefix.length);
    const lastBracket = jsonPart.lastIndexOf(']');
    const cleanJson = jsonPart.substring(0, lastBracket + 1);

    let data = JSON.parse(cleanJson);
    console.log(`Loaded ${data.length} main regions.`);

    // Find the first ordinance URL
    let targetItem = null;

    // Traversing to find a specific one for testing (e.g. Seongnam)
    // Seongnam is in Gyeonggi-do (index 8 usually?)
    // Let's just find ANY nested ordinance with a pretty URL

    function findTarget(items) {
        for (const item of items) {
            if (item.url && item.url.includes('자치법규')) {
                return item;
            }
            if (item.ordinances) {
                const found = findTarget(item.ordinances);
                if (found) return found;
            }
            if (item.rows) {
                const found = findTarget(item.rows);
                if (found) return found;
            }
        }
        return null;
    }

    targetItem = findTarget(data);

    if (targetItem) {
        console.log(`Found target: ${targetItem.title}`);
        console.log(`URL: ${targetItem.url}`);

        // Try fetch
        console.log('Fetching...');
        https.get(targetItem.url, (res) => {
            console.log(`Status Code: ${res.statusCode}`);
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                const match = body.match(/<iframe[^>]*src="([^"]+)"/);
                if (match) {
                    console.log(`iframe src found: ${match[1]}`);
                } else {
                    console.log('No iframe found in response.');
                    // console.log('Body snippet:', body.substring(0, 500));
                }
            });
        }).on('error', e => console.error(e));

    } else {
        console.log('No target URL found matching "자치법규".');
    }
}

main();
