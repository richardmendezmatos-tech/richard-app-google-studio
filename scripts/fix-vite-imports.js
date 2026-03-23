import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.join(process.cwd(), 'src');

const replacements = [
  { from: /@\/features\/ai-hub-orchestration/g, to: '@/features/ai-hub/ai-orchestration' },
  { from: /@\/features\/ai-hub\/api\/orchestrationService/g, to: '@/features/ai-hub/ai-orchestration/api/orchestrationService' },
  { from: /@\/features\/ai-hub\/api\/VoiceCommandService/g, to: '@/shared/lib/voice/VoiceCommandService' },
  { from: /@\/features\/ai-hub\/voice-command\/api\/VoiceCommandService/g, to: '@/shared/lib/voice/VoiceCommandService' },
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
console.log('Fixed Vite build broken imports.');
