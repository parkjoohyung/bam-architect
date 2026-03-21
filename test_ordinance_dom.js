import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();

        // Go directly to an ordinance page
        await page.goto('https://www.law.go.kr/LSW//ordinInfoP.do?ordinSeq=2038367&chrClsCd=010202&gubun=ELIS', { waitUntil: 'networkidle2' });

        // Check if there are IDs we can scroll to like 'J12' or '제12조'
        const articleInfo = await page.evaluate(() => {
            const els = Array.from(document.querySelectorAll('*[id^="J"], a[name^="J"], .conScroll [id]'));

            // Also look for text containing "제12"
            const allTextNodes = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('제12조')) {
                    allTextNodes.push({ text: node.textContent.trim(), parentTag: node.parentElement.tagName });
                }
            }

            return {
                ids: els.map(e => e.id || e.name).slice(0, 5),
                textMatches: allTextNodes.slice(0, 5)
            };
        });

        console.log(JSON.stringify(articleInfo, null, 2));

    } catch (e) { console.error(e); }
    await browser.close();
})();
