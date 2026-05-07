// -- Report data fetchers --------------------------------------------------
// Single function that gathers every row a Quarterly Compliance Report
// needs, then hands a clean shape to the template. Querying happens here,
// not in the template, so the template stays pure presentation and easy
// to swap when the design lands.

import { query } from '../../config/database.js';

export interface ReportPeriod {
  start: Date;
  end: Date;
  /** Human label like "Q4 2025" or "Ad Hoc 2026-04-30" */
  label: string;
}

export interface VesselSpecs {
  id: string;
  name: string;
  imoNumber: string;
  vesselType: string | null;
  flagState: string | null;
  portOfRegistry: string | null;
  vesselClass: string | null;
  grossTonnage: string | null;
  keelLaidDate: string | null;
  deliveryDate: string | null;
  registeredOwner: string | null;
  shipManager: string | null;
  /** Yard / builder — vessels.name_of_yard. Cover page → Ship Builder row. */
  shipBuilder: string | null;
  /** vessels.image — file path or URL. If present, replaces the gradient
   *  placeholder on the cover Vessel Photograph block. Resolved to a
   *  absolute URL or data: URI before the template runs. */
  image: string | null;
  /** vessels.soc_reference — Statement of Compliance reference. */
  socReference: string | null;
  /** vessels.ihm_reference — Initial IHM Reference (cover meta). */
  ihmReference: string | null;
}

export interface MovementRow {
  partLabel: string;        // 'Part I – I1', 'Part I – I2', etc.
  startCount: number;
  added: number;
  updated: number;
  endCount: number;
}

export interface HazmatTile {
  code: string;             // 'Pb', 'Cd', 'Asb', ...
  name: string;             // 'Lead (and compounds)', etc.
  count: number;
}

export interface MaterialRow {
  id: string;
  no: number;
  createdOn: string;        // formatted dd/mm/yyyy
  updatedOn: string;
  name: string;
  location: string;
  classification: string;
  qty: string;
  partsWhereUsed: string;
  remarks: string;
  status: 'Added' | 'Updated' | 'Carried Forward';
  /** For HM Marked Decks page — null if no GA plan / pin set. */
  gaPlanUrl: string | null;
  gaPlanName: string | null;
  pinX: number | null;
  pinY: number | null;
  rect: { x: number; y: number; w: number; h: number } | null;
}

export interface MaterialGroup {
  groupKey: 'I-1' | 'I-2' | 'I-3' | 'II' | 'III';
  title: string;
  rows: MaterialRow[];
}

export interface PoAppendixRow {
  poNumber: string;
  receivedDate: string;
}

export interface PoDetailRow {
  poNumber: string;
  supplier: string;
  poDate: string;             // formatted dd/mm/yyyy (po_sent_date if set, else created_at)
  receivedOn: string;         // formatted dd/mm/yyyy (audit_line_items.created_at)
  totalItems: number;
  suspectedCount: number;     // line items with is_suspected = Yes
  /** Up to ~60 chars of the first item description, for context. */
  sampleItem: string;
}

/** Aggregate + per-vendor breakdown for the MD/SDoC tracking section.
 *  Sourced from clarification_requests + clarification_items. */
export interface MdSdocVendorRow {
  vendor: string;
  email: string;
  totalRequests: number;
  submitted: number;
  pending: number;
  reminders: number;
  mdsRequested: number;
  mdsReceived: number;
  sdocsRequested: number;
  sdocsReceived: number;
  lastSentAt: string;
}

export interface MdSdocStats {
  totals: {
    totalRequests: number;
    distinctVendors: number;
    submittedRequests: number;
    pendingRequests: number;
    totalReminders: number;
    totalItems: number;
    mdsPending: number;
    mdsReceived: number;
    sdocsPending: number;
    sdocsReceived: number;
  };
  byVendor: MdSdocVendorRow[];
}

/** Row in the Suspected Hazmat section — one entry per suspected
 *  line item, grouped by supplier in the renderer. */
export interface SuspectedItemRow {
  supplier: string;
  poNumber: string;
  poDate: string;
  receivedOn: string;
  itemDescription: string;
  equipment: string;
  maker: string;
  partNumber: string;
  quantity: string;
  unit: string;
  vendorRemark: string;
}

