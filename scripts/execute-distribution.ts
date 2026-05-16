/**
 * EXECUTABLE SCRIPT: Run Autonomous Inventory Distribution
 * Syndicates inventory to ClasificadosOnline and Facebook Marketplace.
 */
import { distributionAgent } from '../src/shared/api/distribution/DistributionAgent';
import { initialInventoryData } from '../src/entities/inventory/model/initialInventory';
import chalk from 'chalk';

async function executeDistribution() {
  console.log(chalk.cyan('🚀 [Sentinel Distribute] Iniciando Sincronización Omnicanal...'));

  const vin = process.argv[2];
  const targetPlatform = process.argv[3];

  const units = vin 
    ? initialInventoryData.filter(c => c.vin === vin)
    : initialInventoryData.filter(c => c.featured);

  if (units.length === 0) {
    console.error(chalk.red(`❌ No se encontraron unidades para procesar${vin ? ` con VIN ${vin}` : ''}.`));
    process.exit(1);
  }

  console.log(chalk.gray(`📦 Procesando ${units.length} unidades...\n`));

  for (const car of units) {
    const platforms: any[] = targetPlatform 
      ? [targetPlatform] 
      : ['facebook_marketplace', 'clasificados_online'];

    for (const platform of platforms) {
      console.log(chalk.blue(`📡 [${platform}] Sincronizando ${car.name}...`));
      
      try {
        const success = await distributionAgent.triggerSync(car as any, platform);
        if (success) {
          console.log(chalk.green(`   ✅ ÉXITO: ${car.name} sincronizado con ${platform}.`));
        } else {
          console.warn(chalk.yellow(`   ⚠️  ADVERTENCIA: Fallo en ${platform} para ${car.name}.`));
        }
      } catch (error: any) {
        console.error(chalk.red(`   ❌ ERROR FATAL en ${platform}: ${error.message}`));
      }
    }
  }

  console.log(chalk.cyan('\n🏁 [Sentinel Distribute] Proceso finalizado.'));
}

executeDistribution().catch(err => {
  console.error(chalk.red('❌ Error en el proceso de distribución:'), err);
  process.exit(1);
});
