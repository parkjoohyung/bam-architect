
import fs from 'fs';

try {
    const rawData = fs.readFileSync('law_data.json', 'utf8');
    let lawData = JSON.parse(rawData);
    let totalUpdated = 0;

    lawData = lawData.map(law => {
        if (!law.content) return law;

        let content = law.content;
        let originalLength = content.length;

        // Pattern: Find "제N조" or "제N조의N" that might NOT be at the start of a line.
        // We want to force them to be on a new line.

        // 1. Articles: "제 1 조" or "제1조" or "제1조의2"
        // Insert double newline before
        const newContent = content.replace(/(\s*)(제\d+(?:의\d+)?조)(?=[(\s])/g, '\n\n$2');

        // 2. Chapters: "제 1 장" or "제1장"
        const newContent2 = newContent.replace(/(\s*)(제\d+장)(?=\s)/g, '\n\n$2');

        if (newContent2.length !== originalLength) {
            totalUpdated++;
        }

        return {
            ...law,
            content: newContent2
        };
    });

    fs.writeFileSync('law_data.json', JSON.stringify(lawData, null, 2));
    console.log(`Successfully formatted ${totalUpdated} law documents.`);

} catch (e) {
    console.error("Error processing law data:", e);
}
