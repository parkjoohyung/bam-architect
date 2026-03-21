const fs = require('fs');
const path = 'd:/park/05.web/js/law.js';
let content = fs.readFileSync(path, 'utf8');

// 1. buildArticleJumpInfo 재정의 (Pretty URL 형식으로 강제 전환)
const startJump = content.indexOf('window.buildArticleJumpInfo =');
const endJump = content.indexOf('window.LAW_METADATA_LIST =');
const newJumpCode = `window.buildArticleJumpInfo = (baseSrc, artNum) => {
    // 1. Get clean base name
    let cleanBase = baseSrc.split('#')[0].split('?')[0];
    let lawName = '';
    
    // Identify law name from URL (Korean characters)
    if (cleanBase.includes('/법령/')) {
        lawName = decodeURIComponent(cleanBase.split('/법령/').pop());
    } else {
        // Fallback: If it's a seq-based URL like lsInfoP.do, we use the original URL logic
        // but for National Laws, we really want the name. Let's try to look it up in window.LAW_METADATA_LIST
        if (window.LAW_METADATA_LIST) {
            const entry = window.LAW_METADATA_LIST.find(l => l.url && l.url.includes(cleanBase));
            if (entry) lawName = entry.title;
        }
    }

    if (!artNum) return { src: cleanBase, hash: '', type: 'base' };
    
    const match = artNum.match(/(?:제)?(\\d+)조(?:의(\\d+))?/);
    if (match) {
        const main = match[1];
        const sub = match[2] ? match[2] : '0';
        
        // Strategy: USE PRETTY URL for reliable scrolling in iframe
        if (lawName) {
            let prettyArt = \`제\${main}조\`;
            if (sub !== '0') prettyArt += \`의\${sub}\`;
            return {
                src: \`https://www.law.go.kr/법령/\${encodeURIComponent(lawName)}/\${encodeURIComponent(prettyArt)}\`,
                hash: '', // Server-side handles it
                type: 'pretty',
                main, sub
            };
        }

        // Catch-all for ordinances or unknown laws
        const joNo = main.padStart(6, '0');
        const joBrNo = sub.padStart(2, '0');
        let jumpSrc = cleanBase + '?' + \`joNo=\${joNo}&joBrNo=\${joBrNo}\`;
        return { src: jumpSrc, hash: \`#J\${main}:\${sub}\`, type: 'lsInfo', main, sub };
    }
    return { src: cleanBase, hash: '' };
};\n\n`;

content = content.substring(0, startJump) + newJumpCode + content.substring(endJump);

// 2. Fix Default Checkbox State (All checked)
// In law.js, we look for where filter-checkboxes are initialized.
// Since we are rewriting the file, I'll ensure the initial search filter state is correct.

// 3. Fix openLaw logic for same-law jump (No Blink)
const startOpenLaw = content.indexOf('window.openLaw = function');
const endOpenLaw = content.indexOf('// Events');

const newOpenLawCode = `window.openLaw = function (lawId, articleNum, element) {
        if (element) {
            document.querySelectorAll('.snippet.active-result').forEach(el => el.classList.remove('active-result'));
            element.classList.add('active-result');
            scrollToResult(lawId, element, 5);
        }

        document.querySelectorAll('.nav-chip.active').forEach(el => el.classList.remove('active'));
        const navChip = document.getElementById(\`nav-chip-\${lawId}\`);
        if (navChip) {
            navChip.classList.add('active');
            navChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        const targetItem = document.getElementById(lawId);
        const wrapper = document.querySelector('.law-container-wrapper');

        const setIframeSrcNoBlink = (iframe, jump) => {
            const currentSrc = iframe.src ? decodeURIComponent(iframe.src) : '';
            const targetUrl = \`\${jump.src}\${jump.hash}\`;
            
            // If it's a different law, or iframe is empty, use about:blank reset
            const isDifferentLaw = !currentSrc.includes(jump.src.split('/').slice(0, 5).join('/')); 

            if (!iframe.src || iframe.src === 'about:blank' || isDifferentLaw) {
                iframe.src = 'about:blank';
                setTimeout(() => { iframe.src = targetUrl; }, 30);
            } else {
                // Same Law Jump: Update src directly (causes refresh but no white blink)
                if (currentSrc !== targetUrl) {
                    iframe.src = targetUrl;
                }
            }
        };

        if (!targetItem) {
            wrapper.classList.add('split-view');
            const openTargetCard = (attempt) => {
                const el = document.getElementById(lawId);
                if (el) {
                    let curr = el;
                    while(curr && curr.classList) {
                        if(curr.classList.contains('accordion-item')) curr.classList.add('expanded');
                        curr = curr.parentElement;
                    }
                    const iframe = el.querySelector('iframe');
                    if (iframe && iframe.dataset.src) {
                        const jump = window.buildArticleJumpInfo(iframe.dataset.src, articleNum);
                        setIframeSrcNoBlink(iframe, jump);
                    }
                    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
                } else if (attempt > 0) {
                    setTimeout(() => openTargetCard(attempt - 1), 150);
                }
            };
            openTargetCard(5);
            return;
        }

        const isAlreadyExpanded = targetItem.classList.contains('expanded');
        if (!isAlreadyExpanded) {
            document.querySelectorAll('.accordion-item.expanded').forEach(other => {
                if (!other.contains(targetItem) && other !== targetItem) other.classList.remove('expanded');
            });
            let current = targetItem;
            while (current && current.classList) {
                if (current.classList.contains('accordion-item')) current.classList.add('expanded');
                current = current.parentElement;
            }
        }

        wrapper.classList.add('split-view');
        setTimeout(() => targetItem.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

        const iframe = targetItem.querySelector('iframe');
        if (iframe && iframe.dataset.src) {
            const jump = window.buildArticleJumpInfo(iframe.dataset.src, articleNum);
            setIframeSrcNoBlink(iframe, jump);
        }
    };\n\n    `;

content = content.substring(0, startOpenLaw) + newOpenLawCode + content.substring(endOpenLaw);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed law.js with PRETTY URL strategy');
