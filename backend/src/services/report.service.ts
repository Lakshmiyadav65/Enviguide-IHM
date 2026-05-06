// -- Report service --------------------------------------------------------
// One entry per supported report type. Right now only 'compliance'
// (Quarterly Compliance) is wired; the other two from the UI catalog
// (inventory, hazmat) will reuse the same orchestrator + data fetcher
// with a different template module.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { renderPdf } from './reports/renderer.js';
import {
  buildQuarterlyComplianceData,
  quarterContaining,
  quartersSince,
  lifetimePeriod,
  type ReportPeriod,
} from './reports/data.js';
import {
  renderQuarterlyComplianceHtml,
  footerTemplate,
} from './reports/templates/quarterly-compliance.js';
import { renderComplianceSummaryHtml } from './reports/templates/compliance-summary.js';
import { renderMaterialsInventoryHtml } from './reports/templates/materials-inventory.js';
import { renderHazmatOverviewHtml } from './reports/templates/hazmat-overview.js';
import type { ReportData } from './reports/data.js';

const log = logger.child('report');

export type ReportType = 'compliance' | 'inventory' | 'hazmat' | 'quarterly' | 'overall';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.resolve(__dirname, '..', '..', 'uploads', 'reports');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function reportTitle(type: ReportType): string {
  switch (type) {
    case 'compliance': return 'Compliance Summary Report';
    case 'inventory':  return 'Detailed Materials Inventory Report';
    case 'hazmat':     return 'Global Hazmat Overview Report';
    case 'quarterly':  return 'Quarterly Compliance Report';
    case 'overall':    return 'Ship Overall Report';
  }
}

