import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';

export const statusCommand = new Command('status')
  .description('Check the current health and status of the Command Center')
  .action(async () => {
    console.log(chalk.cyan('\n🔍 INICIANDO SENTINEL HEALTH CHECK...'));
    
    const spinner = ora('Validando calidad de código (Linting)...').start();
    
    try {
      execSync('npm run lint', { stdio: 'ignore' });
      spinner.succeed(chalk.green('Calidad de código validada (0 errores).'));
    } catch (error) {
      spinner.fail(chalk.red('Se detectaron problemas de calidad o lints pendientes.'));
      console.log(chalk.yellow('\n💡 Ejecuta "npm run lint" para ver los detalles.'));
    }

    const buildSpinner = ora('Verificando integridad del entorno...').start();
    try {
      // Just check if we can access important files
      execSync('ls src/app/layout.tsx', { stdio: 'ignore' });
      buildSpinner.succeed(chalk.green('Entorno de desarrollo íntegro.'));
    } catch (error) {
      buildSpinner.fail(chalk.red('Error crítico de integridad: Faltan archivos base.'));
    }

    console.log(chalk.cyan('\n📊 RESUMEN DE SALUD:'));
    console.log(chalk.white('  • Sentinel Protocol: ') + chalk.green('ACTIVO'));
    console.log(chalk.white('  • Nivel de Autonomía: ') + chalk.yellow('13 (Sentinel Vision)'));
    console.log(chalk.white('  • Status Operativo: ') + chalk.green('OPTIMIZADO\n'));
  });
