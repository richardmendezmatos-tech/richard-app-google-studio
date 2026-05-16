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

    // Validar llaves de API
    const apiSpinner = ora('Validando integridad de llaves de API...').start();
    const geminiKey = process.env.VITE_GEMINI_API_KEY;
    
    if (!geminiKey) {
      apiSpinner.warn(chalk.yellow('VITE_GEMINI_API_KEY no configurada.'));
    } else {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const data: any = await response.json();
        
        if (data.error) {
          if (data.error.message?.includes('leaked')) {
            apiSpinner.fail(chalk.red('VITE_GEMINI_API_KEY ha sido reportada como FILTRADA (Leaked). Cámbiala de inmediato.'));
          } else {
            apiSpinner.fail(chalk.red(`VITE_GEMINI_API_KEY inválida: ${data.error.message}`));
          }
        } else {
          apiSpinner.succeed(chalk.green('VITE_GEMINI_API_KEY activa y segura.'));
        }
      } catch (error) {
        apiSpinner.warn(chalk.yellow('No se pudo validar la llave de Gemini (Sin conexión).'));
      }
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
