import { Command } from 'commander';
import { execSync } from 'child_process';
import path from 'path';

export const commitCommand = new Command('commit')
  .description('High-precision commit with automated armor validation')
  .action(() => {
    const scriptPath = path.join(process.cwd(), 'scripts/sentinel-commit.js');
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
  });
