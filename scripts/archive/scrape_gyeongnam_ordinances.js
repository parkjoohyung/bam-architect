
import puppeteer from 'puppeteer';
import fs from 'fs';

const ORDINANCE_FILE = 'd:/park/05.web/js/law_data_ordinance.js';

async function scrapeOrdinances() {
    console.log('Reading ordinance data...');
    let fileContent = fs.readFileSync(ORDINANCE_FILE, 'utf8');

    // Extract JSON part
    // Assumes file starts with "window.ordinanceData = " and ends with optional ";"
    const jsonStart = fileContent.indexOf('[');
    const jsonEnd = fileContent.lastIndexOf(']');

    if (jsonStart === -1 || jsonEnd === -1) {
        console.error('Could not parse law_data_ordinance.js');
        return;
    }

    let ordinanceData;
    try {
        const jsonString = fileContent.substring(jsonStart, jsonEnd + 1);
        ordinanceData = JSON.parse(jsonString);
    } catch (e) {
        console.error('JSON parsing failed:', e);
        return;
    }

    // Find Gyeongsangnam-do group
    // Based on previous analysis, it's index 16, or we search by region
    const targetGroup = ordinanceData.find(g => g.region === '경상남도' || g.parent === '경상남도');

    if (!targetGroup) {
        console.error('Gyeongsangnam-do group not found');
        return;
    }

    console.log(`Found Gyeongsangnam-do group. Processing...`);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    let updatedCount = 0;

    // Helper to process a list of ordinances
    const processList = async (list, regionName) => {
        for (let i = 0; i < list.length; i++) {
            const ord = list[i];

            // Criteria: Empty fullText and valid law.go.kr URL
            if ((!ord.fullText || ord.fullText.trim() === '') && ord.url && ord.url.includes('law.go.kr')) {
                console.log(`[${regionName}] Scraping: ${ord.title} (${ord.url})...`);
                try {
                    await page.goto(ord.url, { waitUntil: 'networkidle0', timeout: 30000 });

                    // Wait for content selector
                    try {
                        await page.waitForSelector('#conScroll', { timeout: 5000 });

                        const text = await page.evaluate(() => {
                            const el = document.querySelector('#conScroll');
                            return el ? el.innerText : '';
                        });

                        if (text && text.trim().length > 0) {
                            // Simple cleanup
                            ord.fullText = text.trim();
                            console.log(`  -> Success! (${ord.fullText.length} chars)`);
                            updatedCount++;
                        } else {
                            console.warn(`  -> Element #conScroll found but text is empty.`);
                        }

                    } catch (selErr) {
                        console.error(`  -> #conScroll not found for ${ord.url}`);
                    }

                } catch (err) {
                    console.error(`  -> Failed to load URL: ${err.message}`);
                }

                // Be polite
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    };

    // Iterate through structure (rows -> ordinances)
    if (targetGroup.rows) {
        for (const row of targetGroup.rows) {
            if (row.ordinances) {
                await processList(row.ordinances, row.region || 'Unknown');
            }
        }
    } else if (targetGroup.ordinances) {
        await processList(targetGroup.ordinances, targetGroup.region);
    }

    await browser.close();

    if (updatedCount > 0) {
        console.log(`Saving ${updatedCount} updated ordinances...`);
        // Reconstruct the file content
        const prefix = 'window.ordinanceData = ';
        // Add minimal formatting (indentation: 4 spaces)
        let newFileContent = prefix + JSON.stringify(ordinanceData, null, 4);
        // Add semicolon if original file had one, usually good practice
        newFileContent += ';';

        fs.writeFileSync(ORDINANCE_FILE, newFileContent, 'utf8');
        console.log('File updated successfully.');
    } else {
        console.log('No ordinances updated.');
    }
}

scrapeOrdinances().catch(console.error);
