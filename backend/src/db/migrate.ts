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
  last_activity           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Decks table
CREATE TABLE IF NOT EXISTS "decks" (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vessel_id   UUID NOT NULL REFERENCES "vessels"(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  level       INTEGER NOT NULL,
  ga_plan_url VARCHAR(500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vessels_created_by ON "vessels"(created_by_id);
CREATE INDEX IF NOT EXISTS idx_ga_plans_vessel ON "ga_plans"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_deck_areas_ga_plan ON "deck_areas"(ga_plan_id);
CREATE INDEX IF NOT EXISTS idx_audit_summaries_vessel ON "audit_summaries"(vessel_id);
CREATE INDEX IF NOT EXISTS idx_decks_vessel ON "decks"(vessel_id);
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