function fileSafe(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

/** Pick the right HTML template per report type. The 'overall' and
 *  'quarterly' types share the comprehensive renderer (just with
 *  different cover-page titles + period semantics); the other three
 *  have purpose-built templates with their own page sets. */
function renderHtmlForType(type: ReportType, data: ReportData): string {
  switch (type) {
    case 'compliance': return renderComplianceSummaryHtml(data);
    case 'inventory':  return renderMaterialsInventoryHtml(data);
    case 'hazmat':     return renderHazmatOverviewHtml(data);
    case 'overall':    return renderQuarterlyComplianceHtml(data, 'Ship Overall Report');
    case 'quarterly':  return renderQuarterlyComplianceHtml(data, 'Quarterly IHM Report');
  }
}

export interface GenerateOptions {
  vesselId: string;
  type: ReportType;
  /** Optional explicit period; defaults to the calendar quarter
   *  containing today. */
  period?: ReportPeriod;
  generatedBy: string;
}

export interface GeneratedReport {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  pdf: Buffer;
}

export const ReportService = {
  /** Render and persist a report. Returns the PDF buffer alongside the
   *  DB row so the controller can stream it to the browser without a
   *  second filesystem read. */
  async generate(opts: GenerateOptions): Promise<GeneratedReport> {
    // 'overall' covers vessel onboarding → today; everything else
    // defaults to the current calendar quarter.
    const period =
      opts.period
      ?? (opts.type === 'overall' ? await lifetimePeriod(opts.vesselId) : quarterContaining());
    const t0 = Date.now();
    log.info(`generate start type=${opts.type} vessel=${opts.vesselId} period=${period.label}`);
    const data = await buildQuarterlyComplianceData(
      opts.vesselId,
      period,
      opts.generatedBy,
    );
    const tBuild = Date.now() - t0;
    log.debug(`data built in ${tBuild}ms — vessel=${data.vessel.name} materials=${data.materialGroups.reduce((n, g) => n + g.rows.length, 0)} hazmat=${data.hazmatOverview.filter((t) => t.count > 0).length}/16`);

    // Insert a 'generating' row so concurrent calls don't race.
    const insert = await query(
      `INSERT INTO reports (vessel_id, report_type, period_label, period_start, period_end, status, generated_by)
       VALUES ($1, $2, $3, $4, $5, 'generating', $6)
       RETURNING id`,
      [opts.vesselId, opts.type, period.label, period.start, period.end, opts.generatedBy],
    );
    const reportId = String((insert.rows[0] as { id: string }).id);

    try {
      const tRender0 = Date.now();
      const html = renderHtmlForType(opts.type, data);
      const pdf = await renderPdf(html, {
        displayHeaderFooter: true,
        footerTemplate: footerTemplate(data),
        margin: { top: '14mm', bottom: '18mm', left: '12mm', right: '12mm' },
      });
      const tRender = Date.now() - tRender0;

      ensureDir(REPORTS_DIR);
      const fileName = `${fileSafe(data.vessel.imoNumber)}_${fileSafe(period.label)}_${reportTitle(opts.type).replace(/\s+/g, '-')}.pdf`;
      const fullPath = path.join(REPORTS_DIR, fileName);
      fs.writeFileSync(fullPath, pdf);

      await query(
        `UPDATE reports
            SET status = 'ready', file_name = $1, file_path = $2, file_size = $3, updated_at = NOW()
          WHERE id = $4`,
        [fileName, fullPath, pdf.length, reportId],
      );

      log.info(`✓ generate ok type=${opts.type} vessel=${data.vessel.name} pages~=${Math.round(pdf.length / 50000)} size=${(pdf.length / 1024).toFixed(0)}KB render=${tRender}ms total=${Date.now() - t0}ms file=${fileName}`);
      return { id: reportId, fileName, filePath: fullPath, fileSize: pdf.length, pdf };
    } catch (err) {
      log.error(`✗ generate failed type=${opts.type} vessel=${opts.vesselId} after=${Date.now() - t0}ms :: ${(err as Error).message}`);
      await query(
        `UPDATE reports SET status = 'failed', error_message = $1, updated_at = NOW() WHERE id = $2`,
        [(err as Error).message, reportId],
      ).catch(() => undefined);
      throw err;
    }
  },

  /** List historical reports for a vessel — used by the Quarterly
   *  Archive tab on the frontend. */
  async list(vesselId: string) {
    const r = await query(
      `SELECT id, report_type, period_label, period_start, period_end,
              status, file_name, file_size, generated_by, created_at
         FROM reports
        WHERE vessel_id = $1
        ORDER BY created_at DESC`,
      [vesselId],
    );
    return r.rows.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      reportType: row.report_type,
      periodLabel: row.period_label,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      status: row.status,
      fileName: row.file_name,
      fileSize: row.file_size,
      generatedBy: row.generated_by,
      createdAt: row.created_at,
    }));
  },

  /** Quarterly Archive timeline.
   *
   *  Returns one entry per calendar quarter from the vessel's onboarding
   *  date through the current quarter, oldest first. Each entry pairs
   *  the period (label + start + end) with the most recent quarterly
   *  report that's been generated for it (or null when no report has
   *  been generated yet). The frontend uses this to render Download +
   *  Generate buttons per card. */
  async timeline(vesselId: string) {
    const onboardRes = await query(
      `SELECT created_at FROM vessels WHERE id = $1 LIMIT 1`,
      [vesselId],
    );
    if (onboardRes.rows.length === 0) {
      throw new Error('Vessel not found');
    }
    const onboardedAt = new Date(String((onboardRes.rows[0] as { created_at: string }).created_at));
    const periods = quartersSince(onboardedAt);

    // Pull all quarterly reports for this vessel and key by period_label
    // so we can match them to the expected quarters in O(1).
    const reportsRes = await query(
      `SELECT id, period_label, period_start, period_end,
              status, file_name, file_size, generated_by, created_at
         FROM reports
        WHERE vessel_id = $1 AND report_type = 'quarterly'
        ORDER BY created_at DESC`,
      [vesselId],
    );
    type Row = {
      id: string; period_label: string; period_start: string; period_end: string;
      status: string; file_name: string | null; file_size: number | null;
      generated_by: string | null; created_at: string;
    };
    const byLabel = new Map<string, Row>();
    for (const row of reportsRes.rows as Row[]) {
      // Newest first wins per label (rows came back DESC).
      if (!byLabel.has(row.period_label)) byLabel.set(row.period_label, row);
    }

    // Newest quarter first reads better in the UI.
    return periods.reverse().map((p) => {
      const r = byLabel.get(p.label);
      return {
        period: {
          label: p.label,
          start: p.start.toISOString(),
          end: p.end.toISOString(),
        },
        report: r
          ? {
              id: String(r.id),
              status: r.status,
              fileName: r.file_name,
              fileSize: r.file_size,
              generatedBy: r.generated_by,
              createdAt: r.created_at,
            }
          : null,
      };
    });
  },
};
