import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Testing ordinInfoP.do with &joNo=0025...');
    await page.goto('https://www.law.go.kr/LSW//ordinInfoP.do?ordinSeq=2070413&chrClsCd=010202&gubun=ELIS&joNo=0025', { waitUntil: 'load' });

    await page.waitForTimeout(3000);

    const scrollY = await page.evaluate(() => window.scrollY || document.documentElement.scrollTop);
    console.log('Scroll Y top level:', scrollY);

    // Check if there is an internal scrolling div
    const internalScroll = await page.evaluate(() => {
        const divs = Array.from(document.querySelectorAll('div'));
        const scrollingDiv = divs.find(d => d.scrollHeight > d.clientHeight && d.scrollTop > 0);
        return scrollingDiv ? `Found scrolling div: ${scrollingDiv.className}, scrollTop: ${scrollingDiv.scrollTop}` : 'No scrolling div with scrollTop > 0';
    });
    console.log(internalScroll);

    await browser.close();
})();
