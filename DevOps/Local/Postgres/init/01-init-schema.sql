-- ═══════════════════════════════════════════════════════════════
--  Agentic Finance Director App — Bootstrap Schema
--  Runs automatically on first PostgreSQL start
-- ═══════════════════════════════════════════════════════════════

-- ─── FP&A: Budget vs Actuals ────────────────────────────────
CREATE TABLE IF NOT EXISTS fpa_budget_actuals (
    id              SERIAL PRIMARY KEY,
    period          VARCHAR(20)     NOT NULL,
    department      VARCHAR(100),
    category        VARCHAR(100),
    budget_amount   NUMERIC(15,2),
    actual_amount   NUMERIC(15,2),
    variance_amount NUMERIC(15,2)   GENERATED ALWAYS AS (actual_amount - budget_amount) STORED,
    variance_pct    NUMERIC(8,4),
    commentary      TEXT,
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fpa_period     ON fpa_budget_actuals(period);
CREATE INDEX IF NOT EXISTS idx_fpa_department ON fpa_budget_actuals(department);

-- ─── Treasury: Daily Cash Positions ─────────────────────────
CREATE TABLE IF NOT EXISTS treasury_cash_positions (
    id              SERIAL PRIMARY KEY,
    as_of_date      DATE            NOT NULL,
    account_name    VARCHAR(200),
    bank_name       VARCHAR(200),
    currency        CHAR(3)         DEFAULT 'USD',
    opening_balance NUMERIC(15,2),
    inflows         NUMERIC(15,2)   DEFAULT 0,
    outflows        NUMERIC(15,2)   DEFAULT 0,
    closing_balance NUMERIC(15,2),
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treasury_date    ON treasury_cash_positions(as_of_date);
CREATE INDEX IF NOT EXISTS idx_treasury_account ON treasury_cash_positions(account_name);

-- ─── Treasury: 13-Week Cash Forecast ────────────────────────
CREATE TABLE IF NOT EXISTS treasury_cash_forecast (
    id                SERIAL PRIMARY KEY,
    forecast_date     DATE            NOT NULL,
    week_number       INT             NOT NULL,
    category          VARCHAR(100),
    projected_inflow  NUMERIC(15,2)   DEFAULT 0,
    projected_outflow NUMERIC(15,2)   DEFAULT 0,
    net_cash_flow     NUMERIC(15,2)   GENERATED ALWAYS AS (projected_inflow - projected_outflow) STORED,
    confidence        VARCHAR(20)     DEFAULT 'medium',
    created_at        TIMESTAMPTZ     DEFAULT NOW()
);

-- ─── Accounting: GL Summary ─────────────────────────────────
CREATE TABLE IF NOT EXISTS accounting_gl_summary (
    id              SERIAL PRIMARY KEY,
    period          VARCHAR(20)     NOT NULL,
    account_code    VARCHAR(20),
    account_name    VARCHAR(200),
    debit           NUMERIC(15,2)   DEFAULT 0,
    credit          NUMERIC(15,2)   DEFAULT 0,
    net_balance     NUMERIC(15,2),
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gl_period  ON accounting_gl_summary(period);
CREATE INDEX IF NOT EXISTS idx_gl_account ON accounting_gl_summary(account_code);

-- ─── Executive Summaries ────────────────────────────────────
CREATE TABLE IF NOT EXISTS executive_summaries (
    id              SERIAL PRIMARY KEY,
    generated_at    TIMESTAMPTZ     DEFAULT NOW(),
    summary_type    VARCHAR(50),
    content         JSONB,
    routing_json    JSONB,
    token_usage     INT,
    session_id      VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_exec_summary_type ON executive_summaries(summary_type);
CREATE INDEX IF NOT EXISTS idx_exec_session      ON executive_summaries(session_id);

-- ─── Risk Alerts ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_alerts (
    id              SERIAL PRIMARY KEY,
    alert_type      VARCHAR(50)     NOT NULL,
    severity        VARCHAR(20)     NOT NULL DEFAULT 'medium',
    title           VARCHAR(300),
    description     TEXT,
    source_tool     VARCHAR(50),
    is_resolved     BOOLEAN         DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_severity ON risk_alerts(severity, is_resolved);
