// -- Report service --------------------------------------------------------
// One entry per supported report type. Right now only 'compliance'
// (Quarterly Compliance) is wired; the other two from the UI catalog
// (inventory, hazmat) will reuse the same orchestrator + data fetcher
// with a different template module.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';
import { renderPdf } from './reports/renderer.js';
import {
  buildQuarterlyComplianceData,
  quarterContaining,
  type ReportPeriod,
} from './reports/data.js';
import {
  renderQuarterlyComplianceHtml,
  footerTemplate,
} from './reports/templates/quarterly-compliance.js';

export type ReportType = 'compliance' | 'inventory' | 'hazmat' | 'quarterly';

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
  }
}

function fileSafe(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, '_');
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
    const period = opts.period ?? quarterContaining();
    // For now every report type renders the Quarterly Compliance
    // template. Slice 2 will swap templates per type.
    const data = await buildQuarterlyComplianceData(
      opts.vesselId,
      period,
      opts.generatedBy,
    );

    // Insert a 'generating' row so concurrent calls don't race.
    const insert = await query(
      `INSERT INTO reports (vessel_id, report_type, period_label, period_start, period_end, status, generated_by)
       VALUES ($1, $2, $3, $4, $5, 'generating', $6)
       RETURNING id`,
      [opts.vesselId, opts.type, period.label, period.start, period.end, opts.generatedBy],
    );
    const reportId = String((insert.rows[0] as { id: string }).id);

    try {
      const html = renderQuarterlyComplianceHtml(data);
      const pdf = await renderPdf(html, {
        displayHeaderFooter: true,
        footerTemplate: footerTemplate(data),
        margin: { top: '14mm', bottom: '18mm', left: '12mm', right: '12mm' },
      });

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

      return { id: reportId, fileName, filePath: fullPath, fileSize: pdf.length, pdf };
    } catch (err) {
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
};
