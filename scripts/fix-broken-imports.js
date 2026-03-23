import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.join(process.cwd(), 'src');

const replacements = [
  { from: /@\/shared\/lib\/di\/container/g, to: '@/app/di/container' },
  { from: /@\/shared\/lib\/di\/registry/g, to: '@/app/di/registry' },
  { from: /@\/shared\/api\/voice/g, to: '@/shared/lib/voice' },
  { from: /@\/features\/ai-hub\/voice/g, to: '@/shared/lib/voice' },
  { from: /@\/features\/ai-hub\/VoiceCommandService/g, to: '@/shared/lib/voice/VoiceCommandService' },
  { from: /@\/features\/ai-hub\/api\/VoiceCommandService/g, to: '@/shared/lib/voice/VoiceCommandService' },
  
  // Also any raw string to AiService that missed the cut
  { from: /@\/features\/ai-agents\/api\/aiService/g, to: '@/shared/api/ai/aiService' },
  { from: /@\/features\/ai-agents\/api\/geminiService/g, to: '@/shared/api/ai/geminiService' }
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
console.log('Fixed broken import paths.');
