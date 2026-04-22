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
`;

async function migrate() {
  console.log('Running database migration...');
  await query(migration);
  console.log('Migration complete! All tables created.');
  await closePool();
}

migrate().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
