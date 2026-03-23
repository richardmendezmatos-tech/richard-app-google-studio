import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../src');

const HUB = path.join(ROOT_DIR, 'features/ai-hub');
const SHARED_API_AI = path.join(ROOT_DIR, 'shared/api/ai');
const SHARED_LIB_VOICE = path.join(ROOT_DIR, 'shared/lib/voice');

fs.mkdirSync(SHARED_API_AI, { recursive: true });
fs.mkdirSync(SHARED_LIB_VOICE, { recursive: true });

// 1. Move files to shared
const toSharedApi = ['aiService.ts', 'geminiService.ts', 'localAiService.ts', 'togetherAiService.ts', 'togetherAiService.ts'];
const toSharedLib = ['VoiceCommandService.ts'];

toSharedApi.forEach(f => {
  // Check in HUB or HUB/api
  let s = path.join(HUB, f);
  if (!fs.existsSync(s)) s = path.join(HUB, 'api', f);
  if (fs.existsSync(s)) {
    fs.renameSync(s, path.join(SHARED_API_AI, f));
  }
});

toSharedLib.forEach(f => {
  let s = path.join(HUB, f);
  if (!fs.existsSync(s)) s = path.join(HUB, 'api', f);
  if (fs.existsSync(s)) {
    fs.renameSync(s, path.join(SHARED_LIB_VOICE, f));
  }
});

// 2. Global replacements
const replacements = [
  { from: /@\/features\/ai-hub\/api\/aiService/g, to: '@/shared/api/ai/aiService' },
  { from: /@\/features\/ai-hub\/api\/geminiService/g, to: '@/shared/api/ai/geminiService' },
  { from: /@\/features\/ai-hub\/api\/localAiService/g, to: '@/shared/api/ai/localAiService' },
  { from: /@\/features\/ai-hub\/api\/togetherAiService/g, to: '@/shared/api/ai/togetherAiService' },
  { from: /@\/features\/ai-hub\/VoiceCommandService/g, to: '@/shared/lib/voice/VoiceCommandService' },
  { from: /@\/features\/ai-hub\/api\/VoiceCommandService/g, to: '@/shared/lib/voice/VoiceCommandService' },
  // Cleanup generic imports to ai-hub if it was the whole feature
  { from: /import { aiService } from '@\/features\/ai-hub/g, to: "import { aiService } from '@/shared/api/ai/aiService" }
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
console.log('Shared extraction complete.');
