import fs from 'fs';
import path from 'path';

// Phase 4 Exhaustive Mappings
const importMap = {
  // Contexts
  "contexts/ThemeContext": "app/providers/ThemeProvider",
  "contexts/NotificationContext": "app/providers/NotificationProvider",
  "contexts/TelemetryContext": "app/providers/TelemetryProvider",
  "contexts/ComparisonContext": "features/comparison/model/ComparisonContext",
  "contexts/DealerContext": "entities/dealer/model/DealerContext",

  // Hooks
  "hooks/useMouseGlow": "shared/brand-ui/hooks/useMouseGlow",
  "hooks/useMetaPixel": "shared/lib/analytics/useMetaPixel",
  "hooks/useAppController": "app/hooks/useAppController",
  "hooks/useAuthListener": "features/auth/hooks/useAuthListener",
  "hooks/useVoiceRecognition": "features/ai-agents/hooks/useVoiceRecognition",
  "hooks/useCopilotAgent": "features/ai-agents/hooks/useCopilotAgent",
  "hooks/usePhotoUploader": "shared/lib/hooks/usePhotoUploader",
  "hooks/useAntigravity": "features/automation/hooks/useAntigravity",

  // Utils
  "utils/lazyRetry": "shared/lib/utils/lazyRetry",
  "utils/pdfGenerator": "shared/lib/utils/pdfGenerator",
  "utils/audioUtils": "shared/lib/utils/audioUtils",
  "utils/privacyUtils": "shared/lib/utils/privacyUtils",
  "utils/TelemetrySimulator": "shared/lib/utils/TelemetrySimulator",
  "utils/actuarialUtils": "entities/finance/lib/actuarialUtils",
  "utils/financeCalculator": "entities/finance/lib/financeCalculator"
};

const ROOT = path.join(process.cwd(), 'src');

console.log("\n🚀 Iniciando Motor Antigravity FSD (Fase 4: Legacy Dirs)...");

let movedCount = 0;
// Move files handling extensions
for (const [oldR, newR] of Object.entries(importMap)) {
  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    const oldPath = path.join(ROOT, `${oldR}${ext}`);
    const newPath = path.join(ROOT, `${newR}${ext}`);
    
    if (fs.existsSync(oldPath)) {
      const dir = path.dirname(newPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.renameSync(oldPath, newPath);
      movedCount++;
      break;
    }
  }
}
console.log(`✅ Archivos consolidados físicamente: ${movedCount}`);

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
          results = results.concat(walk(fullPath));
        }
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  return results;
}

const allFiles = walk(ROOT);
let filesMutated = 0;
let totalReplaces = 0;
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;

  for (const [oldR, newR] of Object.entries(importMap)) {
    const absoluteOld = `@/${oldR}`;
    const absoluteNew = `@/${newR}`;
    
    // Replace absolute imports @/oldR
    content = content.replace(new RegExp(`(from\\s+['"])${escapeRegExp(absoluteOld)}(.*?)(['"])`, 'g'), (m, p, s, q) => { 
      totalReplaces++; return `${p}${absoluteNew}${s}${q}`; 
    });

    // Replace relative imports ../../../oldR mapping to absolute newR
    content = content.replace(new RegExp(`(from\\s+['"](?!@).*?)${escapeRegExp(oldR)}(.*?)(['"])`, 'g'), (m, p, s, q) => { 
      totalReplaces++; return `from '${absoluteNew}${s}'`; 
    });
  }

  if (content !== orig) {
    fs.writeFileSync(file, content);
    filesMutated++;
  }
}

console.log(`✅ Importaciones Escaneadas. Archivos Modificados: ${filesMutated}, Rutas Arregladas: ${totalReplaces}`);
console.log("🏁 ¡Fase 4 reestructuración terminada exitosamente!\n");
