import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDirs = ['src/pages', 'src/widgets', 'src/shared', 'src/features'];
let totalModified = 0;

function processDirectory(directory) {
  const absolutePath = path.resolve(__dirname, '..', directory);
  if (!fs.existsSync(absolutePath)) return;

  const entries = fs.readdirSync(absolutePath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) {
      processDirectory(path.relative(path.resolve(__dirname, '..'), fullPath));
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx'))) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that don't have <img
  if (!content.includes('<img')) return;

  // Regex to match <img ... /> tags that DO NOT ALREADY HAVE loading="..."
  const imgRegex = /<img\s+(?![^>]*\bloading=)[^>]*>/g;

  if (imgRegex.test(content)) {
    console.log(`Analyzing: ${filePath.split('/src/')[1]}`);
    
    // Inject loading="lazy" decoding="async" right after <img 
    const modifiedContent = content.replace(imgRegex, (match) => {
      // Very strict heuristic to not inject twice or affect styling
      return match.replace('<img ', '<img loading="lazy" decoding="async" ');
    });

    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      totalModified++;
      console.log(`✅ Patched: ${filePath.split('/src/')[1]}`);
    }
  }
}

console.log('--- Empezando migración Lazy Loading LCP ---');
targetDirs.forEach((dir) => processDirectory(dir));
console.log(`\n\nTotal de Archivos Optimizados: ${totalModified}`);
