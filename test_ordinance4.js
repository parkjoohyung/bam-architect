import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto('http://localhost:5173/law.html', { waitUntil: 'networkidle0' });

        // Check children of grid container
        const result = await page.evaluate(() => {
            const grid = document.getElementById('ordinance_grid_container');
            if (!grid) return 'No grid';

            // Count top-level items (Regions)
            const items = grid.querySelectorAll(':scope > .accordion-item');

            // Also get their displayed style to see if they are hidden
            const visibilityInfo = Array.from(items).map(item => {
                const style = window.getComputedStyle(item);
                return {
                    id: item.id,
                    title: item.querySelector('h2, .accordion-title')?.textContent?.trim() || 'No Title',
                    display: style.display,
                    visibility: style.visibility,
                    className: item.className
                };
            });

            return {
                count: items.length,
                items: visibilityInfo
            };
        });

        console.log(JSON.stringify(result, null, 2));
    } catch (e) { console.error(e); }
    await browser.close();
})();
