import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();

        page.on('console', msg => console.log('LOG:', msg.text()));
        page.on('pageerror', error => console.log('ERROR:', error.message));

        await page.goto('http://localhost:5173/law.html', { waitUntil: 'networkidle0' });

        const ordCount = await page.evaluate(() => window.ordinanceList ? window.ordinanceList.length : -1);
        const isGridPresent = await page.evaluate(() => !!document.getElementById('ordinance_grid_container'));

        console.log('ordinanceList length:', ordCount);
        console.log('grid present:', isGridPresent);
    } catch (e) { console.error("Could not connect to 5173"); }
    await browser.close();
})();
