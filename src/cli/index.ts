import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../../package.json' assert { type: 'json' };
import { statusCommand } from './commands/status';
import { buildCommand } from './commands/build';
import { syncCommand } from './commands/sync';
import { optimizeCommand } from './commands/optimize';
import { auditCommand } from './commands/audit';

const program = new Command();

// Sentinel N24 Branding
const showBanner = () => {
  console.log(chalk.cyan(`
   _____ ______ _   _ _______ _____ _   _ ______ _      
  / ____|  ____| \\ | |__   __|_   _| \\ | |  ____| |     
 | (___ | |__  |  \\| |  | |    | | |  \\| | |__  | |     
  \\___ \\|  __| | . \` |  | |    | | | . \` |  __| | |     
  ____) | |____| |\\  |  | |   _| |_| |\\  | |____| |____ 
 |_____/|______|_| \\_|  |_|  |_____|_| \\_|______|______|
  `));
  console.log(chalk.gray(`  SENTINEL COMMAND CENTER • v${version} • Richard Automotive\n`));
};

program
  .name('sentinel')
  .description('Richard Automotive Sentinel Command Center CLI')
  .version(version);

// Register commands
program.addCommand(statusCommand);
program.addCommand(buildCommand);
program.addCommand(syncCommand);
program.addCommand(optimizeCommand);
program.addCommand(auditCommand);

// Root command action (just show banner if no subcommands)
program.action(() => {
  showBanner();
  program.help();
});

program.parse(process.argv);
