import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { initialInventoryData } from '@/entities/inventory/model/initialInventory';

export const marketingCommand = new Command('marketing')
  .description('Generate AI marketing content for inventory')
  .argument('[vin]', 'VIN of the vehicle to analyze')
  .action(async (vin) => {
    console.log(chalk.cyan('\n🚀 INICIANDO SENTINEL MARKETING AI...'));

    let car: any;

    if (vin) {
      car = initialInventoryData.find((c) => c.vin === vin);
      if (!car) {
        console.log(chalk.red(`❌ No se encontró ninguna unidad con el VIN: ${vin}`));
        return;
      }
    } else {
      // Pick a random featured car if no VIN provided
      const featured = initialInventoryData.filter((c) => c.featured);
      car = featured[Math.floor(Math.random() * featured.length)];
      console.log(
        chalk.yellow(`💡 No se especificó VIN. Seleccionando unidad destacada: ${car.name}`),
      );
    }

    // DEBUG: check env
    console.log(
      chalk.gray(
        `[DEBUG] Google Key: ${process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'Presente' : 'MISSING'}`,
      ),
    );
    console.log(
      chalk.gray(`[DEBUG] Vite Key: ${process.env.VITE_GEMINI_API_KEY ? 'Presente' : 'MISSING'}`),
    );

    const spinner = ora(`Generando estrategia de venta para ${chalk.bold(car.name)}...`).start();

    try {
      const content = `Vehículo: ${car.name}
Marca: ${car.make}
Modelo: ${car.model}
Año: ${car.year}
Precio: $${car.price.toLocaleString()}
Color: ${car.color}
Tipo: ${car.type}
Badge: ${car.badge || 'N/A'}`;

      const intelligence = await sentinelAI.generateInventoryIntelligence(content);

      spinner.succeed(chalk.green('Estrategia generada con éxito.\n'));

      console.log(chalk.white.bgCyan.bold(' 🚀 SALES PITCH (Viral-Ready) '));
      console.log(chalk.cyan('--------------------------------------------------'));
      console.log(chalk.white(intelligence.salesPitch));
      console.log(chalk.cyan('--------------------------------------------------\n'));

      console.log(chalk.white.bgMagenta.bold(' 🎯 COMPRADOR IDEAL '));
      console.log(chalk.magenta('--------------------------------------------------'));
      console.log(chalk.white(intelligence.idealBuyer));
      console.log(chalk.magenta('--------------------------------------------------\n'));

      console.log(
        chalk.gray(
          'Tip: Usa este copy en Facebook Marketplace o ClasificadosOnline para maximizar leads.',
        ),
      );
    } catch (error) {
      spinner.fail(chalk.red('Error al generar la inteligencia de marketing.'));
      console.error(error);
    }
  });
