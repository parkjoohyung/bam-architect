
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const INPUT_FILE = path.resolve('js/law_data_ordinance.js');
// We will write back to the same file to allow "resuming" effectively
const OUTPUT_FILE = path.resolve('js/law_data_ordinance.js');

(async () => {
    console.log('Starting Ordinance Scraping (Incremental/Resumable)...');

    // 1. Read input file
    let rawData;
    try {
        if (fs.existsSync(OUTPUT_FILE)) {
            rawData = fs.readFileSync(OUTPUT_FILE, 'utf8');
        } else {
            rawData = fs.readFileSync(INPUT_FILE, 'utf8');
        }
        if (rawData.charCodeAt(0) === 0xFEFF) rawData = rawData.slice(1);
    } catch (err) {
        console.error('Error reading file:', err);
        return;
    }

    // 2. Parse Data
    let ordinanceData;
    try {
        let jsonStr = rawData.replace(/^window\.ordinanceData\s*=\s*/, '').replace(/;\s*$/, '');
        ordinanceData = new Function('return ' + jsonStr)();
        console.log(`Loaded ${ordinanceData.length} top-level groups.`);
    } catch (e) {
        console.error('Error parsing data:', e);
        return;
    }

    // 3. Launch Puppeteer
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
        });
    } catch (e) {
        console.error('Failed to launch browser:', e);
        return;
    }

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'media', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    // Helper to save data
    const saveData = () => {
        try {
            const output = `window.ordinanceData = ${JSON.stringify(ordinanceData, null, 4)};`;
            fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
            console.log(`[CheckPoint] Saved data to ${OUTPUT_FILE}`);
        } catch (e) {
            console.error('Error saving data:', e);
        }
    };

    // Helper to process items
    const processItem = async (item) => {
        if (!item.url || !item.url.includes('law.go.kr')) return; // Skip non-target
        if (item.fullText && item.fullText.length > 50) {
            // content already exists
            return;
        }

        console.log(`Fetching: ${item.title}`);

        try {
            await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });

            try {
                await page.waitForSelector('#conScroll', { timeout: 3000 });
            } catch (e) { }

            const content = await page.evaluate(() => {
                const el = document.getElementById('conScroll') || document.getElementById('contentBody') || document.querySelector('.textBody');
                if (!el) return null;
                const clone = el.cloneNode(true);
                clone.querySelectorAll('script, style, .h-buttons, .monitor, .print').forEach(e => e.remove());
                return clone.innerText.replace(/\s+/g, ' ').trim();
            });

            if (content) {
                item.fullText = content;
                console.log(`  -> Fetched ${content.length} chars`);
            } else {
                console.warn(`  -> No content found`);
                item.fullText = " "; // Mark as visited but empty
            }
        } catch (err) {
            console.error(`  -> Failed: ${err.message}`);
        }

        // Politeness delay
        await new Promise(r => setTimeout(r, 500));
    };

    // Prioritize Seoul (First group usually, or find by name)
    // We will iterate normally but look for "서울특별시" first
    let operationCount = 0;

    const processList = async (list) => {
        for (const item of list) {
            if (!item.fullText || item.fullText.length < 50) {
                await processItem(item);
                operationCount++;
                if (operationCount % 5 === 0) saveData();
            }
        }
    };

    // 1. Process Seoul Group First
    const seoulGroup = ordinanceData.find(g => (g.region || g.parent) === '서울특별시');
    if (seoulGroup) {
        console.log('--- Processing Seoul First ---');
        if (seoulGroup.ordinances) await processList(seoulGroup.ordinances);
        if (seoulGroup.rows) {
            for (const row of seoulGroup.rows) {
                if (row.ordinances) await processList(row.ordinances);
            }
        }
    }

    // 2. Process Others
    console.log('--- Processing Remaining Regions ---');
    for (const group of ordinanceData) {
        if ((group.region || group.parent) === '서울특별시') continue; // Skip already done

        if (group.ordinances) await processList(group.ordinances);
        if (group.rows) {
            for (const row of group.rows) {
                if (row.ordinances) await processList(row.ordinances);
            }
        }
    }

    await browser.close();
    saveData();
    console.log('Done.');

})();
