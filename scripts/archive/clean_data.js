
const fs = require('fs');

try {
    const raw = fs.readFileSync('law_data.json', 'utf8');
    let data = JSON.parse(raw);

    let modifiedCount = 0;

    data = data.map(law => {
        if (!law.content) return law;

        let text = law.content;

        // Strategy: aggressively split "제N조" if it seems to be part of a TOC or messy line
        // Pattern: "제1조(목적) 제2조(정의)" -> keys are compact
        // We replace "   제N조" with "\n제N조"

        // 1. Un-escape literal \n if they exist as string literals (unlikely but possible in JSON)
        // text = text.replace(/\\n/g, '\n'); 

        // 2. Perform the split
        // Look for "제N조" that is NOT preceded by a newline (ignoring spaces)
        // and IS followed by ( or a space/hangul title.
        // We'll just replace ALL occurrences of "제N조" with "\n\n제N조" to be safe, 
        // essentially forcing a break. This might break "According to 제5조" if it doesn't have a space?
        // Usually references are "제5조에 따라".
        // Headers are "제5조(Title)" or "제5조 ".

        // Let's protect references: References usually don't have parentheses immediately.
        // Headers often do: "제1조(목적)".
        // So: split `제\d+조\(` aggressively.
        let newText = text.replace(/(\s*)(제\d+조\()/g, '\n\n$2');

        // Also split `제\d+조 ` if it looks like a header (harder to distinguish).
        // But for the TOC issue, they almost always have titles in parens like "제1조(목적) 제2조(정의)".

        if (newText !== text) {
            modifiedCount++;
        }

        return {
            ...law,
            content: newText
        };
    });

    fs.writeFileSync('law_data.json', JSON.stringify(data, null, 2));
    console.log(`Updated ${modifiedCount} law items with better line breaks.`);

} catch (e) {
    console.error(e);
}
