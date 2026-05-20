import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

function categoryBadge(cat: string | null) {
  if (cat === 'HOT') return chalk.bgRed.white.bold(' 🔥 HOT  ');
  if (cat === 'WARM') return chalk.bgYellow.black.bold(' ⚡ WARM ');
  return chalk.bgGray.white(' 🧊 COLD ');
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    new: chalk.cyan('nuevo'),
    contacted: chalk.blue('contactado'),
    qualified: chalk.green('calificado'),
    proposal: chalk.yellow('propuesta'),
    closed: chalk.bgGreen.white(' CERRADO '),
    lost: chalk.red('perdido'),
  };
  return map[status] || chalk.gray(status);
}

export const leadsCommand = new Command('leads')
  .description('Vista rápida del pipeline de leads')
  .option('-n, --limit <number>', 'Número de leads a mostrar', '10')
  .option('-c, --category <cat>', 'Filtrar por categoría: HOT, WARM, COLD')
  .option('-s, --status <status>', 'Filtrar por status: new, contacted, qualified, closed')
  .option('--stats', 'Ver estadísticas del pipeline')
  .action(async (options) => {
    const supabase = getSupabase();

    // ── STATS MODE ──────────────────────────────────────────────
    if (options.stats) {
      const spinner = ora('Calculando métricas del pipeline...').start();
      try {
        const { data: all } = await supabase
          .from('leads')
          .select('category, status, deal_closed, created_at');
        spinner.stop();

        const total = all?.length || 0;
        const hot = all?.filter((l) => l.category === 'HOT').length || 0;
        const warm = all?.filter((l) => l.category === 'WARM').length || 0;
        const cold = all?.filter((l) => l.category === 'COLD').length || 0;
        const closed = all?.filter((l) => l.deal_closed).length || 0;
        const today =
          all?.filter((l) => {
            const d = new Date(l.created_at);
            const now = new Date();
            return d.toDateString() === now.toDateString();
          }).length || 0;

        console.log(chalk.cyan('\n📊 SENTINEL LEADS DASHBOARD\n'));
        console.log(`  Total Pipeline:     ${chalk.white.bold(total)} leads`);
        console.log(`  Hoy:                ${chalk.green.bold(today)} nuevos`);
        console.log(`  ${categoryBadge('HOT')}             ${chalk.red.bold(hot)}`);
        console.log(`  ${categoryBadge('WARM')}            ${chalk.yellow.bold(warm)}`);
        console.log(`  ${categoryBadge('COLD')}            ${chalk.gray.bold(cold)}`);
        console.log(`  Deals Cerrados:     ${chalk.green.bold(closed)} 🏆`);
        const rate = total > 0 ? ((closed / total) * 100).toFixed(1) : '0';
        console.log(`  Tasa de Cierre:     ${chalk.magenta.bold(rate + '%')}`);
        console.log();
      } catch (e: any) {
        spinner.fail(chalk.red('Error al obtener estadísticas: ' + e.message));
      }
      return;
    }

    // ── LIST MODE ────────────────────────────────────────────────
    const spinner = ora('Cargando leads...').start();
    try {
      let query = supabase
        .from('leads')
        .select(
          'id, first_name, last_name, phone, email, category, status, vehicle_of_interest, deal_closed, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(parseInt(options.limit));

      if (options.category) query = query.eq('category', options.category.toUpperCase());
      if (options.status) query = query.eq('status', options.status.toLowerCase());

      const { data: leads, error } = await query;
      spinner.stop();

      if (error) throw new Error(error.message);
      if (!leads || leads.length === 0) {
        console.log(chalk.yellow('\n⚠️  No se encontraron leads con los filtros aplicados.\n'));
        return;
      }

      console.log(chalk.cyan(`\n🎯 SENTINEL LEADS • Últimos ${leads.length} registros\n`));
      console.log(chalk.gray('  ' + '─'.repeat(80)));

      for (const lead of leads) {
        const name = `${lead.first_name} ${lead.last_name}`.padEnd(22);
        const phone = (lead.phone || 'N/A').padEnd(16);
        const car = (lead.vehicle_of_interest || 'Sin especificar').substring(0, 24).padEnd(26);
        const date = new Date(lead.created_at).toLocaleDateString('es-PR', {
          month: 'short',
          day: 'numeric',
        });
        const badge = categoryBadge(lead.category);
        const status = statusColor(lead.status);

        console.log(
          `  ${badge} ${chalk.white.bold(name)} ${chalk.gray(phone)} ${chalk.blue(car)} ${status} ${chalk.gray(date)}`,
        );
      }

      console.log(chalk.gray('  ' + '─'.repeat(80)));
      console.log(
        chalk.gray(
          `\n  Tip: usa --stats para ver métricas del pipeline | --category HOT para filtrar\n`,
        ),
      );
    } catch (e: any) {
      spinner.fail(chalk.red('Error: ' + e.message));
    }
  });
