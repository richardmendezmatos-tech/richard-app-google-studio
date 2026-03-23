import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../src');

// 1. Move directories/files
const moves = [
  ['shared/api/ai-agents', 'entities/ai-agents'],
  ['widgets/inventory/CarCard.tsx', 'entities/inventory/ui/CarCard.tsx'],
  ['widgets/brand-ui/layout/chat/GenUICarCard.tsx', 'shared/brand-ui/layout/chat/GenUICarCard.tsx'],
  ['widgets/brand-ui/layout/vanilla/HyperList.tsx', 'shared/brand-ui/vanilla/HyperList.tsx']
];

moves.forEach(([src, dest]) => {
  const fullSrc = path.join(ROOT_DIR, src);
  const fullDest = path.join(ROOT_DIR, dest);
  if (fs.existsSync(fullSrc)) {
    fs.mkdirSync(path.dirname(fullDest), { recursive: true });
    // If it's a directory, renameSync moves it. If it's a file, it moves the file.
    fs.renameSync(fullSrc, fullDest);
    console.log(`Moved ${src} to ${dest}`);
  }
});

// 2. Global content replacement
const replacements = [
  { from: /@\/shared\/api\/ai-agents/g, to: '@/entities/ai-agents' },
  { from: /@\/widgets\/inventory\/CarCard/g, to: '@/entities/inventory/ui/CarCard' },
  { from: /@\/widgets\/brand-ui\/layout\/chat\/GenUICarCard/g, to: '@/shared/brand-ui/layout/chat/GenUICarCard' },
  { from: /@\/widgets\/brand-ui\/layout\/vanilla\/HyperList/g, to: '@/shared/brand-ui/vanilla/HyperList' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      replacements.forEach(({ from, to }) => {
        if (content.match(from)) {
          content = content.replace(from, to);
          changed = true;
        }
      });
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated imports in ${path.relative(ROOT_DIR, fullPath)}`);
      }
    }
  }
}

processDirectory(ROOT_DIR);
console.log('Cleanup migration complete.');
