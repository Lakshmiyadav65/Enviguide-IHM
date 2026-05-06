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
  poDate: string;             // formatted dd/mm/yyyy (po_date if set, else created_at)
  totalItems: number;
  totalAmount: string;        // formatted with currency, '—' if null
  status: string;             // pending / received / etc
  suspectedCount: number;     // count of audit_line_items with is_suspected=Yes
  description: string;
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
  const posRes = await query(
    `SELECT COUNT(*)::int AS c FROM purchase_orders
      WHERE vessel_id = $1 AND created_at >= $2 AND created_at <= $3`,
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

  // 6. PO appendices — three lists.
  const appendixRows = (sql: string): Promise<PoAppendixRow[]> =>
    query(sql, [vesselId, period.start, period.end]).then((res) =>
      (res.rows as Array<Record<string, unknown>>).map((r) => ({
        poNumber: String(r.po_number ?? ''),
        receivedDate: fmtDate(r.created_at),
      })),
    );

  const [posWithHazmat, posAllHazmatFree, posAwaitingDeclaration] = await Promise.all([
    appendixRows(
      // is_suspected is stored as VARCHAR ('Yes'/'No'), not a boolean —
      // case-insensitive equality + LOWER guards against legacy 'YES'.
      `SELECT DISTINCT po.po_number, po.created_at
         FROM purchase_orders po
         JOIN audit_line_items ali
           ON ali.po_number = po.po_number AND ali.vessel_id = po.vessel_id
        WHERE po.vessel_id = $1 AND po.created_at BETWEEN $2 AND $3
          AND LOWER(ali.is_suspected) = 'yes'
        ORDER BY po.created_at DESC`,
    ),
    appendixRows(
      `SELECT po.po_number, po.created_at
         FROM purchase_orders po
        WHERE po.vessel_id = $1 AND po.created_at BETWEEN $2 AND $3
          AND NOT EXISTS (
            SELECT 1 FROM audit_line_items ali
             WHERE ali.po_number = po.po_number
               AND ali.vessel_id = po.vessel_id
               AND LOWER(ali.is_suspected) = 'yes'
          )
        ORDER BY po.created_at DESC`,
    ),
    appendixRows(
      `SELECT DISTINCT po.po_number, po.created_at
         FROM purchase_orders po
         JOIN clarification_requests cr ON cr.vessel_id = po.vessel_id
         JOIN clarification_items   ci ON ci.clarification_id = cr.id
        WHERE po.vessel_id = $1 AND po.created_at BETWEEN $2 AND $3
          AND (ci.mds_status = 'pending' OR ci.sdoc_status = 'pending')
        ORDER BY po.created_at DESC`,
    ),
  ]);

  // 6b. Full PO listing with details + suspected-hazmat counts. Single
  //     query with a subselect so we don't N+1 across each PO.
  const poDetailsRes = await query(
    `SELECT po.po_number, po.supplier_name, po.po_date, po.created_at,
            po.total_items, po.total_amount, po.currency, po.status,
            po.description,
            COALESCE((
              SELECT COUNT(*)::int FROM audit_line_items ali
               WHERE ali.po_number = po.po_number
                 AND ali.vessel_id = po.vessel_id
                 AND LOWER(ali.is_suspected) = 'yes'
            ), 0) AS suspected_count
       FROM purchase_orders po
      WHERE po.vessel_id = $1 AND po.created_at BETWEEN $2 AND $3
      ORDER BY po.created_at DESC`,
    [vesselId, period.start, period.end],
  );
  const purchaseOrders: PoDetailRow[] = (poDetailsRes.rows as Array<Record<string, unknown>>).map((r) => {
    const amountRaw = r.total_amount;
    const amountStr =
      amountRaw === null || amountRaw === undefined || amountRaw === ''
        ? '—'
        : `${String(r.currency ?? 'USD')} ${Number(amountRaw).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return {
      poNumber: String(r.po_number ?? ''),
      supplier: String(r.supplier_name ?? ''),
      poDate: r.po_date ? String(r.po_date) : fmtDate(r.created_at),
      totalItems: Number(r.total_items ?? 0),
      totalAmount: amountStr,
      status: String(r.status ?? 'pending'),
      suspectedCount: Number(r.suspected_count ?? 0),
      description: String(r.description ?? ''),
    };
  });

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
    docNumber,
    generatedBy,
    generatedAt: fmtDate(new Date()),
  };
}
