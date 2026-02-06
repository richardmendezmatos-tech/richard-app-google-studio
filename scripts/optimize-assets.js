
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.resolve(__dirname, '../public');
const OUTPUT_DIR = path.resolve(__dirname, '../public/optimized');

const SIZES = {
    thumbnail: 320,
    mobile: 768,
    desktop: 1280
};

const FORMATS = ['webp', 'avif'];

async function ensureDir(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function optimizeImage(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const stats = await fs.stat(filePath);

    // Skip if it's already an optimized one or not an image
    if (filePath.includes('optimized') || !/\.(jpg|jpeg|png|webp|avif)$/i.test(filePath)) {
        return;
    }

    console.log(`🚀 Optimizing: ${fileName}...`);

    for (const [sizeName, width] of Object.entries(SIZES)) {
        for (const format of FORMATS) {
            try {
                const outputFileName = `${fileName}-${sizeName}.${format}`;
                const outputPath = path.join(OUTPUT_DIR, outputFileName);

                await sharp(filePath)
                    .resize({ width, withoutEnlargement: true })
                    .toFormat(format, { quality: 80 })
                    .toFile(outputPath);

                const outStats = await fs.stat(outputPath);
                const savings = ((1 - outStats.size / stats.size) * 100).toFixed(1);
                console.log(`   ✅ ${sizeName} (${format}): ${savings}% savings`);
            } catch (err) {
                console.error(`   ❌ Failed ${sizeName} (${format}): ${err.message}`);
            }
        }
    }
}

async function main() {
    await ensureDir(OUTPUT_DIR);
    const files = await fs.readdir(INPUT_DIR);

    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));

    console.log(`🔍 Found ${imageFiles.length} images in public/`);

    for (const file of imageFiles) {
        await optimizeImage(path.join(INPUT_DIR, file));
    }

    console.log('\n✨ Optimization complete!');
}

main().catch(console.error);
