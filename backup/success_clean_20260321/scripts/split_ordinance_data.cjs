const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../js/law_data_ordinance.js');
const outputListFile = path.join(__dirname, '../js/ordinance_list.js');
const outputContentFile = path.join(__dirname, '../data/ordinance_content.json');

// Ensure data dir exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

try {
    console.log('Reading input file...');
    let rawContent = fs.readFileSync(inputFile, 'utf8');

    // Strip "window.ordinanceData =" and any trailing semicolon to parse as JSON
    // Note: The file might have comments or be JS object literal (keys not quoted?). 
    // Based on previous view_file, keys ARE quoted.
    // It starts with "window.ordinanceData = ["

    // Find the start of the array
    const startIdx = rawContent.indexOf('[');
    if (startIdx === -1) throw new Error('Could not find start of array');

    // Find the end - assume it ends with "];" or "]"
    let endIdx = rawContent.lastIndexOf(']');
    if (endIdx === -1) throw new Error('Could not find end of array');

    const jsonString = rawContent.substring(startIdx, endIdx + 1);

    console.log('Parsing data...');
    const ordinanceData = JSON.parse(jsonString);
    console.log(`Loaded ${ordinanceData.length} top-level regions.`);

    const ordinanceList = [];
    const ordinanceContent = {}; // Map URL -> FullText

    let totalOrdinances = 0;
    let totalTextLength = 0;

    // Recursive function to process structure
    function processLevel(source, targetList) {
        if (Array.isArray(source)) {
            source.forEach(item => {
                const newItem = { ...item };

                // Remove fullText from list item if present (it shouldn't be at group level usually, but just in case)
                delete newItem.fullText;

                // Process 'rows' (Cities)
                if (item.rows && Array.isArray(item.rows)) {
                    newItem.rows = [];
                    processLevel(item.rows, newItem.rows);
                }

                // Process 'ordinances' (The actual laws)
                if (item.ordinances && Array.isArray(item.ordinances)) {
                    newItem.ordinances = [];
                    item.ordinances.forEach(ord => {
                        totalOrdinances++;

                        // Extract Content
                        if (ord.fullText) {
                            // Normalize URL or use Title + Region as key if URL missing? 
                            // Law urls usually unique.
                            if (ord.url) {
                                ordinanceContent[ord.url] = ord.fullText;
                                totalTextLength += ord.fullText.length;
                            } else {
                                console.warn('Ordinance ID/URL missing for content', ord.title);
                            }
                        }

                        // Add to list (stripped)
                        const listOrd = { ...ord };
                        delete listOrd.fullText;
                        newItem.ordinances.push(listOrd);
                    });
                }

                targetList.push(newItem);
            });
        }
    }

    processLevel(ordinanceData, ordinanceList);

    console.log(`Processed ${totalOrdinances} ordinances.`);
    console.log(`Total Text Length: ${totalTextLength} chars`);

    // Save List (JS Format)
    const listJsContent = `window.ordinanceList = ${JSON.stringify(ordinanceList, null, 2)};`;
    fs.writeFileSync(outputListFile, listJsContent, 'utf8');
    console.log(`Saved List to ${outputListFile} (${(listJsContent.length / 1024 / 1024).toFixed(2)} MB)`);

    // Save Content (JSON Format)
    // Structure: Array of { url: "...", fullText: "..." } to match easy lookup or Map?
    // Using Object/Map by URL is faster O(1) matching if we have URL.
    // But search iterates ALL. Array is fine.
    // Let's save as Array to be similar to law_data.json structure if possible, 
    // OR just a map.
    // The requirement is to run search. Search needs to iterate all text.
    // Helper function in implementation plan said: "When ord.fullText exists... check it"
    // So we need to link back.
    // If we use a Map { "url": "text" }, we can just iterate the keys/values.

    // However, to match the "split" logic: 
    // The search iterates the LIST. If list item has no text, it skips?
    // Current logic: `lawData.forEach(...)`.
    // If we split, we have `ordinanceList` (UI) and `ordinanceContent` (Text).
    // The search loop should probably iterate `ordinanceList` then look up text?
    // OR iterate `ordinanceContent` which contains { url, title(!), fullText }.
    // If `ordinanceContent` only has URL -> Text, we lose Title context unless we look up back to List.
    // Better: `ordinanceContent` should be self-contained for search if we want speed.
    // { url, title, fullText, region? }

    // Let's make `ordinanceContent` a list of objects that have everything needed for search.
    // { url, title, fullText, metadata... }
    // This allows searching `ordinance_content.json` independently.
    // BUT this duplicates 'title' and 'url'. That's fine for ~40MB file.

    const contentArray = [];

    // Helper to extract flattened search data
    function extractSearchData(source) {
        if (Array.isArray(source)) {
            source.forEach(item => {
                if (item.rows) extractSearchData(item.rows);
                if (item.ordinances) {
                    item.ordinances.forEach(ord => {
                        if (ord.fullText) {
                            contentArray.push({
                                url: ord.url,
                                title: ord.title,
                                fullText: ord.fullText,
                                // Add hierarchy info for better results?
                                // parent: item.region || item.parent
                            });
                        }
                    });
                }
            });
        }
    }
    extractSearchData(ordinanceData);

    fs.writeFileSync(outputContentFile, JSON.stringify(contentArray, null, 2), 'utf8');
    console.log(`Saved Content to ${outputContentFile} (${(fs.statSync(outputContentFile).size / 1024 / 1024).toFixed(2)} MB)`);

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
