import { container } from '../src/infra/di/container';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SyncToNotebook
 * Exporta el inventario y políticas a un formato Markdown que NotebookLM puede procesar
 * con alta precisión (Grounded knowledge).
 */
async function sync() {
    console.log("🚀 Iniciando extracción de datos para NotebookLM...");

    const dealerId = 'richard-automotive';
    const inventoryRepo = container.getLeadRepository(); // Usamos la infraestructura existente

    // 1. Obtener Inventario
    // Nota: Usamos el contenedor para mantener el Nivel 12
    const cars = await container.getGetInventoryUseCase().execute(dealerId);

    let markdown = `# INVENTARIO RICHARD AUTOMOTIVE - ${new Date().toLocaleDateString()}\n\n`;
    markdown += `Este documento es la fuente oficial de verdad para el inventario del dealer.\n\n`;

    cars.forEach((car: any) => {
        markdown += `## ${car.name || 'Vehículo sin nombre'} (${car.year || 'N/A'})\n`;
        markdown += `- **ID/VIN**: ${car.id}\n`;
        markdown += `- **Marca/Modelo**: ${car.make || ''} ${car.model || ''}\n`;
        markdown += `- **Precio**: $${car.price || 'Consultar'}\n`;
        markdown += `- **Kilometraje**: ${car.mileage !== undefined ? car.mileage + ' km' : 'N/A'}\n`;
        markdown += `- **Transmisión**: ${car.transmission || 'N/A'}\n`;
        markdown += `- **Estado**: ${car.status === 'available' ? '✅ Disponible' : '❌ Reservado/Vendido'}\n`;
        markdown += `- **Descripción**: ${car.description || 'N/A'}\n\n`;
    });

    // 2. Agregar Políticas y Scripts (desde genesis.md y otros)
    const genesisPath = path.join(process.cwd(), 'docs/genesis.md');
    if (fs.existsSync(genesisPath)) {
        markdown += `\n# POLÍTICAS Y SCRIPTS DE VENTA\n\n`;
        markdown += fs.readFileSync(genesisPath, 'utf8');
    }

    const outputPath = path.join(process.cwd(), 'dist/knowledge_base.md');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, markdown);

    console.log(`✅ Sincronización completada. Archivo generado en: ${outputPath}`);
    console.log(`💬 Próximo paso: Sube este archivo a tu Notebook en NotebookLM.`);
}

sync().catch(console.error);
