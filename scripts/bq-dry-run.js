#!/usr/bin/env node
// =============================================================================
// scripts/bq-dry-run.js — Richard Automotive v2.0 (Expert Edition)
// Standard #4: Escudo Financiero BigQuery — Intelligence & Guard
//
// Uso: node scripts/bq-dry-run.js "<SQL_QUERY>"
//      node scripts/bq-dry-run.js --file path/to/query.sql --limit 1GB --output table
// =============================================================================

import { BigQuery } from '@google-cloud/bigquery';
import { readFileSync } from 'fs';
import readline from 'readline';

// ── Configuración ─────────────────────────────────────────────────────────────
const DEFAULT_MAX_BYTES = 500 * 1024 * 1024;    // 500 MB
const BYTES_PER_TB = 1_099_511_627_776; 
const COST_PER_TB = 5.00;               
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'richard-automotive';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

// ── Helpers ───────────────────────────────────────────────────────────────────
const ask = (query) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans.toLowerCase());
    }));
};

function parseLimit(limitStr) {
    if (!limitStr) return DEFAULT_MAX_BYTES;
    const num = parseFloat(limitStr);
    if (limitStr.toUpperCase().endsWith('GB')) return num * 1024 * 1024 * 1024;
    if (limitStr.toUpperCase().endsWith('MB')) return num * 1024 * 1024;
    return num;
}

// ── Argument Parsing ──────────────────────────────────────────────────────────
function getArgs() {
    const args = process.argv.slice(2);
    const config = {
        sql: '',
        limit: DEFAULT_MAX_BYTES,
        output: 'json', // Default to json for easy parsing
        interactive: true
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--file') {
            config.sql = readFileSync(args[++i], 'utf8');
        } else if (args[i] === '--limit') {
            config.limit = parseLimit(args[++i]);
        } else if (args[i] === '--output') {
            config.output = args[++i];
        } else if (!args[i].startsWith('--')) {
            config.sql = args[i];
        }
    }

    if (!config.sql) {
        console.error(`${RED}❌ ERROR: Proporciona SQL o --file.${RESET}`);
        process.exit(1);
    }

    return config;
}

// ── SQL Intelligence ──────────────────────────────────────────────────────────
function validateSQL(sql) {
    const warnings = [];
    const suggestions = [];

    if (/SELECT\s+\*/i.test(sql)) {
        warnings.push('⚠️  Anti-patrón SELECT * detectado.');
        suggestions.push('💡 Especifica columnas explícitas para reducir el costo de escaneo.');
    }

    if (/\bORDER\s+BY\b/i.test(sql) && !/\bLIMIT\b/i.test(sql)) {
        warnings.push('⚠️  ORDER BY sin LIMIT en query de alto nivel.');
        suggestions.push('💡 El ordenamiento global consume muchos slots. Añade LIMIT si es para exploración.');
    }

    if (/\bCROSS\s+JOIN\b/i.test(sql)) {
        warnings.push('🔥 CROSS JOIN detectado — ¡Peligro de explosión de datos!');
        suggestions.push('💡 Verifica si puedes usar un INNER JOIN con condiciones específicas.');
    }

    const hasDateFilter = /WHERE.*(_date|_at|timestamp|created|updated|date|fecha)/i.test(sql);
    if (!hasDateFilter && sql.length > 50) {
        warnings.push('⚠️  Ausencia de filtro temporal (Partitioning).');
        suggestions.push('💡 Filtra por columnas particionadas para ahorrar un ~90% de costo.');
    }

    return { warnings, suggestions };
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

// ── Main Engine ───────────────────────────────────────────────────────────────
async function main() {
    const config = getArgs();
    const bigquery = new BigQuery({ projectId: PROJECT_ID });

    if (config.output !== 'json') {
        console.log(`\n${CYAN}🛡️  Sentinel BigQuery Guard v2.0 — ${PROJECT_ID}${RESET}\n`);
    }

    const { warnings, suggestions } = validateSQL(config.sql);
    
    if (config.output !== 'json' && warnings.length > 0) {
        console.log(`${YELLOW}📋 Intelligence Report:${RESET}`);
        warnings.forEach(w => console.log(`   ${w}`));
        suggestions.forEach(s => console.log(`   ${s}`));
        console.log('');
    }

    try {
        const [job] = await bigquery.createQueryJob({
            query: config.sql,
            dryRun: true,
            location: 'US',
        });

        const bytesProcessed = parseInt(job.metadata.statistics.totalBytesProcessed, 10);
        const cost = (bytesProcessed / BYTES_PER_TB * COST_PER_TB).toFixed(6);
        const formatted = formatBytes(bytesProcessed);

        if (config.output !== 'json') {
            console.log(`📏 Análisis de Escaneo: ${formatted}`);
            console.log(`💵 Costo Proyectado:  $${cost} USD`);
        }

        // BLOQUEO HARD: Supera límite establecido
        if (bytesProcessed > config.limit) {
            console.error(`\n${RED}🛑 BLOQUEO DE SEGURIDAD: La query supera el límite de ${formatBytes(config.limit)}.${RESET}`);
            process.exit(2);
        }

        // APROBACIÓN SOFT: Si el costo es significativo, preguntar
        if (config.output !== 'json' && bytesProcessed > 100 * 1024 * 1024) { // > 100 MB
            const confirm = await ask(`\n${YELLOW}⚠️  La query procesará ${formatted}. ¿Deseas proceder? (s/n): ${RESET}`);
            if (confirm !== 's' && confirm !== 'si' && confirm !== 'y') {
                console.log(`${RED}Aborted.${RESET}`);
                process.exit(0);
            }
        }

        if (config.output !== 'json') {
            console.log(`\n${GREEN}🚀 Ejecutando query...${RESET}\n`);
        }

        const [rows] = await bigquery.query({ query: config.sql });

        if (config.output === 'json') {
            console.log(JSON.stringify(rows, null, 2));
        } else if (config.output === 'table') {
            console.table(rows.slice(0, 50));
            if (rows.length > 50) console.log(`... y ${rows.length - 50} filas más.`);
        } else {
            console.log(rows);
        }

    } catch (error) {
        console.error(`\n${RED}❌ ERROR BIGQUERY: ${error.message}${RESET}\n`);
        process.exit(1);
    }
}

main();
