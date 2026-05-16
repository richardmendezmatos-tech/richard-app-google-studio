import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

const log = console.log;

const showBanner = () => {
  log(chalk.cyan(`
   _____ ______ _   _ _______ _____ _   _ ______ _      
  / ____|  ____| \\ | |__   __|_   _| \\ | |  ____| |     
 | (___ | |__  |  \\| |  | |    | | |  \\| | |__  | |     
  \\___ \\|  __| | . \` |  | |    | | | . \` |  __| | |     
  ____) | |____| |\\  |  | |   _| |_| |\\  | |____| |____ 
 |_____/|______|_| \\_|  |_|  |_____|_| \\_|______|______|
  `));
  log(chalk.gray(`  SENTINEL COMMAND CENTER • COMMIT PROTOCOL • Richard Automotive\n`));
};

async function sentinelCommit() {
  showBanner();
  
  const spinner = ora({
    text: chalk.blue('Validating Armor (Running Linter)...'),
    color: 'cyan'
  }).start();

  try {
    // 1. Run Lint
    execSync('npm run lint', { stdio: 'ignore' });
    spinner.succeed(chalk.green('Armor Validated: No linting issues detected.'));
    
    // 2. Stage Changes
    spinner.start(chalk.blue('Staging operational data...'));
    execSync('git add .');
    spinner.succeed(chalk.green('Data Staged.'));

    log(chalk.yellow.bold('\n🛠️ Launching Commitizen (Conventional Commits)...\n'));
    
    // 3. Run Commitizen
    // We use inherit to let the user interact with CZ
    execSync('npx cz', { stdio: 'inherit' });

  } catch (error) {
    spinner.fail(chalk.red('PROTOCOL BREACH: Validation failed.'));
    log(chalk.red('\n❌ Please resolve linting errors before committing.'));
    log(chalk.gray('Run "npm run lint" to see detailed errors.\n'));
    process.exit(1);
  }
}

sentinelCommit();
