
import puppeteer from 'puppeteer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const laws = [
    {
        id: 'outdoor_ad_act',
        title: '옥외광고물법',
        seq: '270383'
    },
    {
        id: 'outdoor_ad_decree',
        title: '옥외광고물법 시행령',
        seq: '281033'
    }
];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Set User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    const results = [];

    for (const law of laws) {
        console.log(`Scraping ${law.title}...`);
        const url = `https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=${law.seq}&urlMode=lsInfoP`;

        await page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for content
        try {
            await page.waitForSelector('#conScroll', { timeout: 10000 });
        } catch (e) {
            console.log("Wait for #conScroll timed out, trying to proceed anyway...");
        }

        // Get text
        const content = await page.evaluate(() => {
            const container = document.getElementById('conScroll') || document.body;
            return container.innerText;
        });

        results.push({
            id: law.id,
            title: law.title,
            content: content
        });

        console.log(`  Done: ${content.length} characters`);
    }

    await browser.close();

    // Update law_data.json
    const dataPath = 'law_data.json';
    let lawData = [];
    if (fs.existsSync(dataPath)) {
        lawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    // Remove existing if any
    const idsToRemove = results.map(r => r.id);
    lawData = lawData.filter(item => !idsToRemove.includes(item.id));

    // Add new
    lawData.push(...results);

    fs.writeFileSync(dataPath, JSON.stringify(lawData, null, 2));
    console.log('Done! Updated law_data.json with Outdoor Advertising Act and Decree.');

})();
