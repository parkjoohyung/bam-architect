import fs from 'fs';
import lz from 'lz-string';

const elements = [];
let elementCounter = 0;

function generateId() {
    return 'el-' + elementCounter++;
}

// 4-column layout settings with a tiny gap between columns
const colWidths = [120, 110, 190, 260];
const colGap = 8; // Tiny gap (8px) between columns
const colXs = [
    50,
    50 + colWidths[0] + colGap,
    50 + colWidths[0] + colGap + colWidths[1] + colGap,
    50 + colWidths[0] + colGap + colWidths[1] + colGap + colWidths[2] + colGap
];
const startY = 80;
let currentY = startY;

function getBylawLink(lawText) {
    const match = lawText.match(/별표\s*(\d+)/);
    if (match) {
        const num = match[1].padStart(4, '0');
        return `https://www.law.go.kr/LSW/lsBylInfoPLinkR.do?lsiSeq=267115&lsNm=국토의계획및이용에관한법률시행령&bylNo=${num}`;
    }
    return null;
}

function addCell(x, y, w, h, text, isHeader = false, isLaw = false, linkUrl = null) {
    const boxId = generateId();
    const textId = generateId();
    
    // Background colors
    let bgColor = "transparent";
    if (isHeader) {
        bgColor = "rgba(132, 165, 157, 0.25)";
    } else if (isLaw) {
        bgColor = "rgba(132, 165, 157, 0.05)";
    }

    elements.push({
        id: boxId,
        type: "rectangle",
        x: x,
        y: y,
        width: w,
        height: h,
        strokeColor: "#1e1e1e",
        backgroundColor: bgColor,
        fillStyle: "solid",
        strokeWidth: 1.5,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        roundness: null, // Sharp rectangle corners
        isDeleted: false,
        seed: Math.floor(Math.random() * 50000),
        version: 1,
        versionNonce: Math.floor(Math.random() * 50000),
        index: "a",
        groupIds: [],
        frameId: null,
        boundElements: [{ type: "text", id: textId }],
        updated: Date.now(),
        link: linkUrl,
        hasTextLink: false,
        locked: false
    });

    elements.push({
        id: textId,
        type: "text",
        x: x + 10,
        y: y + (h - 20) / 2,
        width: w - 20,
        height: 20,
        strokeColor: "#1e1e1e", // Black text
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        text: text,
        fontSize: 12,
        fontFamily: 6,
        textAlign: isHeader || isLaw || w < 150 ? "center" : "left",
        verticalAlign: "middle",
        isDeleted: false,
        containerId: boxId,
        seed: Math.floor(Math.random() * 50000),
        originalText: text,
        autoResize: false,
        lineHeight: 1.25,
        version: 1,
        versionNonce: Math.floor(Math.random() * 50000),
        index: "b",
        groupIds: [],
        frameId: null,
        roundness: null,
        boundElements: [],
        updated: Date.now(),
        hasTextLink: false,
        locked: false,
        rawText: text,
        link: linkUrl
    });
}

// Table Headers
const headerHeight = 40;
addCell(colXs[0], 30, colWidths[0], headerHeight, "용도지역 대분류", true);
addCell(colXs[1], 30, colWidths[1], headerHeight, "중분류", true);
addCell(colXs[2], 30, colWidths[2], headerHeight, "용도지역 (소분류)", true);
addCell(colXs[3], 30, colWidths[3], headerHeight, "국계법 시행령", true, false, "https://www.law.go.kr/법령/국토의계획및이용에관한법률시행령");

// Rows definition with just '[별표 X]' for the law column
const rows = [
    // 도시지역 - 주거지역
    { parent1: "도시지역", parent2: "주거지역", name: "제1종 전용주거지역", law: "[별표 2]" },
    { parent1: "도시지역", parent2: "주거지역", name: "제2종 전용주거지역", law: "[별표 3]" },
    { parent1: "도시지역", parent2: "주거지역", name: "제1종 일반주거지역", law: "[별표 4]" },
    { parent1: "도시지역", parent2: "주거지역", name: "제2종 일반주거지역", law: "[별표 5]" },
    { parent1: "도시지역", parent2: "주거지역", name: "제3종 일반주거지역", law: "[별표 6]" },
    { parent1: "도시지역", parent2: "주거지역", name: "준주거지역", law: "[별표 7]" },
    // 도시지역 - 상업지역
    { parent1: "도시지역", parent2: "상업지역", name: "중심상업지역", law: "[별표 8]" },
    { parent1: "도시지역", parent2: "상업지역", name: "일반상업지역", law: "[별표 9]" },
    { parent1: "도시지역", parent2: "상업지역", name: "근린상업지역", law: "[별표 10]" },
    { parent1: "도시지역", parent2: "상업지역", name: "유통상업지역", law: "[별표 11]" },
    // 도시지역 - 공업지역
    { parent1: "도시지역", parent2: "공업지역", name: "전용공업지역", law: "[별표 12]" },
    { parent1: "도시지역", parent2: "공업지역", name: "일반공업지역", law: "[별표 13]" },
    { parent1: "도시지역", parent2: "공업지역", name: "준공업지역", law: "[별표 14]" },
    // 도시지역 - 녹지지역
    { parent1: "도시지역", parent2: "녹지지역", name: "보전녹지지역", law: "[별표 15]" },
    { parent1: "도시지역", parent2: "녹지지역", name: "생산녹지지역", law: "[별표 16]" },
    { parent1: "도시지역", parent2: "녹지지역", name: "자연녹지지역", law: "[별표 17]" },
    // 관리지역
    { parent1: "관리지역", parent2: "관리지역", name: "보전관리지역", law: "[별표 18]" },
    { parent1: "관리지역", parent2: "관리지역", name: "생산관리지역", law: "[별표 19]" },
    { parent1: "관리지역", parent2: "관리지역", name: "계획관리지역", law: "[별표 20]" },
    // 농림지역
    { parent1: "농림지역", parent2: "농림지역", name: "농림지역", law: "[별표 21]" },
    // 자연환경보전지역
    { parent1: "자연환경보전지역", parent2: "자연환경보전지역", name: "자연환경보전지역", law: "[별표 22]" }
];

