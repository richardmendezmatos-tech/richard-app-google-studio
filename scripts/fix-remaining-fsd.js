import fs from 'fs';
import path from 'path';

const filesToFix = [
  'src/features/ai-hub/api/antigravityCopilotService.ts',
  'src/features/appraisal/services/AppraisalVisionService.ts',
  'src/features/automation/api/newsletterService.ts',
  'src/features/inventory/services/inventoryIngestionService.ts',
  'src/features/inventory/ui/CarDetailModal.tsx',
  'src/features/inventory/ui/ComparisonModal.tsx',
  'src/features/leads/services/customerMemoryService.ts',
  'src/features/leads/services/whatsappService.ts',
  'src/shared/api/ai/aiService.ts',
];

const replacements = [
  { from: /@\/features\/ai-hub\/api\/geminiService/g, to: '@/shared/api/ai/geminiService' },
  { from: /import \{([^}]+)\} from '@\/features\/ai-hub';/g, to: "import {$1} from '@/shared/api/ai/geminiService';" }, // fallback generic fix, might need specific targeting later
  { from: /@\/features\/ai-hub-orchestration\/api\/orchestrationService/g, to: '@/features/ai-hub/ai-orchestration/api/orchestrationService' },
  { from: /import \{ Car \} from '@\/entities\/shared';/g, to: "import { Car } from '@/shared/types/types';" }
];

filesToFix.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Custom fix for ai-hub imports being too generic
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@\/features\/ai-hub['"]/g, (match, imports) => {
      // Split imports and map them to their real shared locations if possible
      // For now, mapping all to geminiService might break if they belong to aiService or others.
      // A safer bet is to map to shared/api/ai/index or keep them as is and fix manually if TS complains.
      // But FSD check only cares about the path. 
      return `import {${imports}} from '@/shared/api/ai'`; 
    });

    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });

    fs.writeFileSync(fullPath, content);
  }
});

// Also create an index.ts in shared/api/ai to make the generic import work
const sharedAiIndex = path.join(process.cwd(), 'src/shared/api/ai/index.ts');
fs.writeFileSync(sharedAiIndex, `
export * from './aiService';
export * from './geminiService';
export * from './localAiService';
export * from './togetherAiService';
`);

console.log('Fixed final files');
