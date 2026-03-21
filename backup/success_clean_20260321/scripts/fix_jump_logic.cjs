const fs = require('fs');
const path = 'd:/park/05.web/js/law.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace buildArticleJumpInfo
const startJump = content.indexOf('window.buildArticleJumpInfo =');
const endJump = content.indexOf('window.LAW_METADATA_LIST =');
const newJumpCode = `window.buildArticleJumpInfo = (baseSrc, artNum) => {
    let cleanBase = baseSrc.split('#')[0].split('?')[0];
    let isNationalLaw = cleanBase.includes('/법령/') || cleanBase.includes('lsInfoP.do');
    let lawName = '';
    if (cleanBase.includes('/법령/')) {
        const parts = cleanBase.split('/법령/');
        lawName = decodeURIComponent(parts[parts.length - 1]);
    }

    if (!artNum) return { src: cleanBase, hash: '', type: 'base' };
    const match = artNum.match(/(?:제)?(\\d+)조(?:의(\\d+))?/);
    if (!match) return { src: cleanBase, hash: '', type: 'base' };
    
    const main = match[1];
    const sub = match[2] ? match[2] : '0';
    const joNo = main.padStart(6, '0');
    const joBrNo = sub.padStart(2, '0');

    if (isNationalLaw && lawName) {
        let prettyArticle = \`제\${main}조\`;
        if (sub !== '0') prettyArticle += \`의\${sub}\`;
        return {
            src: \`https://www.law.go.kr/법령/\${encodeURIComponent(lawName)}/\${encodeURIComponent(prettyArticle)}\`,
            hash: '', type: 'pretty', main, sub
        };
    }
    let params = baseSrc.split('?')[1] || '';
    if (params) {
        params = params.split('&').filter(p => !p.startsWith('joNo=') && !p.startsWith('joBrNo=') && !p.startsWith('_t=')).join('&');
    }
    let jumpSrc = cleanBase + '?' + (params ? params + '&' : '') + \`joNo=\${joNo}&joBrNo=\${joBrNo}\`;
    return { src: jumpSrc, hash: \`#J\${main}:\${sub}\`, type: 'lsInfo', main, sub };
};\n\n`;

content = content.substring(0, startJump) + newJumpCode + content.substring(endJump);

// 2. Ensure openLaw has the smart reload logic
// (Wait, I already updated part of openLaw with multi_replace, but let's make it consistent)

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed law.js buildArticleJumpInfo effectively');
