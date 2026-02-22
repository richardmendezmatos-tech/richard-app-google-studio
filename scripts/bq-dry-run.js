#!/usr/bin/env node
// =============================================================================
// scripts/bq-dry-run.js — Richard Automotive v2026.1
// Standard #4: Escudo Financiero BigQuery — Dry Run Guard
//
// Uso: node scripts/bq-dry-run.js "<SQL_QUERY>"
//      node scripts/bq-dry-run.js --file path/to/query.sql
//
// Calcula el costo ANTES de ejecutar. Bloquea si supera 500 MB.
// Si pasa, ejecuta la query y devuelve los resultados.
// =============================================================================

import { BigQuery } from '@google-cloud/bigquery';
import { readFileSync } from 'fs';

// ── Configuración ─────────────────────────────────────────────────────────────
const MAX_BYTES = 500 * 1024 * 1024;    // 500 MB en bytes
const BYTES_PER_TB = 1_099_511_627_776; // 1 TB
const COST_PER_TB = 5.00;               // USD por TB (BigQuery on-demand pricing)
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'richard-automotive';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

// ── Leer SQL ──────────────────────────────────────────────────────────────────
function getQuery() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error(`${RED}❌ ERROR: Proporciona una query o archivo SQL.${RESET}`);
        console.error(`   Uso: node scripts/bq-dry-run.js "<SQL>"`);
        console.error(`   Uso: node scripts/bq-dry-run.js --file query.sql`);
        process.exit(1);
    }

    if (args[0] === '--file') {
        if (!args[1]) {
            console.error(`${RED}❌ ERROR: Especifica la ruta del archivo SQL.${RESET}`);
            process.exit(1);
        }
        return readFileSync(args[1], 'utf8');
    }

    return args.join(' ');
}

// ── Validaciones de buenas prácticas SQL ──────────────────────────────────────
function validateSQL(sql) {
    const warnings = [];

    // Detectar SELECT * (anti-patrón BigQuery)
    if (/SELECT\s+\*/i.test(sql)) {
        warnings.push('⚠️  Evita SELECT * — especifica columnas explícitas para reducir bytes escaneados');
    }

    // Detectar ausencia de filtro WHERE con fecha
    const hasDateFilter = /WHERE.*(_date|_at|timestamp|created|updated|date|fecha)/i.test(sql);
    const hasFrom = /FROM\s+`?[\w.]+`?/i.test(sql);
    if (hasFrom && !hasDateFilter) {
        warnings.push('⚠️  Sin filtro de fecha detectado — usa particiones WHERE date = ... para evitar full scans');
    }

    // Detectar JOINs sin condición LIMIT en subqueries
    if (/CROSS\s+JOIN/i.test(sql)) {
        warnings.push('⚠️  CROSS JOIN detectado — puede generar producto cartesiano muy costoso');
    }

    return warnings;
}

// ── Formatear bytes a unidad legible ──────────────────────────────────────────
function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

// ── Calcular costo estimado ───────────────────────────────────────────────────
function estimateCost(bytes) {
    const terabytes = bytes / BYTES_PER_TB;
    return (terabytes * COST_PER_TB).toFixed(6);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    const sql = getQuery();
    const bigquery = new BigQuery({ projectId: PROJECT_ID });

    console.log('');
    console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log(`${CYAN}🛡️  BigQuery Dry-Run Guard — Richard Automotive v2026.1${RESET}`);
    console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log(`📊 Proyecto: ${PROJECT_ID}`);
    console.log(`🔒 Límite:   ${formatBytes(MAX_BYTES)}`);
    console.log('');

    // Validaciones SQL
    const sqlWarnings = validateSQL(sql);
    if (sqlWarnings.length > 0) {
        console.log(`${YELLOW}📋 Recomendaciones SQL:${RESET}`);
        sqlWarnings.forEach(w => console.log(`   ${w}`));
        console.log('');
    }

    // Dry run
    console.log('🔍 Ejecutando dry run...');
    try {
        const [job] = await bigquery.createQueryJob({
            query: sql,
            dryRun: true,
            location: 'US',
        });

        const bytesProcessed = parseInt(job.metadata.statistics.totalBytesProcessed, 10);
        const cost = estimateCost(bytesProcessed);
        const formatted = formatBytes(bytesProcessed);

        console.log('');
        console.log(`📏 Bytes a procesar: ${formatted}`);
        console.log(`💵 Costo estimado:   $${cost} USD`);

        // ── GUARD: Bloquear si supera 500 MB ─────────────────────────────────────
        if (bytesProcessed > MAX_BYTES) {
            console.log('');
            console.log(`${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
            console.log(`${RED}❌ QUERY BLOQUEADA — Supera el límite de ${formatBytes(MAX_BYTES)}${RESET}`);
            console.log(`${RED}   Cette query procesaría ${formatted} (${((bytesProcessed / MAX_BYTES) * 100).toFixed(1)}% del límite)${RESET}`);
            console.log(`${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
            console.log('');
            console.log('💡 Soluciones:');
            console.log('   1. Añade filtro WHERE con fecha (particionamiento)');
            console.log('   2. Reemplaza SELECT * con columnas específicas');
            console.log('   3. Usa LIMIT para exploración de datos');
            console.log('   4. Crea una vista materializada en BigQuery');
            process.exit(2); // Exit code 2 = query bloqueada (diferente a error de sistema)
        }

        // ── APPROVED: Ejecutar la query ───────────────────────────────────────────
        console.log('');
        console.log(`${GREEN}✅ APROBADA — Dentro del límite de ${formatBytes(MAX_BYTES)}${RESET}`);
        console.log(`${GREEN}🚀 Ejecutando query...${RESET}`);
        console.log('');

        const [rows] = await bigquery.query({ query: sql });

        console.log(`📦 Resultados: ${rows.length} filas`);
        console.log('');

        if (rows.length > 0) {
            console.log(JSON.stringify(rows, null, 2));
        } else {
            console.log('(Sin resultados)');
        }

        console.log('');
        console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
        console.log(`${GREEN}✅ Query completada. Costo real: ~$${cost} USD${RESET}`);
        console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);

    } catch (error) {
        console.error(`${RED}❌ Error en dry run: ${error.message}${RESET}`);
        process.exit(1);
    }
}

main();
