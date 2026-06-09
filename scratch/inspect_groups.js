import fs from 'fs';
import lz from 'lz-string';

const data = JSON.parse(fs.readFileSync('scratch/base_excalidraw.json', 'utf8'));

// 그룹별 요소 확인
const groups = new Map();
data.elements.forEach(el => {
    const g = (el.groupIds && el.groupIds[0]) || '__none__';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(el);
});

groups.forEach((els, gid) => {
    const rects = els.filter(e => e.type === 'rectangle');
    const texts = els.filter(e => e.type === 'text');
    if (rects.length > 0) {
        const r = rects[0];
        const t = texts[0];
        console.log(`Group: ${gid}`);
        console.log(`  rect bg: ${r.backgroundColor}, stroke: ${r.strokeColor}`);
        if (t) console.log(`  text color: ${t.strokeColor}, fontSize: ${t.fontSize}`);
        console.log(`  elements: rect×${rects.length} text×${texts.length}`);
    }
});
