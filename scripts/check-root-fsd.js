const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../src');
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

function getLayerValue(layer) {
  return LAYERS.indexOf(layer);
}

function processDirectory(dir) {
  let violations = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      violations = violations.concat(processDirectory(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+.*?from\s+['"](@\/([^'"]+))['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[2]; // e.g., 'features/leads/...'
        const importedLayer = importPath.split('/')[0];
        
        // Find current layer
        const relativePath = path.relative(ROOT_DIR, fullPath);
        const currentLayer = relativePath.split('/')[0];

        if (LAYERS.includes(currentLayer) && LAYERS.includes(importedLayer)) {
          const currentVal = getLayerValue(currentLayer);
          const importedVal = getLayerValue(importedLayer);

          // UPWARD IMPORT Check
          if (importedVal < currentVal) {
            violations.push(`UPWARD IMPORT: ${relativePath} imports ${importPath}`);
          }

          // CROSS-SLICE IMPORT Check (same layer, different slice)
          if (currentVal === importedVal && ['features', 'entities', 'widgets', 'pages'].includes(currentLayer)) {
            const currentSlice = relativePath.split('/')[1];
            const importedSlice = importPath.split('/')[1];
            
            if (currentSlice !== importedSlice) {
               // Allow shared slices inside entities if named 'shared', otherwise it's a violation
               if (importedSlice !== 'shared' && currentLayer !== 'app') {
                  violations.push(`CROSS-SLICE IMPORT: ${relativePath} imports ${importPath}`);
               }
            }
          }
        }
      }
    }
  }
  return violations;
}

const allViolations = processDirectory(ROOT_DIR);
if (allViolations.length > 0) {
  console.log(`Found ${allViolations.length} violations:`);
  allViolations.forEach(v => console.log(v));
  process.exit(1);
} else {
  console.log('No FSD violations found!');
  process.exit(0);
}
