/**
 * Scrape Seoul Outdoor Advertising Ordinance
 * Target: 서울특별시 옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 조례
 * ordinSeq: 2099885
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ordinance = {
    id: 'seoul_outdoor_ad_ord',
    title: '서울특별시 옥외광고물 등의 관리와 옥외광고산업 진흥에 관한 조례',
    seq: '2099885'
};

async function scrapeOrdinance() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log(`Scraping: ${ordinance.title}`);

    const url = `https://www.law.go.kr/LSW/ordinInfoP.do?ordinSeq=${ordinance.seq}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('#conScroll', { timeout: 30000 });

    // Wait for content to load
    await new Promise(r => setTimeout(r, 2000));

    const content = await page.$eval('#conScroll', el => el.innerText);
    console.log(`Content length: ${content.length} characters`);

    await browser.close();

    // Update law_data.json
    const lawDataPath = path.join(__dirname, 'law_data.json');
    let lawData = JSON.parse(fs.readFileSync(lawDataPath, 'utf8'));

    // Remove existing entry if any
    lawData = lawData.filter(item => item.id !== ordinance.id);

    // Add new data
    lawData.push({
        id: ordinance.id,
        title: ordinance.title,
        content: content
    });

    fs.writeFileSync(lawDataPath, JSON.stringify(lawData, null, 2), 'utf8');
    console.log(`Updated law_data.json with ${ordinance.id}`);
}

scrapeOrdinance().catch(console.error);
