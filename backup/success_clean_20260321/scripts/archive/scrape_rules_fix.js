
import puppeteer from 'puppeteer';
import fs from 'fs';

const targets = [
    { id: 'buld_mng_rules', title: '건축물관리법 시행규칙', url: 'https://www.law.go.kr/법령/건축물관리법시행규칙' }
];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    let lawData = [];
    if (fs.existsSync('law_data.json')) {
        lawData = JSON.parse(fs.readFileSync('law_data.json', 'utf8'));
    }

    // Remove old 'buld_mng_rules'
    lawData = lawData.filter(item => item.id !== 'buld_mng_rules');

    for (const target of targets) {
        console.log(`Scraping ${target.title}...`);
        try {
            await page.goto(target.url, { waitUntil: 'networkidle0', timeout: 60000 });
            await new Promise(r => setTimeout(r, 4000));

            let bestContent = '';
            let maxScore = 0;

            // Check if there's a main frame named 'contentBody'
            // Sometimes it's nested.

            const frames = page.frames();
            console.log(`  - Found ${frames.length} frames.`);

            for (const frame of frames) {
                try {
                    const text = await frame.evaluate(() => document.body.innerText);
                    // Formatting score
                    let score = 0;
                    if (text.includes('제1조')) score += 1000;
                    if (text.includes('목적')) score += 500;
                    if (text.includes('해체')) score += 500;

                    // Penalize if it looks like just a TOC
                    // TOC usually has lines like "제1조(목적)" but rarely "제1조(목적) 이 법은..."
                    // A simple TOC might have many newlines relative to length.

                    score += text.length;

                    console.log(`    > Frame: ${frame.name() || 'unnamed'} | Len: ${text.length} | Score: ${score}`);

                    if (score > maxScore) {
                        maxScore = score;
                        bestContent = text;
                    }
                } catch (e) { }
            }

            console.log(`  - Selected Content Length: ${bestContent.length}`);

            // Post-processing
            if (bestContent.length > 100) {
                bestContent = bestContent.replace(/(\s*)(제\d+(?:의\d+)?조[\(\u4e00-\u9fa5\s])/g, '\n\n$2');
                bestContent = bestContent.replace(/(\s*)(제\d+장\s)/g, '\n\n$2');
            }

            lawData.push({
                id: target.id,
                title: target.title,
                content: bestContent
            });

        } catch (e) {
            console.error(`Failed to scrape ${target.title}: ${e.message}`);
        }
    }

    fs.writeFileSync('law_data.json', JSON.stringify(lawData, null, 2));
    console.log('Rules update complete.');
    await browser.close();
})();
