const fs = require('fs');
const path = 'd:/park/05.web/js/law.js';
let content = fs.readFileSync(path, 'utf8');

// 1. buildArticleJumpInfo 재정의 (Pretty URL 형식으로 강제 전환)
const startJump = content.indexOf('window.buildArticleJumpInfo =');
const endJump = content.indexOf('window.LAW_METADATA_LIST =');
const newJumpCode = `window.buildArticleJumpInfo = (baseSrc, artNum) => {
    let cleanBase = baseSrc.split('#')[0].split('?')[0];
    let lawName = '';
    
    if (cleanBase.includes('/법령/')) {
        const parts = cleanBase.split('/법령/');
        lawName = decodeURIComponent(parts[parts.length - 1].split('/')[0]);
    } else if (window.LAW_METADATA_LIST) {
        const entry = window.LAW_METADATA_LIST.find(l => l.url && l.url.includes(cleanBase));
        if (entry) lawName = entry.title;
    }

    if (!artNum) return { src: cleanBase, hash: '', type: 'base' };
    
    const match = artNum.match(/(?:제)?(\\d+)조(?:의(\\d+))?/);
    if (match) {
        const main = match[1];
        const sub = match[2] ? match[2] : '0';
        
        if (lawName) {
            let prettyArt = \`제\${main}조\`;
            if (sub !== '0') prettyArt += \`의\${sub}\`;
            return {
                src: \`https://www.law.go.kr/법령/\${encodeURIComponent(lawName)}/\${encodeURIComponent(prettyArt)}\`,
                hash: '',
                type: 'pretty',
                main, sub
            };
        }
        const joNo = main.padStart(6, '0');
        const joBrNo = sub.padStart(2, '0');
        let jumpSrc = cleanBase + '?' + \`joNo=\${joNo}&joBrNo=\${joBrNo}\`;
        return { src: jumpSrc, hash: \`#J\${main}:\${sub}\`, type: 'lsInfo', main, sub };
    }
    return { src: cleanBase, hash: '' };
};\n\n`;

content = content.substring(0, startJump) + newJumpCode + content.substring(endJump);

// 2. initFilterEvents 호출 위치 추가 (DOMContentLoaded 내부)
const domLoadedMarker = 'document.addEventListener(\'DOMContentLoaded\', () => {';
const initCallIdx = content.indexOf(domLoadedMarker) + domLoadedMarker.length;
const initCalls = `
    // Initialize Search Filters
    initFilterEvents();
    updateSelectAllState();
`;

// Only add if not already there
if (!content.includes('initFilterEvents();')) {
    content = content.substring(0, initCallIdx) + initCalls + content.substring(initCallIdx);
}

// 3. openLaw logic check/update
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

    const setIframeSrcSafe = (iframe, jump) => {
        const currentSrc = iframe.src ? decodeURIComponent(iframe.src) : '';
        const targetUrl = \`\${jump.src}\${jump.hash}\`;
        
        const isDifferentLaw = !currentSrc.includes(jump.src.split('/').slice(0, 5).join('/')); 

        if (!iframe.src || iframe.src === 'about:blank' || isDifferentLaw) {
            iframe.src = 'about:blank';
            setTimeout(() => { iframe.src = targetUrl; }, 30);
        } else {
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
                    setIframeSrcSafe(iframe, jump);
                }
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
            } else if (attempt > 0) {
                setTimeout(() => openTargetCard(attempt - 1), 150);
            }
        };
        openTargetCard(5);
        return;
    }

    // Expand Parents
    let current = targetItem;
    while (current && current.classList) {
        if (current.classList.contains('accordion-item')) {
            current.classList.add('expanded');
            const c = current.querySelector(':scope > .accordion-content');
            if (c) {
                c.style.setProperty('display', 'flex', 'important');
                c.style.setProperty('height', '100%', 'important');
            }
        }
        current = current.parentElement;
    }

    wrapper.classList.add('split-view');
    setTimeout(() => targetItem.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const iframe = targetItem.querySelector('iframe');
    if (iframe && iframe.dataset.src) {
        const jump = window.buildArticleJumpInfo(iframe.dataset.src, articleNum);
        setIframeSrcSafe(iframe, jump);
    }
};\n\n`;

content = content.substring(0, startOpenLaw) + newOpenLawCode + content.substring(endOpenLaw);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed law.js: Filters Activated + Pretty URL Jump Applied');
