#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Proxy to the TypeScript entry point using tsx
const tsxPath = join(__dirname, '../node_modules/.bin/tsx');
const cliEntry = join(__dirname, '../src/cli/index.ts');

const child = spawn(tsxPath, [cliEntry, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    FORCE_COLOR: '1'
  }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
