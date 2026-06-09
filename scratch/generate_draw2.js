import fs from 'fs';
import lz from 'lz-string';

const elements = [];
let elementCounter = 0;

function generateId() {
    return 'el-' + elementCounter++;
}

// Data definitions
const data = [
    { parent: "경관지구", children: ["자연경관지구", "시가지경관지구", "특화경관지구"], law: "시행령 제72조" },
    { parent: "고도지구", children: [], law: "시행령 제74조" },
    { parent: "방화지구", children: [], law: "시행령 제74조" },
    { parent: "방재지구", children: ["시가지방재지구", "자연방재지구"], law: "시행령 제75조" },
    { parent: "보호지구", children: ["역사문화환경보호지구", "중요시설물보호지구", "생태계보호지구"], law: "시행령 제76조" },
    { parent: "취락지구", children: ["자연취락지구", "집단취락지구"], law: "시행령 제78조 및 [별표 23]" },
    { parent: "개발진흥지구", children: ["주거개발진흥지구", "산업·유통개발진흥지구", "관광·휴양개발진흥지구", "복합개발진흥지구", "특정개발진흥지구"], law: "시행령 제79조" },
    { parent: "특정용도제한지구", children: [], law: "시행령 제80조" },
    { parent: "복합용도지구", children: [], law: "시행령 제81조" }
];

function getLawLink(lawText) {
    const match = lawText.match(/제(\d+)조/);
    if (match) {
        return `https://www.law.go.kr/법령/국토의계획및이용에관한법률시행령/제${match[1]}조`;
    }
    return null;
}

const startX = 50;
let currentY = 80;

// Header row
const headerY = 30;
const col1X = startX;
const col2X = startX + 180;
const col3X = startX + 460;