export interface ReportData {
  vessel: VesselSpecs;
  period: ReportPeriod;
  movement: MovementRow[];
  totals: {
    posReceivedInQuarter: number;
    docsRequested: number;
    docsReceived: number;
  };
  hazmatOverview: HazmatTile[];
  materialGroups: MaterialGroup[];
  appendices: {
    posWithHazmat: PoAppendixRow[];
    posAllHazmatFree: PoAppendixRow[];
    posAwaitingDeclaration: PoAppendixRow[];
  };
  /** Full PO listing for the period — supplier, date, items, amount,
   *  status, suspected-hazmat count. Used by the Purchase Orders page
   *  in the Ship Overall and Compliance Summary reports. */
  purchaseOrders: PoDetailRow[];
  /** Just the suspected-hazmat line items, one row each, sorted by
   *  supplier so the renderer can produce a per-supplier breakdown. */
  suspectedItems: SuspectedItemRow[];
  /** MD/SDoC tracking — aggregate KPIs and per-vendor breakdown. */
  mdSdoc: MdSdocStats;
  /** Auto-generated doc number for the cover page. */
  docNumber: string;
  /** Operator who triggered the generation, for the cover. */
  generatedBy: string;
  /** Date the report was generated (formatted dd/mm/yyyy) — separate
   *  from the period dates which describe what the report covers. */
  generatedAt: string;
}

// ─── The 16 hazmat compounds Varuna's report tracks ──────────────────────
// Order matters — drives the tile grid on the overview page.
const HAZMAT_CATALOG: ReadonlyArray<{ code: string; name: string }> = [
  { code: 'Asb',   name: 'Asbestos' },
  { code: 'PCB',   name: 'Polychlorinated Biphenyls (PCB)' },
  { code: 'ODS',   name: 'Ozone Depleting Substance' },
  { code: 'OC',    name: 'Organotin Compounds' },
  { code: 'Cd',    name: 'Cadmium (and compounds)' },
  { code: 'Cr',    name: 'Chromium (and compounds)' },
  { code: 'Pb',    name: 'Lead (and compounds)' },
  { code: 'Hg',    name: 'Mercury (and compounds)' },
  { code: 'PBB',   name: 'Polybrominated Biphenyl (PBB)' },
  { code: 'PBDE',  name: 'Polybrominated Diphenyl Ethers (PBDE)' },
  { code: 'PCN',   name: 'Polychloronaphthalenes (Cl >= 3)' },
  { code: 'RM',    name: 'Radioactive Material' },
  { code: 'CSCP',  name: 'Certain Shortchain Chlorinated Paraffins' },
  { code: 'PFOS',  name: 'Perfluorooctane Sulfonic Acid (PFOS)' },
  { code: 'HBCDD', name: 'Hexabromocyclododecane (HBCDD)' },
  { code: 'Cb',    name: 'Cybutryne' },
];

function fmtDate(value: unknown): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

function partGroupOf(
  ihmPart: string | null,
  name: string | null,
  hazard: string | null,
): MaterialGroup['groupKey'] {
  const s = (ihmPart || '').toLowerCase();
  if (s.includes('part iii')) return 'III';
  if (s.includes('part ii')) return 'II';

  // Within Part I, route by name/hazard type since we don't carry a
  // sub-class column. Falls back to I-2 (Equipment & Machinery) which
  // is the most common bucket.
  const nm = `${name ?? ''} ${hazard ?? ''}`.toLowerCase();
  if (/(paint|coating|primer|varnish)/.test(nm)) return 'I-1';
  if (/(hull|structur(e|al)|deck plate|frame)/.test(nm)) return 'I-3';
  return 'I-2';
}

function statusOf(createdAt: Date, updatedAt: Date, period: ReportPeriod): MaterialRow['status'] {
  const created = createdAt.getTime();
  const updated = updatedAt.getTime();
  const start = period.start.getTime();
  const end = period.end.getTime();
  if (created >= start && created <= end) return 'Added';
  if (updated >= start && updated <= end && created < start) return 'Updated';
  return 'Carried Forward';
}

