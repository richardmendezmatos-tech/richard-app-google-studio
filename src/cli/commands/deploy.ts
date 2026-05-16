import { Command } from 'commander';
import { execSync } from 'child_process';
import path from 'path';

export const deployCommand = new Command('deploy')
  .description('Production-grade deployment sequence with intelligence guard')
  .action(() => {
    const scriptPath = path.join(process.cwd(), 'scripts/sentinel-deploy.js');
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
  });
