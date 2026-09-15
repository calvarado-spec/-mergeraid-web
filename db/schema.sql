-- ============================================================
-- MIGRATION BLOCK
-- Run these statements once against an existing database that
-- was created before this schema file was introduced.
-- ============================================================
--
-- CREATE INDEX IF NOT EXISTS idx_answers_deal_id ON answers (deal_id);
-- CREATE INDEX IF NOT EXISTS idx_state_sales_deal_id ON state_sales (deal_id);
-- CREATE INDEX IF NOT EXISTS idx_answers_deal_question ON answers (deal_id, question_id, created_at DESC);
-- ALTER TABLE state_sales ADD CONSTRAINT uq_state_sales_deal_q_state UNIQUE (deal_id, question_id, state);
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_deals_id ON deals (id);
--
-- Note: invoice_requests table (if present) is no longer used and may be dropped.
-- ============================================================

-- Users (auth)
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      TEXT   NOT NULL UNIQUE,
  password   TEXT   NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  client_name TEXT,
  target_name TEXT,
  deal_name   TEXT,
  deal_type   TEXT NOT NULL CHECK (deal_type IN ('asset', 'equity')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answers (append-only; DISTINCT ON (question_id) ORDER BY created_at DESC gives current value)
CREATE TABLE IF NOT EXISTS answers (
  id          SERIAL PRIMARY KEY,
  deal_id     UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answers_deal_id ON answers (deal_id);
CREATE INDEX IF NOT EXISTS idx_answers_deal_question ON answers (deal_id, question_id, created_at DESC);

-- State-level data (one row per deal + question_id + state)
-- question_id values: income_tax_nexus, sales_tax_nexus, employment_tax_states,
--                     physical_nexus, pl86272_states
-- year_1 is NULL for skipAmounts flows (employment_tax_states, physical_nexus, pl86272_states)
CREATE TABLE IF NOT EXISTS state_sales (
  id          SERIAL PRIMARY KEY,
  deal_id     UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  state       TEXT NOT NULL,
  year_1      NUMERIC,
  year_2      NUMERIC,
  year_3      NUMERIC,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_state_sales_deal_q_state UNIQUE (deal_id, question_id, state)
);

CREATE INDEX IF NOT EXISTS idx_state_sales_deal_id ON state_sales (deal_id);