const cellHeight = 35;

// Let's draw cells
rows.forEach((row, i) => {
    // 1. Parent 1 spanning
    if (row.parent1 === "도시지역" && i === 0) {
        addCell(colXs[0], currentY, colWidths[0], cellHeight * 16, "도시지역");
    } else if (row.parent1 === "관리지역" && i === 16) {
        addCell(colXs[0], currentY, colWidths[0], cellHeight * 3, "관리지역");
    } else if (row.parent1 === "농림지역" && i === 19) {
        addCell(colXs[0], currentY, colWidths[0], cellHeight * 1, "농림지역");
    } else if (row.parent1 === "자연환경보전지역" && i === 20) {
        addCell(colXs[0], currentY, colWidths[0], cellHeight * 1, "자연환경보전지역");
    }

    // 2. Parent 2 spanning
    if (row.parent2 === "주거지역" && i === 0) {
        addCell(colXs[1], currentY, colWidths[1], cellHeight * 6, "주거지역");
    } else if (row.parent2 === "상업지역" && i === 6) {
        addCell(colXs[1], currentY, colWidths[1], cellHeight * 4, "상업지역");
    } else if (row.parent2 === "공업지역" && i === 10) {
        addCell(colXs[1], currentY, colWidths[1], cellHeight * 3, "공업지역");
    } else if (row.parent2 === "녹지지역" && i === 13) {
        addCell(colXs[1], currentY, colWidths[1], cellHeight * 3, "녹지지역");
    } else if (row.parent2 === "관리지역" && i === 16) {
        addCell(colXs[1], currentY, colWidths[1], cellHeight * 3, "관리지역");
    } else if (row.parent2 === "농림지역" && i === 19) {
        addCell(colXs[1], currentY, colWidths[1], cellHeight * 1, "농림지역");
    } else if (row.parent2 === "자연환경보전지역" && i === 20) {
        addCell(colXs[1], currentY, colWidths[1], cellHeight * 1, "자연환경보전지역");
    }

    // 3. Name cell (Col 3) and Law cell (Col 4) with link
    const linkUrl = getBylawLink(row.law);
    addCell(colXs[2], currentY, colWidths[2], cellHeight, row.name);
    addCell(colXs[3], currentY, colWidths[3], cellHeight, row.law, false, true, linkUrl);

    currentY += cellHeight;
});

const appState = {
    theme: "light",
    viewBackgroundColor: "#ffffff",
    currentItemStrokeColor: "#1e1e1e",
    currentItemBackgroundColor: "transparent",
    currentItemFillStyle: "solid",
    currentItemStrokeWidth: 2,
    currentItemStrokeStyle: "solid",
    currentItemRoughness: 0,
    currentItemOpacity: 100,
    currentItemFontFamily: 6,
    currentItemFontSize: 12,
    currentItemTextAlign: "center",
    scrollX: 50,
    scrollY: 50,
    zoom: { value: 0.95 },
    currentItemRoundness: "round",
    gridSize: 20,
    gridStep: 5,
    gridModeEnabled: false,
    objectsSnapModeEnabled: false
};

const excalidrawJson = {
    type: "excalidraw",
    version: 2,
    source: "https://github.com/zsviczian/obsidian-excalidraw-plugin/releases/tag/2.23.10",
    elements: elements,
    appState: appState,
    files: {}
};

const jsonString = JSON.stringify(excalidrawJson);
const compressed = lz.compressToBase64(jsonString);

const fileTemplate = `---

excalidraw-plugin: parsed
tags: [excalidraw]

---
==⚠  Switch to EXCALIDRAW VIEW in the MORE OPTIONS menu of this document. ⚠== You can decompress Drawing data with the command palette: 'Decompress current Excalidraw file'. For more info check in plugin settings under 'Saving'


## Drawing
\`\`\`compressed-json
${compressed}
\`\`\`
%%`;

fs.writeFileSync('public/posts/web_blog/용도변경/data/draw4.excalidraw.md', fileTemplate, 'utf8');
console.log('Successfully generated draw4.excalidraw.md with links!');
