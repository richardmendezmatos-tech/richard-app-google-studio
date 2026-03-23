import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  fs.writeFileSync(filePath, content);
}

// 1. VoiceWidget
replaceInFile('src/widgets/ai-chat/VoiceWidget.tsx', [
  { from: /import \{ VoiceCommandService \} from '@\/shared\/lib\/voice\/VoiceCommandService';/g, to: "import { VoiceCommandService } from '@/features/ai-hub/voice-command/api/VoiceCommandService';" }
]);

// 2. useVoiceSession
replaceInFile('src/features/ai-hub/ai/hooks/useVoiceSession.ts', [
  { from: /import \{ VoiceCommandService \} from '@\/shared\/lib\/voice\/VoiceCommandService';/g, to: "import { VoiceCommandService } from '@/features/ai-hub/voice-command/api/VoiceCommandService';" }
]);

// 3. aiService
replaceInFile('src/shared/api/ai/aiService.ts', [
  { from: /import \{ CommandIntent \} from '@\/shared\/lib\/voice\/VoiceCommandService';/g, to: "import { CommandIntent } from '@/shared/types/types';" }
]);

// 4. Extract CommandIntent and put in types.ts
const typesFile = 'src/shared/types/types.ts';
let typesContent = fs.readFileSync(typesFile, 'utf8');
if (!typesContent.includes('export interface CommandIntent')) {
  // Add it
  fs.appendFileSync(typesFile, `\n\nexport interface CommandIntent {
  action: {
    type: 'NAVIGATE' | 'SEARCH' | 'UPDATE_FILTER';
    payload: any;
  };
  confidence: number;
  originalText: string;
}\n`);
}

// 5. Update VoiceCommandService.ts to remove its type definition and import it
replaceInFile('src/features/ai-hub/voice-command/api/VoiceCommandService.ts', [
  { from: /export interface CommandIntent {[\s\S]*?originalText: string;\n}/, to: "import { CommandIntent } from '@/shared/types/types';" }
]);

console.log('Final surgical type extraction complete.');
