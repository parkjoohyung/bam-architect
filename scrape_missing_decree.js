
import puppeteer from 'puppeteer';
import fs from 'fs';

const targets = [
    { id: 'buld_mng_decree', title: '건축물관리법 시행령', url: 'https://www.law.go.kr/법령/건축물관리법시행령' },
    { id: 'buld_mng_rules', title: '건축물관리법 시행규칙', url: 'https://www.law.go.kr/법령/건축물관리법시행규칙' }
];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    let lawData = [];
    if (fs.existsSync('law_data.json')) {
        try {
            lawData = JSON.parse(fs.readFileSync('law_data.json', 'utf8'));
        } catch (e) { lawData = []; }
    }

    // Remove old targets
    lawData = lawData.filter(item => !targets.some(t => t.id === item.id));

    for (const target of targets) {
        console.log(`Scraping ${target.title}...`);
        try {
            await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Wait for frames to load
            await new Promise(r => setTimeout(r, 5000));

            let bestContent = '';
            let maxScore = 0;

            // Iterate over all frames
            for (const frame of page.frames()) {
                try {
                    const text = await frame.evaluate(() => document.body.innerText);
                    const html = await frame.evaluate(() => document.body.innerHTML);

                    // Simple heuristic scoring:
                    // 1. Must contain "제1조" (Article 1)
                    // 2. Prefer longer text
                    // 3. Prefer containing "제21조의2" (target content)

                    let score = 0;
                    if (text.includes('제1조')) score += 1000;
                    if (text.includes('목적')) score += 500;
                    if (text.includes('제21조의2')) score += 500;
                    score += text.length; // Length is the tie-breaker

                    // Avoid Table of Contents frames which are usually list-heavy but short content
                    // Check if it has many line breaks relative to length?

                    console.log(`  - Frame: ${frame.name() || frame.url().substring(0, 30)}... | Length: ${text.length} | Score: ${score}`);

                    if (score > maxScore) {
                        maxScore = score;
                        bestContent = text;
                    }
                } catch (e) {
                    // Frame access error
                }
            }

            if (bestContent.length < 500) {
                console.log("  - Warning: Best content is very short. Retrying with basic selector...");
                bestContent = await page.evaluate(() => document.body.innerText);
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
    console.log('Update complete.');
    await browser.close();
})();
