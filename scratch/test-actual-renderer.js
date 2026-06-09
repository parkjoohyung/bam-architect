import fs from 'fs';
import { marked } from 'marked';

// Mock window and other global environments
global.window = {
    marked: marked
};
global.document = {
    getElementById: () => ({ addEventListener: () => {}, remove: () => {} }),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ style: {}, appendChild: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    addEventListener: () => {}
};
global.localStorage = {
    getItem: () => null,
    setItem: () => null
};
global.location = {
    search: '',
    pathname: ''
};

// Read quartz-features.js and extract window.renderMarkdown
const quartzFeaturesCode = fs.readFileSync('public/js/quartz-features.js', 'utf8');

// We can just evaluate window.renderMarkdown by executing the relevant function block or defining window.renderMarkdown ourselves from the code
// Let's create a minimal evaluation environment
const evalCode = `
const window = global.window;
${quartzFeaturesCode}
`;

try {
    eval(evalCode);
    console.log('Successfully loaded quartz-features.js into node!');
} catch (err) {
    console.error('Error evaluating quartz-features.js:', err);
    process.exit(1);
}

// Read the post
const postContent = fs.readFileSync('public/posts/web_blog/용도변경/용도변경·기재사항변경.md', 'utf8');

try {
    // We can run the preprocessCallouts and check its output
    const cleanText = postContent.replace(/^\uFEFF/, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/^---[\s\S]*?---\n?/, '')
        .split('\n')
        .filter(line => !line.match(/^\s*\w+::/))
        .join('\n');

    console.log('=== cleanText lines around iframe ===');
    const cleanLines = cleanText.split('\n');
    const iframeIdx = cleanLines.findIndex(l => l.includes('<iframe'));
    if (iframeIdx !== -1) {
        for (let j = iframeIdx - 3; j <= iframeIdx + 5; j++) {
            console.log(`${j}: ${JSON.stringify(cleanLines[j])}`);
        }
    }
    console.log('=====================================');
    // We can trace the call to preprocessCallouts
    // Let's modify quartz-features.js rendering flow or just inspect it here
    let calloutsData = [];
    const originalRenderMarkdown = global.window.renderMarkdown;
    
    // Let's print the actual input to marked.parse by hacking global.window.marked.parse
    const originalMarkedParse = global.window.marked.parse;
    
    // We can evaluate preprocessCallouts with console.log in global context
    const originalPreprocess = global.window.renderMarkdown;
    // We can intercept preprocessCallouts inside quartz-features.js by redefining it or rewriting the global function.
    // Actually, let's just write a test function in test-actual-renderer.js that replicates preprocessCallouts with logging
    // and run it on cleanText.
    function debugPreprocessCallouts(markdown) {
        const lines = markdown.split('\n');
        let inCallout = false;
        let calloutLines = [];
        let calloutType = '';
        let calloutTitle = '';
        let calloutFold = '';
        const result = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^\s*>\s*\[\!(\w+)([-+])?\]\s*(.*)/);
            
            if (line.includes('<iframe') || i > 40) {
                console.log(`Line ${i}: ${JSON.stringify(line)} | inCallout: ${inCallout} | match: ${!!match}`);
            }

            if (match) {
                if (inCallout) {
                    result.push(`[CALLOUT: ${calloutType}]`);
                    calloutLines = [];
                }
                inCallout = true;
                calloutType = match[1].toLowerCase();
                calloutFold = match[2] || '';
                calloutTitle = match[3].trim() || calloutType;
            } else if (inCallout) {
                const hasGreater = line.match(/^\s*>\s?(.*)/);
                const isBlank = line.trim() === '';
                const isHeader = line.trim().startsWith('#');

                if (hasGreater) {
                    calloutLines.push(hasGreater[1]);
                } else if (!isBlank && !isHeader) {
                    calloutLines.push(line.trim());
                } else {
                    result.push(`[CALLOUT: ${calloutType}]`);
                    inCallout = false;
                    calloutLines = [];
                    result.push(line);
                }
            } else {
                result.push(line);
            }
        }
        return result.join('\n');
    }
    
    const html = global.window.renderMarkdown(cleanText, 'web_blog/용도변경/용도변경·기재사항변경.md');
    console.log('--- Render Output ---');
    console.log(html);
    console.log('--- End of Render Output ---');
} catch (err) {
    console.error('Error during renderMarkdown:', err);
}