/** Build a quarterly period for the calendar quarter that contains `ref`. */
export function quarterContaining(ref: Date = new Date()): ReportPeriod {
  const y = ref.getFullYear();
  const q = Math.floor(ref.getMonth() / 3); // 0..3
  const start = new Date(Date.UTC(y, q * 3, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, q * 3 + 3, 0, 23, 59, 59));
  return { start, end, label: `Q${q + 1} ${y}` };
}

/** Vessel-lifetime period — onboarding date through today. Used by the
 *  'overall' report type which is a full snapshot rather than a quarter. */
export async function lifetimePeriod(vesselId: string): Promise<ReportPeriod> {
  const r = await query(
    `SELECT created_at FROM vessels WHERE id = $1 LIMIT 1`,
    [vesselId],
  );
  if (r.rows.length === 0) throw new Error('Vessel not found');
  const start = new Date(String((r.rows[0] as { created_at: string }).created_at));
  const end = new Date();
  return { start, end, label: 'Overall' };
}

/** Walks every calendar quarter from the one containing `from` through
 *  the one containing `until` (inclusive), oldest first. Used to build
 *  the Quarterly Archive timeline — one card per elapsed quarter since
 *  the vessel was onboarded. */
export function quartersSince(from: Date, until: Date = new Date()): ReportPeriod[] {
  const out: ReportPeriod[] = [];
  let y = from.getUTCFullYear();
  let q = Math.floor(from.getUTCMonth() / 3); // 0..3
  const endY = until.getUTCFullYear();
  const endQ = Math.floor(until.getUTCMonth() / 3);

  // Hard guard against runaway loops if a bad date sneaks in (e.g. a
  // vessel created_at far in the future would never satisfy the
  // termination condition).
  let safety = 0;
  while ((y < endY || (y === endY && q <= endQ)) && safety++ < 200) {
    const start = new Date(Date.UTC(y, q * 3, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, q * 3 + 3, 0, 23, 59, 59));
    out.push({ start, end, label: `Q${q + 1} ${y}` });
    q += 1;
    if (q > 3) { q = 0; y += 1; }
  }
  return out;
}

// ─── Main entry ───────────────────────────────────────────────────────────

