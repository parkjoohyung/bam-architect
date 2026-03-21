import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();

        // We will test if ordinScP.do exists and can take a query
        const res = await page.goto('https://www.law.go.kr/LSW//ordinScP.do?ordinSeq=2038367&chrClsCd=010202&gubun=ELIS', { waitUntil: 'networkidle2' });

        // Also check ordinInfoP.do if there is any other param like target=
        await page.goto('https://www.law.go.kr/LSW//ordinInfoP.do?ordinSeq=2038367&chrClsCd=010202&gubun=ELIS&jomunTitle=12', { waitUntil: 'networkidle2' });
        const scrollPos1 = await page.evaluate(() => window.scrollY);

        console.log({
            ordinScP_Status: res.status(),
            jomunTitleScroll: scrollPos1
        });

    } catch (e) { console.error(e); }
    await browser.close();
})();
