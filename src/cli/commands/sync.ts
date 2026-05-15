import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';

export const syncCommand = new Command('sync')
  .description('Synchronize inventory with omnichannel distribution channels')
  .action(async () => {
    console.log(chalk.cyan('\n🔁 SENTINEL VISION: SINCRONIZACIÓN OMNICANAL...'));
    
    const spinner = ora('Conectando con ClasificadosOnline & Marketplace...').start();
    
    const sync = spawn('npx', ['tsx', 'scripts/execute-inventory-sync.ts'], {
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    sync.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(chalk.green('Sincronización completada. El inventario está actualizado en todos los canales.'));
      } else {
        spinner.fail(chalk.red('La sincronización ha fallado. Verifica la conectividad de Sentinel.'));
        process.exit(1);
      }
    });
  });
