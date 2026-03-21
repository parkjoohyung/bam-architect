import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:8081/law.html', { waitUntil: 'networkidle0' });

    const ordinances = await page.$$eval('#ordinance_grid_container .accordion-item', els => els.length);
    console.log('Ordinance cards found:', ordinances);

    await browser.close();
})();
