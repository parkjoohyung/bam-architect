
import puppeteer from 'puppeteer';
import fs from 'fs';

// === Law Targets Definition ===
// === Law Targets Definition (Loaded from laws_list.json) ===
let targets = [];
try {
    targets = JSON.parse(fs.readFileSync('public/laws_list.json', 'utf8'));
    console.log(`Loaded ${targets.length} law targets from laws_list.json`);
} catch (e) {
    console.error('Failed to load laws_list.json:', e);
    process.exit(1);
}

// === Puppeteer Scraping Logic ===
(async () => {
    console.log('Starting Law Data Update...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // For safer execution environments
    });

    // Create law_data.json backup
    if (fs.existsSync('law_data.json')) {
        fs.copyFileSync('law_data.json', 'law_data.bak.json');
        console.log('Backed up law_data.json to law_data.bak.json');
    }

    let existingData = [];
    try {
        if (fs.existsSync('law_data.json')) {
            existingData = JSON.parse(fs.readFileSync('law_data.json', 'utf8'));
        }
    } catch (e) {
        console.error('Error reading existing data:', e);
    }

    // New data store
    const newData = [];
    const failedTargets = [];

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    for (const target of targets) {
        console.log(`[${targets.indexOf(target) + 1}/${targets.length}] Scraping: ${target.title}...`);

        try {
            await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Intelligent wait: frames or specific element
            try {
                await page.waitForFunction(() => {
                    const frames = window.frames;
                    return frames.length > 0 || document.querySelector('#conScroll');
                }, { timeout: 10000 });
            } catch (e) { /* Ignore timeout, try extraction anyway */ }

            // Artificial delay for frames to fully settle
            await new Promise(r => setTimeout(r, 3000));

            let bestContent = '';
            let maxScore = 0;

            // Strategy 1: Target #conScroll (Common for direct access)
            try {
                const conScroll = await page.$('#conScroll');
                if (conScroll) {
                    const text = await page.evaluate(el => el.innerText, conScroll);
                    if (text.length > 500) {
                        bestContent = text;
                        maxScore = 5000; // High confidence
                        console.log(`  - Found #conScroll content (Length: ${text.length})`);
                    }
                }
            } catch (e) { }

            // Strategy 2: Frame Traversal (If Strategy 1 failed or we want to double check)
            if (maxScore < 1000) {
                for (const frame of page.frames()) {
                    try {
                        const text = await frame.evaluate(() => document.body.innerText);

                        let score = 0;
                        if (text.includes('제1조')) score += 1000;
                        if (text.includes('목적')) score += 500;
                        score += text.length; // Tie-breaker

                        // Heuristic: Avoid Table of Contents or menu frames
                        if (text.length < 200) score = 0;
                        if (text.includes('새창') || text.includes('인쇄')) score -= 500;

                        if (score > maxScore) {
                            maxScore = score;
                            bestContent = text;
                        }
                    } catch (e) { /* Access denied or empty frame */ }
                }
                if (bestContent) console.log(`  - Selected best frame content (Length: ${bestContent.length})`);
            }

            // Strategy 3: Main Body fallback
            if (bestContent.length < 500) {
                const bodyText = await page.evaluate(() => document.body.innerText);
                if (bodyText.length > bestContent.length) {
                    bestContent = bodyText;
                    console.log(`  - Fallback to body content (Length: ${bestContent.length})`);
                }
            }

            // Validation
            if (bestContent.length < 100) {
                throw new Error('Content too short, possibly failed to load.');
            }

            // Post-processing (Formatting)
            // Add newlines before Article headers for better readability
            bestContent = bestContent.replace(/(\s*)(제\d+(?:의\d+)?조[\(\u4e00-\u9fa5\s])/g, '\n\n$2');
            bestContent = bestContent.replace(/(\s*)(제\d+장\s)/g, '\n\n$2');

            // Success: Push to new data
            newData.push({
                id: target.id,
                title: target.title,
                content: bestContent,
                updatedAt: new Date().toISOString()
            });

        } catch (e) {
            console.error(`  X Failed to scrape ${target.title}: ${e.message}`);

            // On fail, try to preserve existing data for this ID
            const prev = existingData.find(d => d.id === target.id);
            if (prev) {
                console.log(`  - Preserving existing data for ${target.title}`);
                newData.push(prev);
            } else {
                failedTargets.push(target.title);
            }
        }
    }

    await browser.close();

    // Final merge: If there are IDs in existingData that were NOT in our target list, keep them?
    // User requested "update", implying we should refresh our specific list. 
    // If the user manually added other laws not in our list, we should probably keep them.
    const newIds = new Set(newData.map(d => d.id));
    for (const oldItem of existingData) {
        if (!newIds.has(oldItem.id)) {
            // Keep old items that were not targeted for update (safety)
            newData.push(oldItem);
        }
    }

    // Save
    fs.writeFileSync('law_data.json', JSON.stringify(newData, null, 2));

    console.log('====================================');
    console.log(`Update Complete.`);
    console.log(`Total Laws: ${newData.length}`);
    console.log(`Successfully Updated: ${targets.length - failedTargets.length}`);
    if (failedTargets.length > 0) {
        console.log(`Failed (Preserved old or Skipped): ${failedTargets.join(', ')}`);
    }
    console.log('====================================');

})();
