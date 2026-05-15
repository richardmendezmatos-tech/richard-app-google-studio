import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';

export const buildCommand = new Command('build')
  .description('Build the production bundle with Sentinel optimizations')
  .action(async () => {
    console.log(chalk.cyan('\n🚀 INICIANDO PRODUCCIÓN: SENTINEL N24 BUILD...'));
    
    const spinner = ora('Compilando activos y optimizando rutas...').start();
    
    const build = spawn('npm', ['run', 'build'], {
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    build.stdout.on('data', (data) => {
      const line = data.toString();
      if (line.includes('Creating an optimized production build')) {
        spinner.text = chalk.cyan('Generando bundle optimizado...');
      }
    });

    build.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(chalk.green('Build completado con éxito. Sentinel está listo para el despliegue.'));
        console.log(chalk.white('\n✨ Tip: Ejecuta "sentinel status" para validar el entorno post-build.\n'));
      } else {
        spinner.fail(chalk.red('El build ha fallado. Revisa los logs de error arriba.'));
        process.exit(1);
      }
    });
  });
