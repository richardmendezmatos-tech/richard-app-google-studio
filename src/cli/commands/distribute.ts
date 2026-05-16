import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { distributionAgent, Platform } from '@/shared/api/distribution/DistributionAgent';
import { initialInventoryData } from '@/entities/inventory/model/initialInventory';
import { spawn } from 'child_process';

export const distributeCommand = new Command('distribute')
  .description('Manage inventory syndication to external platforms')
  .option('--vin <vin>', 'Target a specific vehicle by VIN')
  .option('--platform <platform>', 'Target a specific platform (clasificados_online, facebook_marketplace)')
  .option('--status', 'Show the current distribution status of the inventory')
  .action(async (options) => {
    console.log(chalk.cyan('\n🌐 SENTINEL DISTRIBUTION OMNICANAL...'));

    if (options.status) {
      const spinner = ora('Consultando estados en Supabase...').start();
      try {
        console.log(chalk.white('\n  VIN               | Plataforma            | Estado    | Última Sinc'));
        console.log(chalk.gray('  ----------------------------------------------------------------------'));
        
        for (const car of initialInventoryData) {
          const unitId = (car as any).id || car.vin;
          const statuses = await distributionAgent.getStatus(unitId);
          if (statuses.length === 0) {
            // Display empty status for platforms if no logs exist
            console.log(`  ${car.vin.slice(0, 17)} | facebook_marketplace  | ${chalk.yellow('none     ')} | Nunca`);
            console.log(`  ${car.vin.slice(0, 17)} | clasificados_online   | ${chalk.yellow('none     ')} | Nunca`);
          }
          for (const s of statuses) {
            const statusColor = s.status === 'active' ? chalk.green : s.status === 'error' ? chalk.red : chalk.yellow;
            console.log(`  ${car.vin.slice(0, 17)} | ${s.platform.padEnd(21)} | ${statusColor(s.status.padEnd(9))} | ${s.lastSync || 'Nunca'}`);
          }
        }
        spinner.succeed(chalk.green('Consulta de estados finalizada.'));
      } catch (error: any) {
        spinner.fail(chalk.red(`Error al obtener estados: ${error.message}`));
      }
      return;
    }

    if (options.vin) {
      const car = initialInventoryData.find(c => c.vin === options.vin);
      if (!car) {
        console.log(chalk.red(`❌ No se encontró ninguna unidad con el VIN: ${options.vin}`));
        return;
      }

      const args = ['tsx', 'scripts/execute-distribution.ts', options.vin];
      if (options.platform) args.push(options.platform);

      const sync = spawn('npx', args, {
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' }
      });

      sync.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green('\n✅ Distribución completada.'));
        } else {
          console.log(chalk.red('\n❌ La distribución ha fallado.'));
        }
      });
      return;
    }

    console.log(chalk.yellow('Uso: sentinel distribute --status o sentinel distribute --vin <VIN>'));
  });
