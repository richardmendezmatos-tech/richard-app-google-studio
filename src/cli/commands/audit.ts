import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';

export const auditCommand = new Command('audit')
  .description('Perform a structural audit of the architecture (FSD Compliance)')
  .action(async () => {
    console.log(chalk.cyan('\n🛡️ SENTINEL ARCHITECT: AUDITORÍA ESTRUCTURAL...'));
    
    const spinner = ora('Validando reglas de aislamiento FSD...').start();
    
    const audit = spawn('sh', ['scripts/audit-isolation.sh'], {
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    audit.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(chalk.green('Auditoría superada. La arquitectura es resiliente y escalable.'));
      } else {
        spinner.fail(chalk.red('Se detectaron violaciones estructurales. Corrige los imports antes de continuar.'));
        process.exit(1);
      }
    });
  });
