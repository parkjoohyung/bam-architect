
import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox']
        });
        console.log('Browser launched!');
        const page = await browser.newPage();
        await page.goto('https://example.com');
        console.log('Page loaded:', await page.title());
        await browser.close();
        console.log('Browser closed.');
    } catch (e) {
        console.error('Puppeteer Error:', e);
    }
})();
