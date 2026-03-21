import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();

        // Attempt 1: anchor tag load (doesn't scroll natively sometimes)
        await page.goto('https://www.law.go.kr/LSW//ordinInfoP.do?ordinSeq=2038367&chrClsCd=010202&gubun=ELIS#J12:0', { waitUntil: 'networkidle2' });

        const scrollPos1 = await page.evaluate(() => window.scrollY);

        // Attempt 2: Add lsiSeq or other params they use in lsInfoP?
        await page.goto('https://www.law.go.kr/LSW//ordinInfoP.do?ordinSeq=2038367&chrClsCd=010202&gubun=ELIS&jomunNo=12', { waitUntil: 'networkidle2' });
        const scrollPos2 = await page.evaluate(() => window.scrollY);

        // Attempt 3: Try focus parameter
        await page.goto('https://www.law.go.kr/LSW//ordinInfoP.do?ordinSeq=2038367&chrClsCd=010202&gubun=ELIS&focus=J12:0', { waitUntil: 'networkidle2' });
        const scrollPos3 = await page.evaluate(() => window.scrollY);

        // Attempt 4: See if JavaScript scroll Into view works if we trigger it externally (maybe the page itself has a function)
        const scrollFnExists = await page.evaluate(() => typeof window.moveNode === 'function' || typeof window.fn_showJomun === 'function');

        console.log({
            anchorScroll: scrollPos1,
            jomunNoScroll: scrollPos2,
            focusScroll: scrollPos3,
            scrollFnExists
        });

    } catch (e) { console.error(e); }
    await browser.close();
})();
