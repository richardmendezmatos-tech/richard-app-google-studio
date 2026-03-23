import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../src');

// 1. Move directories/files
const moves = [
  ['features/inventory/ui/VirtualInventory.tsx', 'widgets/inventory/VirtualInventory.tsx'],
  ['features/inventory/ui/storefront/LocalClusterView.tsx', 'widgets/inventory/LocalClusterView.tsx'],
  ['features/inventory/ui/StorefrontResultsGrid.tsx', 'widgets/inventory/StorefrontResultsGrid.tsx'],
  ['shared/api/adapters/inventory', 'entities/inventory/api/adapters/'],
  ['shared/api/repositories/FirestoreInventoryRepository.ts', 'entities/inventory/api/repositories/FirestoreInventoryRepository.ts'],
  ['shared/api/voice', 'shared/lib/voice'],
  ['features/ai-agents', 'shared/api/ai-agents']
];

moves.forEach(([src, dest]) => {
  const fullSrc = path.join(ROOT_DIR, src);
  const fullDest = path.join(ROOT_DIR, dest);
  if (fs.existsSync(fullSrc)) {
    fs.mkdirSync(path.dirname(fullDest), { recursive: true });
    fs.renameSync(fullSrc, fullDest);
    console.log(`Moved ${src} to ${dest}`);
  }
});

// 2. Global content replacement
const replacements = [
  { from: /@\/shared\/api\/adapters\/inventory/g, to: '@/entities/inventory/api/adapters' },
  { from: /@\/shared\/api\/repositories\/FirestoreInventoryRepository/g, to: '@/entities/inventory/api/repositories/FirestoreInventoryRepository' },
  { from: /@\/shared\/api\/voice\/VoiceCommandService/g, to: '@/shared/lib/voice/VoiceCommandService' },
  { from: /@\/features\/ai-agents/g, to: '@/shared/api/ai-agents' },
  { from: /from '\.\/ui\/VirtualInventory'/g, to: "from '@/widgets/inventory/VirtualInventory'" },
  { from: /from '\.\/VirtualInventory'/g, to: "from '@/widgets/inventory/VirtualInventory'" },
  { from: /from '\.\/ui\/storefront\/LocalClusterView'/g, to: "from '@/widgets/inventory/LocalClusterView'" },
  { from: /from '\.\/StorefrontResultsGrid'/g, to: "from '@/widgets/inventory/StorefrontResultsGrid'" },
  { from: /from '\.\/ui\/StorefrontResultsGrid'/g, to: "from '@/widgets/inventory/StorefrontResultsGrid'" }
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
console.log('Migration script complete.');
