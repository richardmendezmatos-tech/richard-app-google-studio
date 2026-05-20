import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';

export const optimizeCommand = new Command('optimize')
  .description('Optimize assets and images for high-speed delivery')
  .action(async () => {
    console.log(chalk.cyan('\n⚡ SENTINEL SPEED: OPTIMIZACIÓN DE ASSETS...'));

    const spinner = ora('Comprimiendo imágenes y regenerando formatos AVIF/WebP...').start();

    const optimize = spawn('node', ['scripts/optimize-assets.js'], {
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    });

    optimize.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(
          chalk.green('Optimización finalizada. El score de PageSpeed ha sido preservado.'),
        );
      } else {
        spinner.fail(chalk.red('Error durante la optimización. Revisa los archivos de origen.'));
        process.exit(1);
      }
    });
  });
