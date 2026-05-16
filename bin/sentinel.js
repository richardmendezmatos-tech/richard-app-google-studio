#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const tsxPath = join(__dirname, '../node_modules/.bin/tsx');
const dotenvxPath = join(__dirname, '../node_modules/.bin/dotenvx');
const cliEntry = join(__dirname, '../src/cli/index.ts');

// Check if we should use dotenvx
const useDotenvx = fs.existsSync(dotenvxPath);

const args = useDotenvx 
  ? ['run', '--', tsxPath, cliEntry, ...process.argv.slice(2)]
  : [tsxPath, cliEntry, ...process.argv.slice(2)];

const command = useDotenvx ? dotenvxPath : tsxPath;

const child = spawn(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    FORCE_COLOR: '1'
  }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
