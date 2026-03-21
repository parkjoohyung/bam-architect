import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));

    await page.goto('http://localhost:8081/law.html', { waitUntil: 'networkidle0' });

    const ordCount = await page.evaluate(() => window.ordinanceList ? window.ordinanceList.length : -1);
    const isGridPresent = await page.evaluate(() => !!document.getElementById('ordinance_grid_container'));

    console.log('ordinanceList length:', ordCount);
    console.log('grid present:', isGridPresent);

    await browser.close();
})();
