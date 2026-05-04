// -- Database Migration (raw SQL) --------------------------
// Creates all tables if they don't exist.
// Safe to run multiple times (uses IF NOT EXISTS).

import { query, closePool } from '../config/database.js';

const migration = `
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  phone           VARCHAR(50),
  country         VARCHAR(100),
  status          VARCHAR(20) NOT NULL DEFAULT 'active',
  category        VARCHAR(50) NOT NULL DEFAULT 'viewer',
  password        VARCHAR(255) NOT NULL,
  last_activity   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vessels table
CREATE TABLE IF NOT EXISTS "vessels" (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  VARCHAR(255) NOT NULL,
  imo_number            VARCHAR(7) UNIQUE NOT NULL,
  created_by_id         UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  vessel_type           VARCHAR(100),
  registration_number   VARCHAR(100),
  signal_letters        VARCHAR(20),
  gross_tonnage         VARCHAR(50),
  deadweight_tonnage    VARCHAR(50),
  teu_units             VARCHAR(50),
  registered_owner      VARCHAR(255),
  ship_owner            VARCHAR(255),
  ship_manager          VARCHAR(255),
  fleet                 VARCHAR(100),
  sub_fleet             VARCHAR(100),
  vessel_class          VARCHAR(100),
  vessel_ihm_class      VARCHAR(100),
  class_id_no           VARCHAR(100),
  ihm_class             VARCHAR(100),
  flag_state            VARCHAR(100),
  port_of_registry      VARCHAR(255),
  name_of_yard          VARCHAR(255),
  shipyard_location     VARCHAR(255),
  builders_unique_id    VARCHAR(100),
  keel_laid_date        VARCHAR(50),
  delivery_date         VARCHAR(50),
  ihm_method            VARCHAR(20),
  md_standard           VARCHAR(20),
  ihm_reference         VARCHAR(255),
  soc_reference         VARCHAR(255),
  soc_expiry_date       VARCHAR(50),
  compliance_status     VARCHAR(50) DEFAULT 'compliant',
  image                 VARCHAR(500),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Summaries table
CREATE TABLE IF NOT EXISTS "audit_summaries" (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id               UUID NOT NULL REFERENCES "vessels"(id) ON DELETE CASCADE,
  imo_number              VARCHAR(7) NOT NULL,
  vessel_name             VARCHAR(255) NOT NULL,
  total_po                INTEGER NOT NULL DEFAULT 0,
  total_items             INTEGER NOT NULL DEFAULT 0,
  duplicate_po            INTEGER NOT NULL DEFAULT 0,
  duplicate_supplier_code INTEGER NOT NULL DEFAULT 0,
  duplicate_product       INTEGER NOT NULL DEFAULT 0,
  status                  VARCHAR(50) DEFAULT 'In Progress',
  review_assigned_to      VARCHAR(255),
  reviewed_by             VARCHAR(255),
  reviewed_at             TIMESTAMPTZ,
  last_activity           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill columns on existing audit_summaries (safe to re-run)
ALTER TABLE "audit_summaries" ADD COLUMN IF NOT EXISTS review_assigned_to VARCHAR(255);
ALTER TABLE "audit_summaries" ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255);
ALTER TABLE "audit_summaries" ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE "audit_summaries" ADD COLUMN IF NOT EXISTS uploaded_file_path VARCHAR(500);
ALTER TABLE "audit_summaries" ADD COLUMN IF NOT EXISTS uploaded_file_name VARCHAR(255);

-- Audit line items (one row per parsed Excel/PDF/CSV row)
CREATE TABLE IF NOT EXISTS "audit_line_items" (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id          UUID NOT NULL REFERENCES "audit_summaries"(id) ON DELETE CASCADE,
  vessel_id         UUID REFERENCES "vessels"(id) ON DELETE SET NULL,
  row_index         INTEGER NOT NULL,
  name              VARCHAR(255),
  vessel_name       VARCHAR(255),
  po_number         VARCHAR(100),
  imo_number        VARCHAR(20),
  po_sent_date      VARCHAR(50),
  md_requested_date VARCHAR(50),
  item_description  TEXT,
  is_suspected      VARCHAR(10) NOT NULL DEFAULT 'No',
  impa_code         VARCHAR(50),
  issa_code         VARCHAR(50),
  equipment_code    VARCHAR(100),
  equipment_name    VARCHAR(255),
  maker             VARCHAR(255),
  model             VARCHAR(255),
  part_number       VARCHAR(100),
  unit              VARCHAR(50),
  quantity          VARCHAR(50),
  vendor_remark     TEXT,
  vendor_email      VARCHAR(255),
  vendor_name       VARCHAR(255),
  extra_data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GA Plans table
CREATE TABLE IF NOT EXISTS "ga_plans" (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id   UUID NOT NULL REFERENCES "vessels"(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  file_name   VARCHAR(255) NOT NULL,
  file_path   VARCHAR(500) NOT NULL,
  file_size   INTEGER NOT NULL,
  mime_type   VARCHAR(100) NOT NULL,
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deck Areas table (mapped sections on GA Plans)
CREATE TABLE IF NOT EXISTS "deck_areas" (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ga_plan_id  UUID NOT NULL REFERENCES "ga_plans"(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  x           DOUBLE PRECISION NOT NULL,
  y           DOUBLE PRECISION NOT NULL,
  width       DOUBLE PRECISION NOT NULL,
  height      DOUBLE PRECISION NOT NULL,
  thumbnail   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ga_plan_id, name)
);

-- Decks table
CREATE TABLE IF NOT EXISTS "decks" (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id     UUID NOT NULL REFERENCES "vessels"(id) ON DELETE CASCADE,
  ga_plan_id    UUID REFERENCES "ga_plans"(id) ON DELETE SET NULL,
  deck_area_id  UUID REFERENCES "deck_areas"(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  level         INTEGER NOT NULL DEFAULT 0,
  ga_plan_url   VARCHAR(500),
  thumbnail     TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materials table (hazardous material entries mapped to decks)
CREATE TABLE IF NOT EXISTS "materials" (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id         UUID NOT NULL REFERENCES "vessels"(id) ON DELETE CASCADE,
  deck_id           UUID REFERENCES "decks"(id) ON DELETE SET NULL,
  deck_area_id      UUID REFERENCES "deck_areas"(id) ON DELETE SET NULL,
  name              VARCHAR(255) NOT NULL,
  ihm_part          VARCHAR(50) NOT NULL,
  category          VARCHAR(20) NOT NULL DEFAULT 'warning',
  hazard_type       VARCHAR(255),
  equipment_class   VARCHAR(255),
  hm_status         VARCHAR(20) DEFAULT 'CHM',
  quantity          VARCHAR(50),
  unit              VARCHAR(50),
  no_of_pieces      VARCHAR(50),
  total_quantity    VARCHAR(50),
  compartment       VARCHAR(255),
  equipment         VARCHAR(255),
  position          VARCHAR(255),
  component         VARCHAR(255),
  material_name     VARCHAR(255),
  ship_po           VARCHAR(100),
  movement_type     VARCHAR(100),
  manufacturer      VARCHAR(255),
  ihm_part_number   VARCHAR(100),
  description       TEXT,
  remarks           TEXT,
  avoid_updation    BOOLEAN NOT NULL DEFAULT false,
  pin_x             DOUBLE PRECISION,
  pin_y             DOUBLE PRECISION,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table (IHM Report, SOC, Ship Particulars, MD, SDoC, etc.)
CREATE TABLE IF NOT EXISTS "documents" (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id       UUID NOT NULL REFERENCES "vessels"(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  document_type   VARCHAR(100) NOT NULL,
  category        VARCHAR(100) DEFAULT 'general',
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  file_name       VARCHAR(255) NOT NULL,
  file_path       VARCHAR(500) NOT NULL,
  file_size       INTEGER NOT NULL,
  mime_type       VARCHAR(100) NOT NULL,
  uploaded_by     VARCHAR(255),
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS "purchase_orders" (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id       UUID NOT NULL REFERENCES "vessels"(id) ON DELETE CASCADE,
  po_number       VARCHAR(100) NOT NULL,
  supplier_name   VARCHAR(255) NOT NULL,
  supplier_code   VARCHAR(100),
  status          VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_items     INTEGER NOT NULL DEFAULT 0,
  total_amount    DECIMAL(14, 2),
  currency        VARCHAR(10) DEFAULT 'USD',
  po_date         VARCHAR(50),
  description     TEXT,
  file_name       VARCHAR(255),
  file_path       VARCHAR(500),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MD/SDoC Requests table (suspected hazmat tracking per supplier)
CREATE TABLE IF NOT EXISTS "md_sdoc_requests" (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id         UUID NOT NULL REFERENCES "vessels"(id) ON DELETE CASCADE,
  po_id             UUID REFERENCES "purchase_orders"(id) ON DELETE SET NULL,
  material_id       UUID REFERENCES "materials"(id) ON DELETE SET NULL,
  supplier_name     VARCHAR(255) NOT NULL,
  supplier_code     VARCHAR(100),
  item_name         VARCHAR(255) NOT NULL,
  ihm_part          VARCHAR(50),
  hazard_type       VARCHAR(255),
  status            VARCHAR(50) NOT NULL DEFAULT 'Pending',
  reminder_count    INTEGER NOT NULL DEFAULT 0,
  last_reminder_at  TIMESTAMPTZ,
  received_at       TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User additional profile columns (for UserProfile page)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS company_name   VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS avatar         VARCHAR(500);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS system_message TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS is_limited_ships BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS role_name      VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS origin         VARCHAR(50) DEFAULT 'Direct';

-- User Categories master table
CREATE TABLE IF NOT EXISTS "user_categories" (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  status      VARCHAR(20) NOT NULL DEFAULT 'Active',
  archived    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Menu Items (dynamic navigation)
CREATE TABLE IF NOT EXISTS "menu_items" (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  path        VARCHAR(255) NOT NULL,
  icon        VARCHAR(100),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  archived    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Permission Nodes (tree of available permissions)
CREATE TABLE IF NOT EXISTS "permission_nodes" (
  id          VARCHAR(100) PRIMARY KEY,
  label       VARCHAR(255) NOT NULL,
  parent_id   VARCHAR(100) REFERENCES "permission_nodes"(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-user permissions
CREATE TABLE IF NOT EXISTS "user_permissions" (
  user_id     UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  node_id     VARCHAR(100) NOT NULL REFERENCES "permission_nodes"(id) ON DELETE CASCADE,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, node_id)
);

-- Per-role permissions (Administrator / Ship Manager / Deck Officer / Surveyor)
CREATE TABLE IF NOT EXISTS "role_permissions" (
  role_name   VARCHAR(100) NOT NULL,
  node_id     VARCHAR(100) NOT NULL REFERENCES "permission_nodes"(id) ON DELETE CASCADE,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_name, node_id)
);

-- Seed the new flat module-action authorization catalog used by the
-- /security/authorizations page. 10 module roots + 70 leaf nodes
-- (one per Module x Action combination). Coexists with any legacy
-- per-screen nodes (ship_view / ship_add / ...) that older grants
-- may still reference; nothing here deletes or supersedes those.
INSERT INTO "permission_nodes" (id, label, parent_id, sort_order) VALUES
  ('mod_vessels',          'Vessels',           NULL, 10),
  ('mod_materials',        'Materials Record',  NULL, 20),
  ('mod_decks',            'Decks',             NULL, 30),
  ('mod_documents',        'Documents',         NULL, 40),
  ('mod_purchase_orders',  'Purchase Orders',   NULL, 50),
  ('mod_audits',           'Audits',            NULL, 60),
  ('mod_reports',          'Reports',           NULL, 70),
  ('mod_certificate',      'IHM Certificate',   NULL, 80),
  ('mod_settings',         'Settings',          NULL, 90),
  ('mod_security',         'Security',          NULL, 100)
ON CONFLICT (id) DO NOTHING;

-- Action leaves. The 7 actions are: create, read, update, delete, print, export, send.
-- Generating each row explicitly keeps the SQL boring & greppable.
INSERT INTO "permission_nodes" (id, label, parent_id, sort_order) VALUES
  ('vessels_create',          'Create', 'mod_vessels',         1),
  ('vessels_read',            'Read',   'mod_vessels',         2),
  ('vessels_update',          'Update', 'mod_vessels',         3),
  ('vessels_delete',          'Delete', 'mod_vessels',         4),
  ('vessels_print',           'Print',  'mod_vessels',         5),
  ('vessels_export',          'Export', 'mod_vessels',         6),
  ('vessels_send',            'Send',   'mod_vessels',         7),
  ('materials_create',        'Create', 'mod_materials',       1),
  ('materials_read',          'Read',   'mod_materials',       2),
  ('materials_update',        'Update', 'mod_materials',       3),
  ('materials_delete',        'Delete', 'mod_materials',       4),
  ('materials_print',         'Print',  'mod_materials',       5),
  ('materials_export',        'Export', 'mod_materials',       6),
  ('materials_send',          'Send',   'mod_materials',       7),
  ('decks_create',            'Create', 'mod_decks',           1),
  ('decks_read',              'Read',   'mod_decks',           2),
  ('decks_update',            'Update', 'mod_decks',           3),
  ('decks_delete',            'Delete', 'mod_decks',           4),
  ('decks_print',             'Print',  'mod_decks',           5),
  ('decks_export',            'Export', 'mod_decks',           6),
  ('decks_send',              'Send',   'mod_decks',           7),
  ('documents_create',        'Create', 'mod_documents',       1),
  ('documents_read',          'Read',   'mod_documents',       2),
  ('documents_update',        'Update', 'mod_documents',       3),
  ('documents_delete',        'Delete', 'mod_documents',       4),
  ('documents_print',         'Print',  'mod_documents',       5),
  ('documents_export',        'Export', 'mod_documents',       6),
  ('documents_send',          'Send',   'mod_documents',       7),
  ('purchase_orders_create',  'Create', 'mod_purchase_orders', 1),
  ('purchase_orders_read',    'Read',   'mod_purchase_orders', 2),
  ('purchase_orders_update',  'Update', 'mod_purchase_orders', 3),
  ('purchase_orders_delete',  'Delete', 'mod_purchase_orders', 4),
  ('purchase_orders_print',   'Print',  'mod_purchase_orders', 5),
  ('purchase_orders_export',  'Export', 'mod_purchase_orders', 6),
  ('purchase_orders_send',    'Send',   'mod_purchase_orders', 7),
  ('audits_create',           'Create', 'mod_audits',          1),
  ('audits_read',             'Read',   'mod_audits',          2),
  ('audits_update',           'Update', 'mod_audits',          3),
  ('audits_delete',           'Delete', 'mod_audits',          4),
  ('audits_print',            'Print',  'mod_audits',          5),
  ('audits_export',           'Export', 'mod_audits',          6),
  ('audits_send',             'Send',   'mod_audits',          7),
  ('reports_create',          'Create', 'mod_reports',         1),
  ('reports_read',            'Read',   'mod_reports',         2),
  ('reports_update',          'Update', 'mod_reports',         3),
  ('reports_delete',          'Delete', 'mod_reports',         4),
  ('reports_print',           'Print',  'mod_reports',         5),
  ('reports_export',          'Export', 'mod_reports',         6),
  ('reports_send',            'Send',   'mod_reports',         7),
  ('certificate_create',      'Create', 'mod_certificate',     1),
  ('certificate_read',        'Read',   'mod_certificate',     2),
  ('certificate_update',      'Update', 'mod_certificate',     3),
  ('certificate_delete',      'Delete', 'mod_certificate',     4),
  ('certificate_print',       'Print',  'mod_certificate',     5),
  ('certificate_export',      'Export', 'mod_certificate',     6),
  ('certificate_send',        'Send',   'mod_certificate',     7),
  ('settings_create',         'Create', 'mod_settings',        1),
  ('settings_read',           'Read',   'mod_settings',        2),
  ('settings_update',         'Update', 'mod_settings',        3),
  ('settings_delete',         'Delete', 'mod_settings',        4),
  ('settings_print',          'Print',  'mod_settings',        5),
  ('settings_export',         'Export', 'mod_settings',        6),
  ('settings_send',           'Send',   'mod_settings',        7),
  ('security_create',         'Create', 'mod_security',        1),
  ('security_read',           'Read',   'mod_security',        2),
  ('security_update',         'Update', 'mod_security',        3),
  ('security_delete',         'Delete', 'mod_security',        4),
  ('security_print',          'Print',  'mod_security',        5),
  ('security_export',         'Export', 'mod_security',        6),
  ('security_send',           'Send',   'mod_security',        7)
ON CONFLICT (id) DO NOTHING;

-- Suppliers master table
CREATE TABLE IF NOT EXISTS "suppliers" (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  category      VARCHAR(255),
  location      VARCHAR(255),
  contact_email VARCHAR(255),
  phone         VARCHAR(50),
  rating        VARCHAR(10),
  status        VARCHAR(20) NOT NULL DEFAULT 'Active',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment master table
CREATE TABLE IF NOT EXISTS "equipment_master" (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(255) NOT NULL,
  model_code        VARCHAR(100),
  manufacturer      VARCHAR(255),
  system_type       VARCHAR(100),
  next_service_date VARCHAR(50),
  description       TEXT,
  status            VARCHAR(20) NOT NULL DEFAULT 'Active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Suspected Keywords (auto-flag hazmat)
CREATE TABLE IF NOT EXISTS "suspected_keywords" (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword       VARCHAR(255) UNIQUE NOT NULL,
  hazard_type   VARCHAR(255),
  severity      VARCHAR(20) NOT NULL DEFAULT 'Medium',
  status        VARCHAR(20) NOT NULL DEFAULT 'Active',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact / CMS inbound messages
CREATE TABLE IF NOT EXISTS "contact_messages" (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name   VARCHAR(255) NOT NULL,
  company     VARCHAR(255),
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50),
  message     TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'new',
  handled_by  UUID REFERENCES "users"(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clarification emails sent to vendors during audit review
CREATE TABLE IF NOT EXISTS "clarification_requests" (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id        UUID REFERENCES "vessels"(id) ON DELETE SET NULL,
  imo_number       VARCHAR(20) NOT NULL,
  vessel_name      VARCHAR(255),
  recipient_emails TEXT NOT NULL,
  cc_emails        TEXT,
  subject          VARCHAR(500) NOT NULL,
  body             TEXT NOT NULL,
  suspected_items  JSONB NOT NULL DEFAULT '[]'::jsonb,
  status           VARCHAR(20) NOT NULL DEFAULT 'sent',
  error_message    TEXT,
  sent_by          UUID REFERENCES "users"(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public upload token that goes in the clarification email body. Suppliers
-- click the link and upload docs without logging in. 72-hour expiry.
ALTER TABLE "clarification_requests" ADD COLUMN IF NOT EXISTS public_token VARCHAR(64) UNIQUE;
ALTER TABLE "clarification_requests" ADD COLUMN IF NOT EXISTS public_token_expires_at TIMESTAMPTZ;

-- Fields the supplier fills in on the public portal.
ALTER TABLE "clarification_requests" ADD COLUMN IF NOT EXISTS supplier_company VARCHAR(255);
ALTER TABLE "clarification_requests" ADD COLUMN IF NOT EXISTS supplier_contact_name VARCHAR(255);
ALTER TABLE "clarification_requests" ADD COLUMN IF NOT EXISTS supplier_comments TEXT;
ALTER TABLE "clarification_requests" ADD COLUMN IF NOT EXISTS prepared_date VARCHAR(50);
ALTER TABLE "clarification_requests" ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE "clarification_requests" ADD COLUMN IF NOT EXISTS submitted_by_ip VARCHAR(64);

-- Per-item state for a clarification request. Mirrors one row per entry in
-- clarification_requests.suspected_items (JSONB), tracking MDS document upload,
-- reminder count, HM classification etc. over time.
CREATE TABLE IF NOT EXISTS "clarification_items" (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clarification_id  UUID NOT NULL REFERENCES "clarification_requests"(id) ON DELETE CASCADE,
  item_index        INTEGER NOT NULL,
  mds_status        VARCHAR(20) NOT NULL DEFAULT 'pending',
  mds_file_path     VARCHAR(500),
  mds_file_name     VARCHAR(255),
  mds_received_at   TIMESTAMPTZ,
  reminder_count    INTEGER NOT NULL DEFAULT 0,
  hm_status         VARCHAR(20),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clarification_id, item_index)
);

-- Track who uploaded (captured on the supplier portal before upload).
ALTER TABLE "clarification_items" ADD COLUMN IF NOT EXISTS uploaded_by_email VARCHAR(255);
ALTER TABLE "clarification_items" ADD COLUMN IF NOT EXISTS uploaded_by_ip VARCHAR(64);

-- Each clarification item now tracks two distinct supplier documents:
--   * MD   (Material Declaration)        — stored in mds_status / mds_file_*
--   * SDoC (Supplier Declaration of      — stored in sdoc_status / sdoc_file_*
--           Conformity)
-- The legacy mds_* columns are reused as the MD slot (no migration needed).
ALTER TABLE "clarification_items" ADD COLUMN IF NOT EXISTS sdoc_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE "clarification_items" ADD COLUMN IF NOT EXISTS sdoc_file_path VARCHAR(500);
ALTER TABLE "clarification_items" ADD COLUMN IF NOT EXISTS sdoc_file_name VARCHAR(255);
ALTER TABLE "clarification_items" ADD COLUMN IF NOT EXISTS sdoc_received_at TIMESTAMPTZ;

-- Per-item admin review timestamp. NULL until the manager reviews the
-- uploaded MD / SDoC; set to NOW() once approved. Drives the
-- 'Reviewed Mds' filter pill in the PO viewer.
ALTER TABLE "clarification_items" ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE "clarification_items" ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255);

-- Generated reports — one row per PDF the user produces. The Quarterly
-- Archive tab reads from this; the file_path points at the cached PDF
-- so re-download is instant. file_path is null while a generation is
-- in flight (status='generating') and gets filled when the renderer
-- finishes.
CREATE TABLE IF NOT EXISTS "reports" (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id       UUID NOT NULL REFERENCES "vessels"(id) ON DELETE CASCADE,
  report_type     VARCHAR(50) NOT NULL, -- 'compliance', 'inventory', 'hazmat', 'quarterly'
  period_label    VARCHAR(64),          -- e.g. 'Q4 2025' or 'Ad Hoc 2026-04-30'
  period_start    DATE,
  period_end      DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'generating', -- generating|ready|failed
  file_name       VARCHAR(255),
  file_path       VARCHAR(500),
  file_size       INTEGER,
  generated_by    VARCHAR(255),
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vessels_created_by ON "vessels"(created_by_id);
CREATE INDEX IF NOT EXISTS idx_ga_plans_vessel ON "ga_plans"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_deck_areas_ga_plan ON "deck_areas"(ga_plan_id);
CREATE INDEX IF NOT EXISTS idx_audit_summaries_vessel ON "audit_summaries"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_summaries_status ON "audit_summaries"(status);
CREATE INDEX IF NOT EXISTS idx_decks_vessel ON "decks"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_materials_vessel ON "materials"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_materials_deck ON "materials"(deck_id);
CREATE INDEX IF NOT EXISTS idx_documents_vessel ON "documents"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON "documents"(document_type);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vessel ON "purchase_orders"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON "purchase_orders"(supplier_name);
CREATE INDEX IF NOT EXISTS idx_md_sdoc_vessel ON "md_sdoc_requests"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_md_sdoc_status ON "md_sdoc_requests"(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_name    ON "suppliers"(name);
CREATE INDEX IF NOT EXISTS idx_equipment_name    ON "equipment_master"(name);
CREATE INDEX IF NOT EXISTS idx_suspected_keyword ON "suspected_keywords"(keyword);
CREATE INDEX IF NOT EXISTS idx_contact_status    ON "contact_messages"(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_archived ON "menu_items"(archived);
CREATE INDEX IF NOT EXISTS idx_user_perm_user    ON "user_permissions"(user_id);
CREATE INDEX IF NOT EXISTS idx_role_perm_role    ON "role_permissions"(role_name);
CREATE INDEX IF NOT EXISTS idx_clarification_imo ON "clarification_requests"(imo_number);
CREATE INDEX IF NOT EXISTS idx_clarification_vessel ON "clarification_requests"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_clarif_items_clar ON "clarification_items"(clarification_id);
CREATE INDEX IF NOT EXISTS idx_clarif_items_status ON "clarification_items"(mds_status);
CREATE INDEX IF NOT EXISTS idx_clarif_public_token ON "clarification_requests"(public_token);
CREATE INDEX IF NOT EXISTS idx_audit_lines_audit ON "audit_line_items"(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_lines_vessel ON "audit_line_items"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_audit_lines_po ON "audit_line_items"(po_number);
CREATE INDEX IF NOT EXISTS idx_reports_vessel ON "reports"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON "reports"(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_period ON "reports"(period_start, period_end);

-- Backfill (idempotent, safe for fresh uploads):
-- Audits that were transitioned to 'In Progress' by the old send-mail code
-- (before 'Awaiting Clarification' existed) should snap into the new status
-- so they stop appearing in Pending Audits next to fresh uploads. We restrict
-- the update to audits whose vessel has clarification_items showing real
-- supplier activity (a received doc or at least one reminder fired) — that
-- way a vessel that was re-uploaded after old clarifications still slots
-- correctly into 'In Progress' as a fresh audit.
UPDATE audit_summaries a
   SET status = 'Awaiting Clarification', updated_at = NOW()
 WHERE a.status = 'In Progress'
   AND EXISTS (
     SELECT 1
       FROM clarification_requests cr
       JOIN clarification_items   ci ON ci.clarification_id = cr.id
      WHERE cr.vessel_id = a.vessel_id
        AND (ci.mds_status = 'received'
             OR ci.sdoc_status = 'received'
             OR ci.reminder_count > 0)
   );
`;

/** Retry the migration a few times with exponential backoff. Render's
 *  pre-start step runs this against the Supabase free DB, which can be
 *  paused/cold at the moment we connect — first attempts often fail
 *  with `Connection terminated unexpectedly` while the DB wakes up.
 *  Crashing the deploy is the wrong response; just wait it out. */
async function migrateWithRetry(maxAttempts = 5): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Running database migration (attempt ${attempt}/${maxAttempts})...`);
      await query(migration);
      console.log('Migration complete! All tables created.');
      return;
    } catch (err) {
      lastError = err;
      const msg = (err as Error).message || String(err);
      if (attempt < maxAttempts) {
        const waitMs = Math.min(30_000, 2_000 * 2 ** (attempt - 1)); // 2s, 4s, 8s, 16s, 30s cap
        console.warn(`Migration attempt ${attempt} failed (${msg}). Retrying in ${waitMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }
  throw lastError;
}

migrateWithRetry()
  .then(() => closePool())
  .catch((e) => {
    console.error('Migration failed after all retries:', e);
    process.exit(1);
  });