function addTableHeader(x, y, w, h, text, isHeader = true, linkUrl = null) {
    const boxId = generateId();
    const textId = generateId();
    elements.push({
        id: boxId,
        type: "rectangle",
        x: x,
        y: y,
        width: w,
        height: h,
        strokeColor: "#1e1e1e",
        backgroundColor: isHeader ? "rgba(132, 165, 157, 0.25)" : "transparent",
        fillStyle: "solid",
        strokeWidth: 2,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        roundness: null, // Corner roundness set to null (sharp box corners) as requested
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
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        text: text,
        fontSize: 14,
        fontFamily: 6,
        textAlign: "center",
        verticalAlign: "middle",
        isDeleted: false,
        containerId: boxId,
        seed: Math.floor(Math.random() * 50000),
        originalText: text,
        autoResize: false,
        lineHeight: 1.2,
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

// Write headers (Header 3 changed to "국토계획법 시행령")
addTableHeader(col1X, headerY, 170, 40, "용도지구 대분류");
addTableHeader(col2X, headerY, 270, 40, "세부 용도지구");
addTableHeader(col3X, headerY, 280, 40, "국토계획법 시행령", true, "https://www.law.go.kr/법령/국토의계획및이용에관한법률시행령");

data.forEach((row) => {
    const rowHeight = Math.max(45, row.children.length * 35);
    
    // Left: Parent category
    const parentBoxId = generateId();
    const parentTextId = generateId();
    elements.push({
        id: parentBoxId,
        type: "rectangle",
        x: col1X,
        y: currentY,
        width: 170,
        height: rowHeight,
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1.5,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        roundness: { type: 3 },
        isDeleted: false,
        seed: Math.floor(Math.random() * 50000),
        version: 1,
        versionNonce: Math.floor(Math.random() * 50000),
        index: "a",
        groupIds: [],
        frameId: null,
        boundElements: [{ type: "text", id: parentTextId }],
        updated: Date.now(),
        link: null,
        hasTextLink: false,
        locked: false
    });
    elements.push({
        id: parentTextId,
        type: "text",
        x: col1X + 10,
        y: currentY + (rowHeight - 20) / 2,
        width: 150,
        height: 20,
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        text: row.parent,
        fontSize: 14,
        fontFamily: 6,
        textAlign: "center",
        verticalAlign: "middle",
        isDeleted: false,
        containerId: parentBoxId,
        seed: Math.floor(Math.random() * 50000),
        originalText: row.parent,
        autoResize: false,
        lineHeight: 1.2,
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
        rawText: row.parent,
        link: null
    });

    // Middle: Children (sub-districts)
    const childBoxId = generateId();
    const childTextId = generateId();
    const childTextContent = row.children.length > 0 ? row.children.map(c => `• ${c}`).join("\n") : "- (단일 지구)";
    elements.push({
        id: childBoxId,
        type: "rectangle",
        x: col2X,
        y: currentY,
        width: 270,
        height: rowHeight,
        strokeColor: "#1e1e1e",
        backgroundColor: "rgba(0, 0, 0, 0.01)",
        fillStyle: "solid",
        strokeWidth: 1.5,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        roundness: { type: 3 },
        isDeleted: false,
        seed: Math.floor(Math.random() * 50000),
        version: 1,
        versionNonce: Math.floor(Math.random() * 50000),
        index: "a",
        groupIds: [],
        frameId: null,
        boundElements: [{ type: "text", id: childTextId }],
        updated: Date.now(),
        link: null,
        hasTextLink: false,
        locked: false
    });
    elements.push({
        id: childTextId,
        type: "text",
        x: col2X + 15,
        y: currentY + (rowHeight - (row.children.length || 1) * 24) / 2,
        width: 240,
        height: rowHeight - 20,
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        text: childTextContent,
        fontSize: 13,
        fontFamily: 6,
        textAlign: "left",
        verticalAlign: "middle",
        isDeleted: false,
        containerId: childBoxId,
        seed: Math.floor(Math.random() * 50000),
        originalText: childTextContent,
        autoResize: false,
        lineHeight: 1.35,
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
        rawText: childTextContent,
        link: null
    });

    // Right: Law reference with link
    const lawBoxId = generateId();
    const lawTextId = generateId();
    const linkUrl = getLawLink(row.law);
    
    elements.push({
        id: lawBoxId,
        type: "rectangle",
        x: col3X,
        y: currentY,
        width: 280,
        height: rowHeight,
        strokeColor: "#1e1e1e",
        backgroundColor: "rgba(132, 165, 157, 0.05)",
        fillStyle: "solid",
        strokeWidth: 1.5,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        roundness: { type: 3 },
        isDeleted: false,
        seed: Math.floor(Math.random() * 50000),
        version: 1,
        versionNonce: Math.floor(Math.random() * 50000),
        index: "a",
        groupIds: [],
        frameId: null,
        boundElements: [{ type: "text", id: lawTextId }],
        updated: Date.now(),
        link: linkUrl,
        hasTextLink: false,
        locked: false
    });
    elements.push({
        id: lawTextId,
        type: "text",
        x: col3X + 15,
        y: currentY + (rowHeight - 20) / 2,
        width: 250,
        height: 20,
        strokeColor: "#1e1e1e",
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1,
        strokeStyle: "solid",
        roughness: 0,
        opacity: 100,
        angle: 0,
        text: row.law,
        fontSize: 13,
        fontFamily: 6,
        textAlign: "center",
        verticalAlign: "middle",
        isDeleted: false,
        containerId: lawBoxId,
        seed: Math.floor(Math.random() * 50000),
        originalText: row.law,
        autoResize: false,
        lineHeight: 1.2,
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
        rawText: row.law,
        link: linkUrl
    });

    currentY += rowHeight + 10;
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
    currentItemFontSize: 14,
    currentItemTextAlign: "center",
    scrollX: 100,
    scrollY: 100,
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

fs.writeFileSync('public/posts/web_blog/용도변경/data/draw2.excalidraw.md', fileTemplate, 'utf8');
console.log('Successfully generated draw2.excalidraw.md with law links!');
