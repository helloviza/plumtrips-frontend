// scripts/optimize-images.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT_DIR = path.resolve("./"); // whole frontend
const SIZE_LIMIT = 500 * 1024; // 500 KB

async function optimizeImage(filePath) {
  const { size } = fs.statSync(filePath);
  if (size < SIZE_LIMIT) return; // skip small files

  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  const outputPath = base + ".webp";

  console.log(`Optimizing ${path.relative(ROOT_DIR, filePath)} (${(size / 1024 / 1024).toFixed(2)} MB)`);

  try {
    await sharp(filePath)
      .resize({ width: 1920, withoutEnlargement: true }) // max width for hero images
      .webp({ quality: 70 })
      .toFile(outputPath);

    const { size: newSize } = fs.statSync(outputPath);
    console.log(`✅ Saved: ${path.relative(ROOT_DIR, outputPath)} → ${(newSize / 1024).toFixed(1)} KB`);

    // delete old heavy file
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("❌ Error optimizing", filePath, err);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (/\.(jpe?g|png)$/i.test(entry)) {
      optimizeImage(fullPath);
    }
  }
}

console.log("🔍 Scanning frontend for images > 500KB...");
walk(ROOT_DIR);
console.log("✨ Optimization complete.");
