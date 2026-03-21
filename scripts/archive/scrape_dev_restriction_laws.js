import puppeteer from 'puppeteer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const laws = [
    { id: 'dev_act', title: '개발제한구역의 지정 및 관리에 관한 특별조치법', seq: '254803' },
    { id: 'dev_decree', title: '개발제한구역의 지정 및 관리에 관한 특별조치법 시행령', seq: '281641' },
    { id: 'dev_rules', title: '개발제한구역의 지정 및 관리에 관한 특별조치법 시행규칙', seq: '260441' }
];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const resultData = [];

    // Set User-Agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    for (const law of laws) {
        console.log(`Scraping ${law.title}...`);

        const url = `https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=${law.seq}&urlMode=lsInfoP`;

        await page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for content to load
        try {
            await page.waitForSelector('#conScroll', { timeout: 10000 });
        } catch (e) {
            console.log("Wait for #conScroll timed out, trying to proceed anyway...");
        }

        // Get the full text
        const content = await page.evaluate(() => {
            const container = document.getElementById('conScroll') || document.body;
            return container.innerText;
        });

        resultData.push({
            id: law.id,
            title: law.title,
            content: content
        });

        // Random delay to be polite
        await new Promise(r => setTimeout(r, 2000));
    }

    // Save to JSON
    fs.writeFileSync('d:/park/05.web/law_data_dev.json', JSON.stringify(resultData, null, 2));
    console.log('Done! Saved to law_data_dev.json');

    await browser.close();
})();
