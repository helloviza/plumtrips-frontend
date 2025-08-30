// scripts/fix-imports.mjs
import fs from "fs";
import path from "path";

const ROOT_DIR = path.resolve("."); // scan from current working dir (frontend/)

function walk(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules & dist
      if (entry.name === "node_modules" || entry.name === "dist") return;
      walk(fullPath, callback);
    } else if (entry.isFile() && /\.(t|j)sx?$/.test(entry.name)) {
      callback(fullPath);
    }
  });
}

function fixImports(filePath) {
  let code = fs.readFileSync(filePath, "utf8");
  let changed = false;

  // regex for .jpg/.jpeg imports or new URL references
  const regex = /(["'`])([^"'`]+?\.(?:jpg|jpeg))\1/g;

  code = code.replace(regex, (match, quote, relPath) => {
    const webpRelPath = relPath.replace(/\.(jpg|jpeg)$/, ".webp");
    const absPath = path.resolve(path.dirname(filePath), webpRelPath);

    if (fs.existsSync(absPath)) {
      changed = true;
      return `${quote}${webpRelPath}${quote}`;
    }
    return match; // leave unchanged if no .webp exists
  });

  if (changed) {
    console.log(`✔ Fixed imports in ${filePath}`);
    fs.writeFileSync(filePath, code, "utf8");
  }
}

console.log("🔎 Scanning entire frontend/ for .jpg/.jpeg imports...");
walk(ROOT_DIR, fixImports);
console.log("✅ Done! Imports updated where matching .webp was found.");
