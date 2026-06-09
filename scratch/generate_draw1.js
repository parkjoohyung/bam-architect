import fs from 'fs';
import lz from 'lz-string';

const elements = [];
let elementCounter = 0;

function generateId() {
    return 'el-' + elementCounter++;
}

const columnWidth = 280;
const columnHeight = 450;
const gap = 30;
const startX = 50;
const startY = 50;

// Column 1: 용도지역
const box1Id = generateId();
const text1Id = generateId();
const box1 = {
    id: box1Id,
    type: "rectangle",
    x: startX,
    y: startY,
    width: columnWidth,
    height: columnHeight,
    strokeColor: "#ebebec",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    roundness: { type: 3 },
    isDeleted: false,
    seed: 10001,
    version: 2,
    versionNonce: 20001,
    index: "a0",
    groupIds: [],
    frameId: null,
    boundElements: [{ type: "text", id: text1Id }],
    updated: Date.now(),
    link: null,
    hasTextLink: false,
    locked: false
};

const text1 = {
    id: text1Id,
    type: "text",
    x: startX + 20,
    y: startY + 20,
    width: columnWidth - 40,
    height: columnHeight - 40,
    strokeColor: "#ebebec",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    text: "[용도지역]\n\n• 도시지역\n\n• 관리지역\n\n• 농림지역\n\n• 자연환경보전지역",
    fontSize: 15,
    fontFamily: 6,
    textAlign: "left",
    verticalAlign: "top",
    isDeleted: false,
    containerId: box1Id,
    seed: 10002,
    originalText: "[용도지역]\n\n• 도시지역\n\n• 관리지역\n\n• 농림지역\n\n• 자연환경보전지역",
    autoResize: false,
    lineHeight: 1.3,
    version: 2,
    versionNonce: 20002,
    index: "a1",
    groupIds: [],
    frameId: null,
    roundness: null,
    boundElements: [],
    updated: Date.now(),
    hasTextLink: false,
    locked: false,
    rawText: "[용도지역]\n\n• 도시지역\n\n• 관리지역\n\n• 농림지역\n\n• 자연환경보전지역",
    link: null
};

// Column 2: 용도지구 (with light background highlight)
const box2Id = generateId();
const text2Id = generateId();
const box2 = {
    id: box2Id,
    type: "rectangle",
    x: startX + columnWidth + gap,
    y: startY,
    width: columnWidth,
    height: columnHeight,
    strokeColor: "#ebebec",
    backgroundColor: "rgba(132, 165, 157, 0.12)",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    roundness: { type: 3 },
    isDeleted: false,
    seed: 10003,
    version: 2,
    versionNonce: 20003,
    index: "a2",
    groupIds: [],
    frameId: null,
    boundElements: [{ type: "text", id: text2Id }],
    updated: Date.now(),
    link: null,
    hasTextLink: false,
    locked: false
};

const text2 = {
    id: text2Id,
    type: "text",
    x: startX + columnWidth + gap + 20,
    y: startY + 20,
    width: columnWidth - 40,
    height: columnHeight - 40,
    strokeColor: "#ebebec",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    text: "[용도지구]\n* 용도지역 보완\n\n• 경관지구\n• 고도지구\n• 방화지구\n• 방재지구\n• 보호지구\n• 취락지구\n• 개발진흥지구\n• 특정용도제한지구\n• 복합용도지구",
    fontSize: 14,
    fontFamily: 6,
    textAlign: "left",
    verticalAlign: "top",
    isDeleted: false,
    containerId: box2Id,
    seed: 10004,
    originalText: "[용도지구]\n* 용도지역 보완\n\n• 경관지구\n• 고도지구\n• 방화지구\n• 방재지구\n• 보호지구\n• 취락지구\n• 개발진흥지구\n• 특정용도제한지구\n• 복합용도지구",
    autoResize: false,
    lineHeight: 1.25,
    version: 2,
    versionNonce: 20004,
    index: "a3",
    groupIds: [],
    frameId: null,
    roundness: null,
    boundElements: [],
    updated: Date.now(),
    hasTextLink: false,
    locked: false,
    rawText: "[용도지구]\n* 용도지역 보완\n\n• 경관지구\n• 고도지구\n• 방화지구\n• 방재지구\n• 보호지구\n• 취락지구\n• 개발진흥지구\n• 특정용도제한지구\n• 복합용도지구",
    link: null
};

// Column 3: 용도구역
const box3Id = generateId();
const text3Id = generateId();
const box3 = {
    id: box3Id,
    type: "rectangle",
    x: startX + (columnWidth + gap) * 2,
    y: startY,
    width: columnWidth,
    height: columnHeight,
    strokeColor: "#ebebec",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    roundness: { type: 3 },
    isDeleted: false,
    seed: 10005,
    version: 2,
    versionNonce: 20005,
    index: "a4",
    groupIds: [],
    frameId: null,
    boundElements: [{ type: "text", id: text3Id }],
    updated: Date.now(),
    link: null,
    hasTextLink: false,
    locked: false
};

const text3 = {
    id: text3Id,
    type: "text",
    x: startX + (columnWidth + gap) * 2 + 20,
    y: startY + 20,
    width: columnWidth - 40,
    height: columnHeight - 40,
    strokeColor: "#ebebec",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    angle: 0,
    text: "[용도구역]\n* 용도지역·용도지구 보완\n\n• 개발제한구역\n• 도시자연공원구역\n• 시가화조정구역\n• 수산자원보호구역\n• 입지규제최소구역",
    fontSize: 14,
    fontFamily: 6,
    textAlign: "left",
    verticalAlign: "top",
    isDeleted: false,
    containerId: box3Id,
    seed: 10006,
    originalText: "[용도구역]\n* 용도지역·용도지구 보완\n\n• 개발제한구역\n• 도시자연공원구역\n• 시가화조정구역\n• 수산자원보호구역\n• 입지규제최소구역",
    autoResize: false,
    lineHeight: 1.3,
    version: 2,
    versionNonce: 20006,
    index: "a5",
    groupIds: [],
    frameId: null,
    roundness: null,
    boundElements: [],
    updated: Date.now(),
    hasTextLink: false,
    locked: false,
    rawText: "[용도구역]\n* 용도지역·용도지구 보완\n\n• 개발제한구역\n• 도시자연공원구역\n• 시가화조정구역\n• 수산자원보호구역\n• 입지규제최소구역",
    link: null
};

elements.push(box1, text1, box2, text2, box3, text3);

const appState = {
    theme: "dark",
    viewBackgroundColor: "#161618",
    currentItemStrokeColor: "#ebebec",
    currentItemBackgroundColor: "transparent",
    currentItemFillStyle: "solid",
    currentItemStrokeWidth: 2,
    currentItemStrokeStyle: "solid",
    currentItemRoughness: 0,
    currentItemOpacity: 100,
    currentItemFontFamily: 6,
    currentItemFontSize: 15,
    currentItemTextAlign: "left",
    currentItemStartArrowhead: null,
    currentItemEndArrowhead: "arrow",
    currentItemArrowType: "round",
    currentItemFrameRole: null,
    scrollX: 100,
    scrollY: 100,
    zoom: { value: 1.0 },
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

fs.writeFileSync('public/posts/web_blog/용도변경/data/draw1.excalidraw.md', fileTemplate, 'utf8');
console.log('Successfully generated draw1.excalidraw.md in 3-column table format!');
