const fs = require('fs');
const path = require('path');

// 1. Create directories
const dirsToCreate = [
  'src/features/inventory/api',
  'src/features/sales/api',
  'src/features/leads/api',
  'src/features/houston/api',
  'src/features/marketing/api',
  'src/features/ai/api',
  'src/shared/lib',
  'src/features/inventory/model',
  'src/features/houston/model',
  'src/features/leads/model',
  'src/infra/enterprise',
  'src/infra/hubspot'
];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 2. Map of file moves { source: destination }
const fileMoves = {
  'src/application/use-cases/GetInventory.ts': 'src/features/inventory/api/GetInventory.ts',
  'src/application/use-cases/CalculateDynamicMargin.ts': 'src/features/sales/api/CalculateDynamicMargin.ts',
  'src/application/use-cases/GetLeads.ts': 'src/features/leads/api/GetLeads.ts',
  'src/application/use-cases/CalculatePredictiveScore.ts': 'src/features/leads/api/CalculatePredictiveScore.ts',
  'src/application/use-cases/GetHoustonTelemetry.ts': 'src/features/houston/api/GetHoustonTelemetry.ts',
  'src/application/use-cases/IdentifyOutreachOpportunities.ts': 'src/features/marketing/api/IdentifyOutreachOpportunities.ts',
  'src/adapters/chatbotGatewayAdapter.ts': 'src/features/ai/api/chatbotGatewayAdapter.ts',
  'src/adapters/outputSanitizer.ts': 'src/shared/lib/outputSanitizer.ts',
  'src/domain/repositories/InventoryRepository.ts': 'src/features/inventory/model/IInventoryRepository.ts',
  'src/domain/repositories/HoustonRepository.ts': 'src/features/houston/model/IHoustonRepository.ts',
  'src/domain/repositories/LeadRepository.ts': 'src/features/leads/model/ILeadRepository.ts',
  'src/domain/repositories/PredictiveRepository.ts': 'src/features/leads/model/IPredictiveRepository.ts',
  'src/core-infra/enterprise/EnterpriseClient.ts': 'src/infra/enterprise/EnterpriseClient.ts',
  'src/core-infra/hubspot/HubSpotClient.ts': 'src/infra/hubspot/HubSpotClient.ts'
};

// Map file names without extensions for quick replace in imports
const importReplacements = [
  { old: 'application/use-cases/GetInventory', new: '@/features/inventory/api/GetInventory' },
  { old: 'application/use-cases/CalculateDynamicMargin', new: '@/features/sales/api/CalculateDynamicMargin' },
  { old: 'application/use-cases/GetLeads', new: '@/features/leads/api/GetLeads' },
  { old: 'application/use-cases/CalculatePredictiveScore', new: '@/features/leads/api/CalculatePredictiveScore' },
  { old: 'application/use-cases/GetHoustonTelemetry', new: '@/features/houston/api/GetHoustonTelemetry' },
  { old: 'application/use-cases/IdentifyOutreachOpportunities', new: '@/features/marketing/api/IdentifyOutreachOpportunities' },
  { old: 'adapters/chatbotGatewayAdapter', new: '@/features/ai/api/chatbotGatewayAdapter' },
  { old: 'adapters/outputSanitizer', new: '@/shared/lib/outputSanitizer' },
  { old: 'domain/repositories/InventoryRepository', new: '@/features/inventory/model/IInventoryRepository' },
  { old: 'domain/repositories/HoustonRepository', new: '@/features/houston/model/IHoustonRepository' },
  { old: 'domain/repositories/LeadRepository', new: '@/features/leads/model/ILeadRepository' },
  { old: 'domain/repositories/PredictiveRepository', new: '@/features/leads/model/IPredictiveRepository' },
  { old: 'core-infra/enterprise/EnterpriseClient', new: '@/infra/enterprise/EnterpriseClient' },
  { old: 'core-infra/hubspot/HubSpotClient', new: '@/infra/hubspot/HubSpotClient' },
  // Also globally replace any remaining 'domain/entities' or '../domain/entities' to '@/types/types'
  { oldRegex: /from\s+['"]([^'"]*domain\/entities)['"]/g, newReplacement: "from '@/types/types'" }
];

console.log("Moving files...");
Object.entries(fileMoves).forEach(([src, dest]) => {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${src} -> ${dest}`);
  }
});

console.log("Replacing imports across all files...");
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace old import paths
  importReplacements.forEach(rep => {
    if (rep.oldRegex) {
      content = content.replace(rep.oldRegex, rep.newReplacement);
    } else {
      // Create a regex to catch both relative (../../) and absolute (@/) imports of the old path
      const regex = new RegExp(`from\\s+['"](?:@\/|\\.\\.\/|\\.\\/)*${rep.old}['"]`, 'g');
      content = content.replace(regex, `from '${rep.new}'`);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    changedCount++;
  }
});

console.log(`Updated imports in ${changedCount} files.`);

// 3. Remove empty legacy directories if they are fully empty
const dirsToRemove = [
  'src/application/use-cases',
  'src/application',
  'src/adapters',
  'src/domain/repositories',
  'src/domain/services',
  'src/domain/chatbot',
  'src/domain',
  'src/core-infra/enterprise',
  'src/core-infra/hubspot',
  'src/core-infra'
];

dirsToRemove.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      // Remove empty directory or recursive if desired (we only want to remove empty)
      // Node 14+ feature: fs.rmSync with recursive + force.
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`Removed directory: ${dir}`);
    } catch (e) {
      console.error(`Could not remove ${dir}:`, e.message);
    }
  }
});

console.log("Migration script complete.");
