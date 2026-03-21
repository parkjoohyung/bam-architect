
import fs from 'fs';
import https from 'https';
import path from 'path';

const filePath = 'd:\\park\\05.web\\js\\law_data_ordinance.js';
const DELAY_MS = 300;

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchRealUrl(url) {
    return new Promise((resolve) => {
        // Skip if not law.go.kr or already fixed
        if (!url.includes('law.go.kr')) {
            resolve(url);
            return;
        }
        if (url.includes('ordinInfoP.do')) {
            resolve(url);
            return;
        }

        // Ensure URL is encoded
        let targetUrl = url;
        try {
            // Check if it contains non-ascii characters
            if (/[^\x00-\x7F]/.test(url)) {
                targetUrl = encodeURI(url);
            }
        } catch (e) {
            console.warn(`Encoding failed for ${url}`);
        }

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        };

        https.get(targetUrl, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/<iframe[^>]*src="([^"]+)"/);
                if (match) {
                    let realUrl = match[1];
                    if (realUrl.startsWith('/')) {
                        realUrl = 'https://www.law.go.kr' + realUrl;
                    }
                    realUrl = realUrl.replace(/&amp;/g, '&');
                    console.log(`[CONVERTED] ...${url.slice(-20)} -> ...${realUrl.slice(-20)}`);
                    resolve(realUrl);
                } else {
                    // console.warn(`[SKIPPED] No iframe found for ${url.slice(0, 30)}... Status: ${res.statusCode}`);
                    resolve(url);
                }
            });
        }).on('error', err => {
            console.error(`[ERROR] Fetching ${url}: ${err.message}`);
            resolve(url);
        });
    });
}

async function processOrdinances(items) {
    let count = 0;
    for (const item of items) {
        if (item.url) {
            const oldUrl = item.url;
            // Filter: only try to fix likely "pretty" URLs
            if (oldUrl.includes('자치법규') || oldUrl.includes('%EC%9E%90%EC') || oldUrl.includes('law.go.kr')) {
                const newUrl = await fetchRealUrl(item.url);
                if (oldUrl !== newUrl) {
                    item.url = newUrl;
                    count++;
                    await wait(DELAY_MS);
                }
            }
        }
        if (item.ordinances) {
            count += await processOrdinances(item.ordinances);
        }
        if (item.rows) {
            count += await processOrdinances(item.rows);
        }
    }
    return count;
}

async function main() {
    console.log(`Processing ${filePath}`);
    if (!fs.existsSync(filePath)) {
        console.error('File NOT found');
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const prefix = 'window.ordinanceData = ';
    const start = content.indexOf(prefix);
    if (start === -1) { console.error('Invalid file format'); return; }

    const jsonPart = content.substring(start + prefix.length);
    const lastBracket = jsonPart.lastIndexOf(']');
    const cleanJson = jsonPart.substring(0, lastBracket + 1);

    let data;
    try {
        data = JSON.parse(cleanJson);
    } catch (e) {
        console.error('Failed to parse JSON');
        return;
    }

    console.log('Starting batch processing...');
    const changedCount = await processOrdinances(data);
    console.log(`Total URLs updated: ${changedCount}`);

    if (changedCount > 0) {
        // Beautify slightly but keep compact if needed. using 4 spaces as before
        const newContent = `${prefix}${JSON.stringify(data, null, 4)};`;
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('File successfully updated.');
    } else {
        console.log('No changes made.');
    }
}

main();
