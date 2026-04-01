import fs from 'fs';
import path from 'path';

/**
 * Migration Auditor for Richard Automotive
 * Verifies that FSD components are correctly bridged to Next.js App Router.
 */

const pagesDir = './src/pages';
const appDir = './src/app';

interface RouteAudit {
  name: string;
  hasBridge: boolean;
  path?: string;
}

function runAudit() {
  console.log('🚀 Starting Next.js Migration Audit...\n');

  // 1. Audit FSD Routes
  const pageSlices = fs.readdirSync(pagesDir).filter(f => 
    fs.statSync(path.join(pagesDir, f)).isDirectory() && 
    !f.startsWith('_') && 
    f !== 'shared'
  );

  const routeResults: RouteAudit[] = [];
  
  for (const slice of pageSlices) {
    // Special mapping cases if any, otherwise 1:1
    const appPath = path.join(appDir, slice);
    const hasBridge = fs.existsSync(appPath) && fs.existsSync(path.join(appPath, 'page.tsx'));
    
    routeResults.push({ name: slice, hasBridge });
  }

  console.log('--- FSD Bridge Coverage ---');
  routeResults.forEach(r => {
    console.log(`${r.hasBridge ? '✅' : '❌'} ${r.name.padEnd(20)} ${r.hasBridge ? 'Mapped' : 'UNMAPPED'}`);
  });

  // 2. Audit Environment Variables (Vite vs Next)
  console.log('\n--- Legacy Pattern Recognition ---');
  let violations = 0;
  const filesToScan = getAllFiles('./src');
  
  filesToScan.forEach(file => {
    if (file.includes('node_modules') || file.includes('.next')) return;
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('import.meta.env')) {
      if (violations < 10) console.warn(`⚠️  Found import.meta.env in: ${file}`);
      violations++;
    }
  });

  if (violations > 0) {
    console.warn(`\nFound ${violations} environment pattern violations. Components might crash in production.`);
  } else {
    console.log('✅ No legacy import.meta.env patterns found.');
  }

  // 3. SSR Safety Check
  console.log('\n--- SSR/Client Directive Check ---');
  const appPages = getAllFiles(appDir).filter(f => f.endsWith('page.tsx'));
  appPages.forEach(p => {
    const content = fs.readFileSync(p, 'utf8');
    if (!content.includes("'use client'") && !content.includes('"use client"') && !content.includes('async function')) {
      console.warn(`🤔 Page without 'use client' or 'async' (Check if hooks are used): ${p}`);
    }
  });

  console.log('\nAudit Complete.');
}

function getAllFiles(dirPath: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const name = path.join(dirPath, file);
    if (fs.statSync(name).isDirectory()) {
      getAllFiles(name, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      fileList.push(name);
    }
  });
  return fileList;
}

runAudit();
