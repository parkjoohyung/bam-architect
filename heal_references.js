
import fs from 'fs';

try {
    const rawData = fs.readFileSync('law_data.json', 'utf8');
    let lawData = JSON.parse(rawData);

    // Regex to match "Newlined Article" that looks like a reference
    // Matches: \n+ (Je...Jo) followed by something not ( and not space.
    const badSplitRegex = /\n+(제\d+(?:의\d+)?조)(?=[^(\s])/g;

    let totalFixed = 0;

    lawData = lawData.map(law => {
        if (!law.content) return law;

        let newContent = law.content;

        const matches = newContent.match(badSplitRegex);
        if (matches) {
            console.log(`Fixing ${matches.length} bad splits in ${law.id}...`);
            // Replace with space + Article
            newContent = newContent.replace(badSplitRegex, ' $1');
            totalFixed += matches.length;
        }

        return { ...law, content: newContent };
    });

    fs.writeFileSync('law_data.json', JSON.stringify(lawData, null, 2));
    console.log(`Total fixed: ${totalFixed}`);

} catch (e) {
    console.error(e);
}
