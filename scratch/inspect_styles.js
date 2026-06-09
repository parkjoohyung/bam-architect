import fs from 'fs';
import lz from 'lz-string';

const data = JSON.parse(fs.readFileSync('scratch/base_excalidraw.json', 'utf8'));

// 모든 rectangle 요소의 색상 추출
const rects = data.elements.filter(el => el.type === 'rectangle');
const styleSet = new Map();

rects.forEach(r => {
    const key = `bg:${r.backgroundColor} | stroke:${r.strokeColor} | w:${r.strokeWidth}`;
    if (!styleSet.has(key)) styleSet.set(key, { count: 0, example: r.id });
    styleSet.get(key).count++;
});

console.log("=== Rectangle Styles ===");
styleSet.forEach((val, key) => {
    console.log(`  [${val.count}개] ${key}`);
});

// 텍스트 폰트/색상
const texts = data.elements.filter(el => el.type === 'text');
const textSet = new Map();
texts.forEach(t => {
    const key = `font:${t.fontSize} | color:${t.strokeColor} | family:${t.fontFamily}`;
    if (!textSet.has(key)) textSet.set(key, 0);
    textSet.set(key, textSet.get(key) + 1);
});

console.log("\n=== Text Styles ===");
textSet.forEach((count, key) => {
    console.log(`  [${count}개] ${key}`);
});
