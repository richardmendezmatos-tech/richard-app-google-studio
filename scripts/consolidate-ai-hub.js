import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../src');

// 1. Move everything to features/ai-hub
const consolidate = [
  'entities/ai-agents',
  'features/ai',
  'features/ai-orchestration',
  'features/voice-command'
];

const HUB = path.join(ROOT_DIR, 'features/ai-hub');
fs.mkdirSync(HUB, { recursive: true });

consolidate.forEach(c => {
  const fullSrc = path.join(ROOT_DIR, c);
  if (fs.existsSync(fullSrc)) {
    // We will copy contents to avoid complex nested renames if directories exist
    const files = fs.readdirSync(fullSrc);
    files.forEach(file => {
      const s = path.join(fullSrc, file);
      const d = path.join(HUB, file);
      if (fs.existsSync(d)) {
         // If collision, move to a subfolder
         const sub = path.join(HUB, path.basename(c));
         fs.mkdirSync(sub, { recursive: true });
         fs.renameSync(s, path.join(sub, file));
      } else {
        fs.renameSync(s, d);
      }
    });
    // Remove old empty dir
    try { fs.rmdirSync(fullSrc, { recursive: true }); } catch(e) {}
  }
});

// 2. Global replacements to @/features/ai-hub
const replacements = [
  { from: /@\/(entities|features)\/(ai-agents|ai|ai-orchestration|voice-command)/g, to: '@/features/ai-hub' },
  { from: /@\/shared\/lib\/voice\/VoiceCommandService/g, to: '@/features/ai-hub/VoiceCommandService' }
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
      if (changed) fs.writeFileSync(fullPath, content);
    }
  }
}

processDirectory(ROOT_DIR);
console.log('Hub consolidation complete.');
