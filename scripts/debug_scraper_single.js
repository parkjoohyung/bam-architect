
import puppeteer from 'puppeteer';

(async () => {
    const url = 'https://www.law.go.kr/LSW//ordinInfoP.do?ordinSeq=2099911&chrClsCd=010202&gubun=';
    console.log(`Debugging URL: ${url}`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();

    // Set User Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('Page loaded.');

        // Screenshot
        await page.screenshot({ path: 'debug_scrape.png', fullPage: true });
        console.log('Screenshot saved to debug_scrape.png');

        // Check content
        const content = await page.evaluate(() => {
            const el = document.getElementById('conScroll');
            return {
                exists: !!el,
                length: el ? el.innerText.length : 0,
                textSnippet: el ? el.innerText.substring(0, 100) : null,
                bodySnippet: document.body.innerText.substring(0, 200)
            };
        });
        console.log('Content check:', content);

    } catch (e) {
        console.error('Error:', e);
    }

    await browser.close();
})();
