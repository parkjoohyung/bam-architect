import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    console.log('Navigating to http://localhost:5173/law.html...');
    await page.goto('http://localhost:5173/law.html', { waitUntil: 'load' });

    await page.waitForTimeout(2000);

    // Evaluate showToast directly
    console.log('Evaluating showToast...');
    await page.evaluate(() => {
        if (typeof window.showToast === 'function') {
            window.showToast('Test Message from Playwright');
        } else {
            console.error('showToast is NOT defined on window!');
        }
    });

    await page.waitForTimeout(1000);

    // Check if toast is in DOM
    const toastHtml = await page.evaluate(() => {
        const t = document.getElementById('law-toast-message');
        return t ? t.outerHTML : 'Toast not found in DOM';
    });
    console.log('Toast DOM:', toastHtml);

    // Now try full interaction
    await page.fill('#lawSearchInput', '높이');
    await page.click('.region-chip:has-text("서울특별시 주차장설치및관리조례")');
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
        // Find article 25 and click it
        const snippets = Array.from(document.querySelectorAll('.snippet-text'));
        const art25 = snippets.find(s => s.textContent.includes('제25조'));
        if (art25) {
            art25.click();
        } else {
            console.error('Article 25 not found');
        }
    });

    await page.waitForTimeout(1000);

    // Click it again to trigger the already-loaded branch
    await page.evaluate(() => {
        const snippets = Array.from(document.querySelectorAll('.snippet-text'));
        const art25 = snippets.find(s => s.textContent.includes('제25조'));
        if (art25) art25.click();
    });

    await page.waitForTimeout(1000);

    const toastHtml2 = await page.evaluate(() => {
        const t = document.getElementById('law-toast-message');
        return t ? t.outerHTML : 'Toast not found in DOM after click';
    });
    console.log('Toast DOM after click:', toastHtml2);

    await browser.close();
})();
