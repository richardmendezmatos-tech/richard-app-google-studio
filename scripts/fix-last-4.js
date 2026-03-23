import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../src');

const moves = [
  ['entities/ai-agents/api/orchestrationService.ts', 'features/ai-orchestration/api/orchestrationService.ts'],
  ['shared/lib/voice', 'features/voice-command/api']
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

const replacements = [
  { from: /@\/entities\/ai-agents\/api\/orchestrationService/g, to: '@/features/ai-orchestration/api/orchestrationService' },
  { from: /@\/shared\/lib\/voice\/VoiceCommandService/g, to: '@/features/voice-command/api/VoiceCommandService' },
  { from: /export \* from '\.\/api\/orchestrationService';\n/g, to: '' }
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
      }
    }
  }
}

processDirectory(ROOT_DIR);
console.log('Script finish');