export async function buildQuarterlyComplianceData(
  vesselId: string,
  period: ReportPeriod,
  generatedBy: string,
): Promise<ReportData> {
  // 1. Vessel specs
  const vesselRes = await query(
    `SELECT id, name, imo_number, vessel_type, flag_state, port_of_registry,
            vessel_class, gross_tonnage, keel_laid_date, delivery_date,
            registered_owner, ship_manager, name_of_yard, image,
            soc_reference, ihm_reference
       FROM vessels WHERE id = $1 LIMIT 1`,
    [vesselId],
  );
  const v = vesselRes.rows[0] as Record<string, unknown> | undefined;
  if (!v) throw new Error('Vessel not found');
  const vessel: VesselSpecs = {
    id: String(v.id),
    name: String(v.name ?? ''),
    imoNumber: String(v.imo_number ?? ''),
    vesselType: (v.vessel_type as string) ?? null,
    flagState: (v.flag_state as string) ?? null,
    portOfRegistry: (v.port_of_registry as string) ?? null,
    vesselClass: (v.vessel_class as string) ?? null,
    grossTonnage: (v.gross_tonnage as string) ?? null,
    keelLaidDate: fmtDate(v.keel_laid_date) || null,
    deliveryDate: fmtDate(v.delivery_date) || null,
    registeredOwner: (v.registered_owner as string) ?? null,
    shipManager: (v.ship_manager as string) ?? null,
    shipBuilder: (v.name_of_yard as string) ?? null,
    image: (v.image as string) ?? null,
    socReference: (v.soc_reference as string) ?? null,
    ihmReference: (v.ihm_reference as string) ?? null,
  };

  // 2. All materials for this vessel + their location + GA plan + rect
  //    (so the per-item HM Marked Decks pages can render the pin overlay).
  const materialsRes = await query(
    `SELECT m.id, m.name, m.ihm_part, m.hazard_type, m.material_name,
            m.quantity, m.unit, m.no_of_pieces, m.component, m.equipment,
            m.compartment, m.position, m.remarks, m.created_at, m.updated_at,
            m.pin_x, m.pin_y,
            da.name        AS area_name,
            da.x           AS rect_x,
            da.y           AS rect_y,
            da.width       AS rect_w,
            da.height      AS rect_h,
            gp.file_path   AS ga_file_path,
            gp.name        AS ga_plan_name
       FROM materials m
       LEFT JOIN deck_areas da ON m.deck_area_id = da.id
       LEFT JOIN ga_plans   gp ON da.ga_plan_id   = gp.id
      WHERE m.vessel_id = $1
      ORDER BY m.ihm_part, m.created_at ASC`,
    [vesselId],
  );

  const groupsByKey: Record<MaterialGroup['groupKey'], MaterialRow[]> = {
    'I-1': [], 'I-2': [], 'I-3': [], 'II': [], 'III': [],
  };

  let no = 0;
  for (const row of materialsRes.rows as Array<Record<string, unknown>>) {
    no += 1;
    const createdAt = new Date(String(row.created_at));
    const updatedAt = new Date(String(row.updated_at));
    const group = partGroupOf(
      (row.ihm_part as string) ?? null,
      (row.name as string) ?? null,
      (row.hazard_type as string) ?? null,
    );
    const qtyParts: string[] = [];
    if (row.no_of_pieces) qtyParts.push(`${row.no_of_pieces} PCS`);
    if (row.quantity) qtyParts.push(`${row.quantity}${row.unit ? ' ' + row.unit : ''}`);
    const qty = qtyParts.join(' | ') || '-';

    const rect = row.rect_w && row.rect_h
      ? {
          x: Number(row.rect_x ?? 0),
          y: Number(row.rect_y ?? 0),
          w: Number(row.rect_w),
          h: Number(row.rect_h),
        }
      : null;

    const mat: MaterialRow = {
      id: String(row.id),
      no,
      createdOn: fmtDate(row.created_at),
      updatedOn: fmtDate(row.updated_at),
      name: String(row.name ?? ''),
      location: String(row.area_name ?? row.compartment ?? row.position ?? ''),
      classification: String(row.hazard_type ?? row.material_name ?? ''),
      qty,
      partsWhereUsed: String(row.component ?? row.equipment ?? ''),
      remarks: String(row.remarks ?? ''),
      status: statusOf(createdAt, updatedAt, period),
      gaPlanUrl: (row.ga_file_path as string) ?? null,
      gaPlanName: (row.ga_plan_name as string) ?? null,
      pinX: row.pin_x !== null && row.pin_x !== undefined ? Number(row.pin_x) : null,
      pinY: row.pin_y !== null && row.pin_y !== undefined ? Number(row.pin_y) : null,
      rect,
    };
    groupsByKey[group].push(mat);
  }

  const materialGroups: MaterialGroup[] = [
    { groupKey: 'I-1', title: 'I-1 Paints and coating systems',  rows: groupsByKey['I-1'] },
    { groupKey: 'I-2', title: 'I-2 Equipment and machinery',      rows: groupsByKey['I-2'] },
    { groupKey: 'I-3', title: 'I-3 Structure and hull',           rows: groupsByKey['I-3'] },
    { groupKey: 'II',  title: 'Part II Operationally generated wastes', rows: groupsByKey['II'] },
    { groupKey: 'III', title: 'Part III Stores',                  rows: groupsByKey['III'] },
  ];

  // 3. IHM Movement counts — start, added, updated, end — per Part group.
  //    Done on the already-fetched rows so we don't re-query.
  const movement: MovementRow[] = materialGroups.map((g) => {
    let startCount = 0, added = 0, updated = 0, endCount = 0;
    for (const r of g.rows) {
      const created = new Date(r.createdOn.split('/').reverse().join('-')).getTime();
      const isAdded = r.status === 'Added';
      const isUpdated = r.status === 'Updated';
      if (created < period.start.getTime()) startCount += 1;
      if (isAdded) added += 1;
      if (isUpdated) updated += 1;
      if (created <= period.end.getTime()) endCount += 1;
    }
    const partLabel = g.groupKey.startsWith('I-') ? `Part I – ${g.groupKey.slice(2)}` : `Part ${g.groupKey}`;
    return { partLabel, startCount, added, updated, endCount };
  });

  // 4. Hazmat overview — count materials per compound code.
  const overviewRes = await query(
    `SELECT hazard_type, COUNT(*)::int AS count
       FROM materials
      WHERE vessel_id = $1 AND hazard_type IS NOT NULL AND hazard_type <> ''
      GROUP BY hazard_type`,
    [vesselId],
  );
  const countsByName = new Map<string, number>();
  for (const r of overviewRes.rows as Array<{ hazard_type: string; count: number }>) {
    countsByName.set((r.hazard_type || '').trim().toLowerCase(), Number(r.count));
  }
  const hazmatOverview: HazmatTile[] = HAZMAT_CATALOG.map(({ code, name }) => ({
    code,
    name,
    count: countsByName.get(name.toLowerCase()) ?? 0,
  }));

  // 5. Period totals — POs received, docs requested, docs received.
  // POs live in audit_line_items (one row per line item). Distinct
  // po_number = one PO. purchase_orders is a separate manual-entry
  // table that this product flow doesn't populate.
  const posRes = await query(
    `SELECT COUNT(DISTINCT po_number)::int AS c FROM audit_line_items
      WHERE vessel_id = $1 AND created_at BETWEEN $2 AND $3
        AND po_number IS NOT NULL AND po_number <> ''`,
    [vesselId, period.start, period.end],
  );
  const docsReqRes = await query(
    `SELECT COUNT(*)::int AS c
       FROM clarification_items ci
       JOIN clarification_requests cr ON ci.clarification_id = cr.id
      WHERE cr.vessel_id = $1
        AND cr.created_at >= $2 AND cr.created_at <= $3`,
    [vesselId, period.start, period.end],
  );
  const docsRcvRes = await query(
    `SELECT COUNT(*)::int AS c
       FROM clarification_items ci
       JOIN clarification_requests cr ON ci.clarification_id = cr.id
      WHERE cr.vessel_id = $1
        AND (ci.mds_received_at BETWEEN $2 AND $3
          OR ci.sdoc_received_at BETWEEN $2 AND $3)`,
    [vesselId, period.start, period.end],
  );
  const totals = {
    posReceivedInQuarter: Number((posRes.rows[0] as { c: number }).c),
    docsRequested: Number((docsReqRes.rows[0] as { c: number }).c),
    docsReceived: Number((docsRcvRes.rows[0] as { c: number }).c),
  };

  // 6. PO appendices — three lists, all sourced from audit_line_items.
  const appendixRows = (sql: string): Promise<PoAppendixRow[]> =>
    query(sql, [vesselId, period.start, period.end]).then((res) =>
      (res.rows as Array<Record<string, unknown>>).map((r) => ({
        poNumber: String(r.po_number ?? ''),
        receivedDate: fmtDate(r.created_at),
      })),
    );

  const [posWithHazmat, posAllHazmatFree, posAwaitingDeclaration] = await Promise.all([
    // POs that have at least one suspected-hazmat line item.
    appendixRows(
      `SELECT po_number, MIN(created_at) AS created_at
         FROM audit_line_items
        WHERE vessel_id = $1 AND created_at BETWEEN $2 AND $3
          AND po_number IS NOT NULL AND po_number <> ''
        GROUP BY po_number
       HAVING SUM(CASE WHEN LOWER(is_suspected) = 'yes' THEN 1 ELSE 0 END) > 0
        ORDER BY MIN(created_at) DESC`,
    ),
    // POs whose every line item is non-suspected (hazmat-free).
    appendixRows(
      `SELECT po_number, MIN(created_at) AS created_at
         FROM audit_line_items
        WHERE vessel_id = $1 AND created_at BETWEEN $2 AND $3
          AND po_number IS NOT NULL AND po_number <> ''
        GROUP BY po_number
       HAVING SUM(CASE WHEN LOWER(is_suspected) = 'yes' THEN 1 ELSE 0 END) = 0
        ORDER BY MIN(created_at) DESC`,
    ),
    // POs awaiting declaration — joined to clarification_items at the
    // vessel level (clarifications aren't keyed by po_number in this
    // schema, so the link is vessel-wide). Empty when no pending
    // MD/SDoC clarifications exist for the vessel.
    appendixRows(
      `SELECT DISTINCT ali.po_number, MIN(ali.created_at) AS created_at
         FROM audit_line_items ali
        WHERE ali.vessel_id = $1 AND ali.created_at BETWEEN $2 AND $3
          AND ali.po_number IS NOT NULL AND ali.po_number <> ''
          AND EXISTS (
            SELECT 1 FROM clarification_items ci
              JOIN clarification_requests cr ON ci.clarification_id = cr.id
             WHERE cr.vessel_id = $1
               AND (ci.mds_status = 'pending' OR ci.sdoc_status = 'pending')
          )
        GROUP BY ali.po_number
        ORDER BY MIN(ali.created_at) DESC`,
    ),
  ]);

  // 6b. Full PO listing with details + suspected-hazmat counts.
  // Aggregates audit_line_items rows by po_number into one row per PO.
  // MAX(vendor_name) and MIN(po_sent_date) are safe — every line of a
  // single PO carries the same supplier and PO date in practice.
  const poDetailsRes = await query(
    `SELECT po_number,
            MAX(vendor_name)              AS supplier,
            MIN(po_sent_date)             AS po_date,
            MIN(created_at)               AS received_at,
            COUNT(*)::int                 AS total_items,
            SUM(CASE WHEN LOWER(is_suspected) = 'yes' THEN 1 ELSE 0 END)::int AS suspected_count,
            (ARRAY_AGG(item_description ORDER BY row_index))[1] AS sample_item
       FROM audit_line_items
      WHERE vessel_id = $1 AND created_at BETWEEN $2 AND $3
        AND po_number IS NOT NULL AND po_number <> ''
      GROUP BY po_number
      ORDER BY MIN(created_at) DESC`,
    [vesselId, period.start, period.end],
  );
  const purchaseOrders: PoDetailRow[] = (poDetailsRes.rows as Array<Record<string, unknown>>).map((r) => {
    const sample = String(r.sample_item ?? '').trim();
    return {
      poNumber: String(r.po_number ?? ''),
      supplier: String(r.supplier ?? ''),
      poDate: r.po_date ? fmtDate(r.po_date) : '—',
      receivedOn: fmtDate(r.received_at),
      totalItems: Number(r.total_items ?? 0),
      suspectedCount: Number(r.suspected_count ?? 0),
      sampleItem: sample.length > 60 ? sample.slice(0, 60) + '…' : sample,
    };
  });

  // 6c. Suspected-hazmat line items — one row per audit_line_items
  //     entry where is_suspected = Yes. Sorted by supplier so the
  //     renderer can group them under per-supplier sub-headings.
  const suspectedRes = await query(
    `SELECT po_number, vendor_name, po_sent_date, created_at,
            item_description, equipment_name, maker, part_number,
            quantity, unit, vendor_remark
       FROM audit_line_items
      WHERE vessel_id = $1 AND created_at BETWEEN $2 AND $3
        AND LOWER(is_suspected) = 'yes'
      ORDER BY vendor_name ASC, po_number ASC, row_index ASC`,
    [vesselId, period.start, period.end],
  );
  const suspectedItems: SuspectedItemRow[] = (suspectedRes.rows as Array<Record<string, unknown>>).map((r) => ({
    supplier: String(r.vendor_name ?? '').trim() || 'Unknown supplier',
    poNumber: String(r.po_number ?? ''),
    poDate: r.po_sent_date ? fmtDate(r.po_sent_date) : '—',
    receivedOn: fmtDate(r.created_at),
    itemDescription: String(r.item_description ?? '').trim(),
    equipment: String(r.equipment_name ?? '').trim(),
    maker: String(r.maker ?? '').trim(),
    partNumber: String(r.part_number ?? '').trim(),
    quantity: String(r.quantity ?? '').trim(),
    unit: String(r.unit ?? '').trim(),
    vendorRemark: String(r.vendor_remark ?? '').trim(),
  }));

  // 6d. MD/SDoC tracking — vendor outreach status, reminders sent,
  //     and items received vs pending. Sourced from
  //     clarification_requests + clarification_items. Period filter
  //     uses cr.created_at so the report covers requests opened
  //     during the period.
  // Reminders are stored per clarification_item (each item carries its
  // own reminder_count), but reminders are sent per *request* email. We
  // take MAX(reminder_count) per request so a 4-item request that was
  // reminded once is counted as 1 reminder, not 4.
  const totalsRes = await query(
    `WITH per_req AS (
       SELECT cr.id, cr.status, cr.recipient_emails, cr.created_at,
              COALESCE(MAX(ci.reminder_count), 0) AS req_reminders
         FROM clarification_requests cr
         LEFT JOIN clarification_items ci ON ci.clarification_id = cr.id
        WHERE cr.vessel_id = $1 AND cr.created_at BETWEEN $2 AND $3
        GROUP BY cr.id, cr.status, cr.recipient_emails, cr.created_at
     )
     SELECT
        COUNT(*)::int                                             AS total_requests,
        COUNT(DISTINCT recipient_emails)::int                     AS distinct_vendors,
        COUNT(*) FILTER (WHERE status = 'submitted')::int         AS submitted_requests,
        COUNT(*) FILTER (WHERE status = 'sent')::int              AS pending_requests,
        COALESCE(SUM(req_reminders), 0)::int                      AS total_reminders,
        (SELECT COUNT(*)::int FROM clarification_items ci
           JOIN clarification_requests cr ON ci.clarification_id = cr.id
          WHERE cr.vessel_id = $1 AND cr.created_at BETWEEN $2 AND $3) AS total_items,
        (SELECT COUNT(*)::int FROM clarification_items ci
           JOIN clarification_requests cr ON ci.clarification_id = cr.id
          WHERE cr.vessel_id = $1 AND cr.created_at BETWEEN $2 AND $3
            AND ci.mds_status  = 'pending') AS mds_pending,
        (SELECT COUNT(*)::int FROM clarification_items ci
           JOIN clarification_requests cr ON ci.clarification_id = cr.id
          WHERE cr.vessel_id = $1 AND cr.created_at BETWEEN $2 AND $3
            AND ci.mds_received_at IS NOT NULL) AS mds_received,
        (SELECT COUNT(*)::int FROM clarification_items ci
           JOIN clarification_requests cr ON ci.clarification_id = cr.id
          WHERE cr.vessel_id = $1 AND cr.created_at BETWEEN $2 AND $3
            AND ci.sdoc_status = 'pending') AS sdoc_pending,
        (SELECT COUNT(*)::int FROM clarification_items ci
           JOIN clarification_requests cr ON ci.clarification_id = cr.id
          WHERE cr.vessel_id = $1 AND cr.created_at BETWEEN $2 AND $3
            AND ci.sdoc_received_at IS NOT NULL) AS sdoc_received
       FROM per_req`,
    [vesselId, period.start, period.end],
  );
  const totalsRow = (totalsRes.rows[0] ?? {}) as Record<string, number>;

  // Group by recipient_emails so each unique vendor appears once,
  // even when only some of their requests have supplier_company filled
  // in (it's NULL on 'sent' requests until the supplier submits the
  // portal form). The displayed vendor name picks any non-empty
  // supplier_company seen for that email; otherwise falls back to the
  // email itself.
  const byVendorRes = await query(
    `WITH per_req AS (
       SELECT cr.id, cr.status, cr.recipient_emails, cr.supplier_company, cr.created_at,
              COALESCE(MAX(ci.reminder_count), 0) AS req_reminders
         FROM clarification_requests cr
         LEFT JOIN clarification_items ci ON ci.clarification_id = cr.id
        WHERE cr.vessel_id = $1 AND cr.created_at BETWEEN $2 AND $3
        GROUP BY cr.id, cr.status, cr.recipient_emails, cr.supplier_company, cr.created_at
     )
     SELECT
        COALESCE(MAX(NULLIF(pr.supplier_company, '')), pr.recipient_emails) AS vendor,
        pr.recipient_emails                                                  AS email,
        COUNT(*)::int                                                        AS total_requests,
        COUNT(*) FILTER (WHERE pr.status = 'submitted')::int                 AS submitted,
        COUNT(*) FILTER (WHERE pr.status = 'sent')::int                      AS pending,
        COALESCE(SUM(pr.req_reminders), 0)::int                              AS reminders,
        (SELECT COUNT(*)::int FROM clarification_items ci
           JOIN clarification_requests cr2 ON ci.clarification_id = cr2.id
          WHERE cr2.vessel_id = $1 AND cr2.created_at BETWEEN $2 AND $3
            AND cr2.recipient_emails = pr.recipient_emails) AS mds_requested,
        (SELECT COUNT(*)::int FROM clarification_items ci
           JOIN clarification_requests cr2 ON ci.clarification_id = cr2.id
          WHERE cr2.vessel_id = $1 AND cr2.created_at BETWEEN $2 AND $3
            AND cr2.recipient_emails = pr.recipient_emails
            AND ci.mds_received_at IS NOT NULL) AS mds_received,
        (SELECT COUNT(*)::int FROM clarification_items ci
           JOIN clarification_requests cr2 ON ci.clarification_id = cr2.id
          WHERE cr2.vessel_id = $1 AND cr2.created_at BETWEEN $2 AND $3
            AND cr2.recipient_emails = pr.recipient_emails) AS sdocs_requested,
        (SELECT COUNT(*)::int FROM clarification_items ci
           JOIN clarification_requests cr2 ON ci.clarification_id = cr2.id
          WHERE cr2.vessel_id = $1 AND cr2.created_at BETWEEN $2 AND $3
            AND cr2.recipient_emails = pr.recipient_emails
            AND ci.sdoc_received_at IS NOT NULL) AS sdocs_received,
        MAX(pr.created_at)                                                   AS last_sent_at
       FROM per_req pr
      GROUP BY pr.recipient_emails
      ORDER BY MAX(pr.created_at) DESC`,
    [vesselId, period.start, period.end],
  );
  const mdSdoc: MdSdocStats = {
    totals: {
      totalRequests:     Number(totalsRow.total_requests     ?? 0),
      distinctVendors:   Number(totalsRow.distinct_vendors   ?? 0),
      submittedRequests: Number(totalsRow.submitted_requests ?? 0),
      pendingRequests:   Number(totalsRow.pending_requests   ?? 0),
      totalReminders:    Number(totalsRow.total_reminders    ?? 0),
      totalItems:        Number(totalsRow.total_items        ?? 0),
      mdsPending:        Number(totalsRow.mds_pending        ?? 0),
      mdsReceived:       Number(totalsRow.mds_received       ?? 0),
      sdocsPending:      Number(totalsRow.sdoc_pending       ?? 0),
      sdocsReceived:     Number(totalsRow.sdoc_received      ?? 0),
    },
    byVendor: (byVendorRes.rows as Array<Record<string, unknown>>).map((r) => ({
      vendor:          String(r.vendor ?? '').trim() || 'Unknown vendor',
      email:           String(r.email ?? '').trim(),
      totalRequests:   Number(r.total_requests   ?? 0),
      submitted:       Number(r.submitted        ?? 0),
      pending:         Number(r.pending          ?? 0),
      reminders:       Number(r.reminders        ?? 0),
      mdsRequested:    Number(r.mds_requested    ?? 0),
      mdsReceived:     Number(r.mds_received     ?? 0),
      sdocsRequested:  Number(r.sdocs_requested  ?? 0),
      sdocsReceived:   Number(r.sdocs_received   ?? 0),
      lastSentAt:      fmtDate(r.last_sent_at),
    })),
  };

  // 7. Doc number — yyyymmdd-IMO-AD for ad-hoc, plain Q-style otherwise.
  const yyyymmdd = `${period.end.getUTCFullYear()}${String(period.end.getUTCMonth() + 1).padStart(2, '0')}${String(period.end.getUTCDate()).padStart(2, '0')}`;
  const docNumber = `EG | ${vessel.imoNumber} | ${yyyymmdd} | ${period.label.replace(/\s+/g, '')}`;

  return {
    vessel,
    period,
    movement,
    totals,
    hazmatOverview,
    materialGroups,
    appendices: { posWithHazmat, posAllHazmatFree, posAwaitingDeclaration },
    purchaseOrders,
    suspectedItems,
    mdSdoc,
    docNumber,
    generatedBy,
    generatedAt: fmtDate(new Date()),
  };
}
