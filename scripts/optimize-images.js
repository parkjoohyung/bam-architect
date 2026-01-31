/**
 * Image Optimizer Script
 * Converts PNG images to WebP format for better compression
 * Run with: node scripts/optimize-images.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.resolve(__dirname, '..', 'src', 'assets');

async function optimizeImages() {
    const files = fs.readdirSync(assetsDir);

    for (const file of files) {
        if (!file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.jpeg')) {
            continue;
        }

        const inputPath = path.join(assetsDir, file);
        const baseName = path.basename(file, path.extname(file));
        const outputPath = path.join(assetsDir, `${baseName}.webp`);

        const originalSize = fs.statSync(inputPath).size;

        try {
            await sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath);

            const newSize = fs.statSync(outputPath).size;
            const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

            console.log(`✅ ${file} → ${baseName}.webp`);
            console.log(`   ${(originalSize / 1024).toFixed(1)} KB → ${(newSize / 1024).toFixed(1)} KB (${savings}% 감소)`);
        } catch (err) {
            console.error(`❌ ${file}: ${err.message}`);
        }
    }

    console.log('\n📦 이미지 최적화 완료! HTML에서 .png를 .webp로 변경하세요.');
}

optimizeImages();
