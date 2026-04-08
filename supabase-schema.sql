-- ============================================================
-- Invoicing App — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and run it
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT,
  email                TEXT UNIQUE NOT NULL,
  password             TEXT NOT NULL,
  company_name         TEXT,
  company_address      TEXT,
  company_email        TEXT,
  company_phone        TEXT,
  abn                  TEXT,
  hourly_rate          NUMERIC DEFAULT 85,
  gst_rate             NUMERIC DEFAULT 10,
  invoice_start_number INTEGER DEFAULT 1,
  bank_name            TEXT,
  bsb_number           TEXT,
  account_number       TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  company       TEXT,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  contact_name  TEXT,
  contact_email TEXT,
  contact_role  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  items          JSONB NOT NULL DEFAULT '[]',
  subtotal       NUMERIC DEFAULT 0,
  gst_rate       NUMERIC DEFAULT 10,
  gst_amount     NUMERIC DEFAULT 0,
  total          NUMERIC DEFAULT 0,
  status         TEXT DEFAULT 'draft',
  paid           BOOLEAN DEFAULT FALSE,
  due_date       DATE,
  start_date     DATE,
  end_date       DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
