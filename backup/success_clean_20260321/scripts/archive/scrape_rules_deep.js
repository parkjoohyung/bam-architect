
import puppeteer from 'puppeteer';
import fs from 'fs';

const targets = [
    { id: 'buld_mng_rules', title: '건축물관리법 시행규칙', url: 'https://www.law.go.kr/법령/건축물관리법시행규칙' }
];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Load existing
    let lawData = [];
    try {
        lawData = JSON.parse(fs.readFileSync('law_data.json', 'utf8'));
    } catch (e) { }

    lawData = lawData.filter(item => item.id !== 'buld_mng_rules');

    for (const target of targets) {
        console.log(`Deep Scraping ${target.title}...`);
        try {
            await page.goto(target.url, { waitUntil: 'networkidle0', timeout: 60000 });
            await new Promise(r => setTimeout(r, 4000));

            // Iterate frames
            let bestContent = '';
            let maxLength = 0;

            const frames = page.frames();
            for (const frame of frames) {
                try {
                    // Try to scroll the frame to bottom to trigger any load
                    await frame.evaluate(async () => {
                        const scrollable = document.getElementById('conScroll') || document.body;
                        if (scrollable) {
                            scrollable.scrollTop = scrollable.scrollHeight;
                            await new Promise(r => setTimeout(r, 100));
                        }
                    });

                    await new Promise(r => setTimeout(r, 1000));

                    // Get text
                    const text = await frame.evaluate(() => document.body.innerText);

                    // Optimization: check if this is the "Real" content
                    if (text.includes('제1조') && text.length > maxLength) {
                        maxLength = text.length;
                        bestContent = text;
                    }
                } catch (e) { }
            }

            console.log(`  - Got Content Length: ${bestContent.length}`);

            if (bestContent.length < 20000) {
                console.log("  - Warning: Content seems short. Is Article 12 missing?");
                // Check missing articles speculatively
                if (!bestContent.includes('제12조')) {
                    console.log("  - Article 12 NOT found!");
                } else {
                    console.log("  - Article 12 FOUND.");
                }
            }

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
            console.error(e);
        }
    }

    fs.writeFileSync('law_data.json', JSON.stringify(lawData, null, 2));
    console.log('Done.');
    await browser.close();
})();
