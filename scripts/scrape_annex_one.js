import puppeteer from 'puppeteer';
import xlsx from 'xlsx';
import fs from 'fs';

const URL = 'https://www.law.go.kr/LSW/lsBylInfoPLinkR.do?lsiSeq=267115&lsNm=%EA%B1%B4%EC%B6%95%EB%B2%95%20%EC%8B%9C%ED%96%89%EB%A0%B9&bylNo=0001&bylBrNo=00&bylCls=BE&bylEfYd=20241022&bylEfYdYn=Y';
const EXCEL_FILE = 'data/시행령별표1.xlsx';

async function scrapeAndSave() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    console.log(`Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle2' });

    // Wait for content to load
    try {
        await page.waitForSelector('body', { timeout: 10000 });
    } catch (e) {
        console.log('Body selector timeout, proceeding anyway...');
    }

    // Extract text content
    console.log('Extracting text content...');
    const content = await page.evaluate(() => {
        // Try precise selector first, then fallback to body
        const el = document.querySelector('.text') || document.querySelector('#contentBody') || document.body;
        return el ? el.innerText : '';
    });

    await browser.close();

    if (!content) {
        console.error('Failed to extract content.');
        return;
    }

    console.log('Parsing content length:', content.length);
    // Simple parser logic (heuristic)
    // Structure typically: "1. 단독주택[줄바꿈] 가. 단독주택[줄바꿈] 나. 다중주택..."

    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    const parsedData = [];

    let currentNumber = '';
    let currentType = '';

    // Facility Group Mapping (Static for now as it's not in the text usually)
    // We can populate this based on the Title or specific logic if needed.
    // User requested "Show what's in the file", so maybe just raw parsing first.

    lines.forEach(line => {
        // Match "1. 단독주택" pattern
        const mainMatch = line.match(/^(\d+)\.\s*(.+)$/);
        if (mainMatch) {
            currentNumber = mainMatch[1];
            currentType = mainMatch[2];
            // Push a row for the main type itself? Or just context?
            // Usually the items are sub-items.
            return;
        }

        // Match "가. 아파트" pattern
        const subMatch = line.match(/^([가-하])\.\s*(.+)$/);
        if (subMatch && currentNumber) {
            parsedData.push({
                "군": "9", // Default or lookup
                "시설군": "주거업무시설군", // Default or lookup
                "번호": currentNumber,
                "유형": currentType,
                "종류": line, // Full line as Kind
                "비고": ""
            });
            return;
        }

        // If it looks like a continue line or remark, append to previous?
        // Simplicity first.
    });

    console.log(`Parsed ${parsedData.length} items.`);

    if (parsedData.length === 0) {
        console.error('No items parsed. Aborting Excel update to preserve existing data.');
        return;
    }

    // Convert to Excel compatible format (Array of Arrays)
    // Header: [null, 군, 시설군, 호, 용도군, 세부용도, 비고]
    const header = [null, "군", "시설군", "호", "용도군", "세부용도", "비고"];
    const wbData = [header];

    parsedData.forEach(item => {
        wbData.push([
            null,
            item.군,
            item.시설군,
            item.번호,
            item.유형,
            item.종류,
            item.비고
        ]);
    });

    // Write to Excel
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(wbData);
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

    xlsx.writeFile(wb, EXCEL_FILE);
    console.log(`Updated Excel file: ${EXCEL_FILE}`);
}

scrapeAndSave().catch(err => console.error(err));
