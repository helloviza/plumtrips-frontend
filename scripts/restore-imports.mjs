import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");

function walk(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(fullPath)) {
      callback(fullPath);
    }
  });
}

function fixImports(filePath) {
  let code = fs.readFileSync(filePath, "utf8");
  let changed = false;

  // Replace .webp imports with .jpg if the .jpg exists
  const regex = /(["'`])([^"'`]+?\.webp)\1/g;
  code = code.replace(regex, (match, quote, relPath) => {
    const absPath = path.resolve(path.dirname(filePath), relPath);
    const jpgPath = absPath.replace(/\.webp$/, ".jpg");
    if (fs.existsSync(jpgPath)) {
      changed = true;
      return `${quote}${relPath.replace(/\.webp$/, ".jpg")}${quote}`;
    }
    return match;
  });

  if (changed) {
    console.log(`✔ Fixed imports in ${filePath}`);
    fs.writeFileSync(filePath, code, "utf8");
  }
}

console.log("🔎 Scanning for .webp imports...");
walk(SRC_DIR, fixImports);
console.log("✅ Done! Imports updated where .jpg exists.");
