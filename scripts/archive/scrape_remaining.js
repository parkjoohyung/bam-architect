
import puppeteer from 'puppeteer';
import fs from 'fs';

const targets = [
    // Standards/Rules (Admin Rules & Laws)
    { id: 'balcony_criteria', title: '발코니 등의 구조변경절차 및 설치기준', url: 'https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000171416' },
    { id: 'landscape_criteria', title: '조경기준', url: 'https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000208056' },
    { id: 'fire_safety_rules', title: '건축물의 피난ㆍ방화구조 등의 기준에 관한 규칙', url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=279461&urlMode=lsInfoP' },
    { id: 'energy_saving_criteria', title: '건축물의 에너지절약설계기준', url: 'https://www.law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000106860' },

    // Ordinances
    { id: 'seoul_building_ord', title: '서울특별시 건축 조례', url: 'https://www.law.go.kr/LSW/ordinInfoP.do?ordinSeq=2070477' },
    { id: 'seoul_planning_ord', title: '서울특별시 도시계획 조례', url: 'https://www.law.go.kr/LSW/ordinInfoP.do?ordinSeq=2099911' },
    { id: 'seoul_planning_rules', title: '서울특별시 도시계획 조례 시행규칙', url: 'https://www.law.go.kr/LSW/ordinInfoP.do?ordinSeq=1976247' },
    { id: 'seoul_parking_ord', title: '서울특별시 주차장 설치 및 관리 조례', url: 'https://www.law.go.kr/LSW/ordinInfoP.do?ordinSeq=2070413' }
];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Read existing data
    let lawData = [];
    if (fs.existsSync('law_data.json')) {
        lawData = JSON.parse(fs.readFileSync('law_data.json', 'utf8'));
    }

    for (const target of targets) {
        console.log(`Scraping ${target.title}...`);

        // Remove existing entry if checking for updates, or just skip? 
        // User asked to "collect data not collected". I'll replace if exists to be safe, or append.
        lawData = lawData.filter(item => item.id !== target.id);

        try {
            await page.goto(target.url, { waitUntil: 'networkidle2' });

            // Wait for common content selector
            // For admin rules and ordinances, it might be different, but usually #conScroll exists inside the iframe or main body.
            // If it's a direct link to the content wrapper page.
            try {
                await page.waitForSelector('#conScroll, .text', { timeout: 5000 });
            } catch (e) {
                // If timeout, proceed - might be loaded immediately
            }

            const content = await page.evaluate(() => {
                // Try specific containers first
                const containers = [
                    document.getElementById('conScroll'),
                    document.querySelector('.text'),
                    document.getElementById('contentBody'),
                    document.body
                ];
                for (const c of containers) {
                    if (c && c.innerText && c.innerText.length > 100) return c.innerText;
                }
                return document.body.innerText;
            });

            lawData.push({
                id: target.id,
                title: target.title,
                content: content
            });

            console.log(`  - Length: ${content.length}`);

            await new Promise(r => setTimeout(r, 1000)); // Be polite

        } catch (e) {
            console.error(`Failed to scrape ${target.title}: ${e.message}`);
        }
    }

    fs.writeFileSync('law_data.json', JSON.stringify(lawData, null, 2));
    console.log('All done. law_data.json updated.');
    await browser.close();
})();
