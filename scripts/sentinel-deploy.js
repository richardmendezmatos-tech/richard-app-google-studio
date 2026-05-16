import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';

const log = console.log;

async function sentinelDeploy() {
  log(chalk.cyan.bold('\n🌌 SENTINEL COMMAND PROTOCOL: PRODUCTION LAUNCH SEQUENCE\n'));
  
  const spinner = ora({
    text: chalk.blue('Stage 1: Validating Armor (Linting)...'),
    color: 'cyan'
  }).start();

  try {
    // 1. Lint
    execSync('npm run lint', { stdio: 'ignore' });
    spinner.succeed(chalk.green('Armor Validated.'));

    // 2. Tests
    spinner.start(chalk.blue('Stage 2: Stress Test (Vitest)...'));
    execSync('npm run test', { stdio: 'ignore' });
    spinner.succeed(chalk.green('Stress Test Passed.'));

    // 3. BigQuery Intelligence Guard
    spinner.start(chalk.blue('Stage 3: Intelligence Guard (BigQuery Dry-Runs)...'));
    
    const queryDir = path.join(process.cwd(), 'src/shared/api/bigquery/queries');
    if (fs.existsSync(queryDir)) {
      const queries = fs.readdirSync(queryDir).filter(f => f.endsWith('.sql'));
      for (const qFile of queries) {
        const qPath = path.join(queryDir, qFile);
        // Run dry-run via our existing script using --file to avoid shell escaping issues
        execSync(`node scripts/bq-dry-run.js --file "${qPath}" --output json`, { stdio: 'ignore' });
      }
      spinner.succeed(chalk.green(`Intelligence Guard Verified: ${queries.length} queries passed.`));
    } else {
      spinner.info(chalk.yellow('Intelligence Guard: No queries found to validate.'));
    }

    // 4. Vercel Launch
    log(chalk.magenta.bold('\n🚀 DEPLOYING TO VERCEL EDGE LAYER...\n'));
    execSync('npx vercel --prod', { stdio: 'inherit' });

    // 5. Post-Deploy Log & Telemetry
    const endTime = Date.now();
    const duration = endTime - startTime;
    const timestamp = new Date().toISOString();
    
    log(chalk.green.bold('\n✅ MISSION ACCOMPLISHED: Sentinel N24 is Live.'));
    log(chalk.gray(`   Timestamp: ${timestamp}`));
    log(chalk.gray(`   Duration: ${(duration / 1000).toFixed(2)}s\n`));

    try {
      const bqCount = fs.existsSync(queryDir) ? fs.readdirSync(queryDir).filter(f => f.endsWith('.sql')).length : 0;
      execSync(`node scripts/sentinel-telemetry.js SUCCESS ${duration} ${bqCount}`, { stdio: 'inherit' });
    } catch (e) {
      log(chalk.yellow('   ⚠️ Telemetry link failed, but deployment is secure.'));
    }

  } catch (error) {
    spinner.fail(chalk.red('MISSION ABORTED: Critical failure detected.'));
    log(chalk.red(`\n❌ Error: ${error.message}`));
    
    try {
      execSync(`node scripts/sentinel-telemetry.js FAILURE 0 0`, { stdio: 'inherit' });
    } catch (e) {}

    log(chalk.yellow('\nSystem unstable. Deployment halted to protect production.\n'));
    process.exit(1);
  }
}

sentinelDeploy();
