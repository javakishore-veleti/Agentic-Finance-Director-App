-- ============================================================
-- Backfill organization_id on all domain tables
-- Sets to Acme US (HQ) default org: 00000000-0000-4000-a000-000000000010
-- Run: psql -h localhost -U afda -d afda_db -f scripts/backfill_org_id.sql
-- ============================================================

\set org_id '00000000-0000-4000-a000-000000000010'

-- Ensure column exists + backfill, for each table
DO $$
DECLARE
    tables text[] := ARRAY[
        'kpi_definitions', 'kpi_values', 'executive_briefings', 'action_items',
        'budgets', 'budget_line_items', 'variance_records', 'flux_commentaries',
        'forecasts', 'fpa_reports',
        'bank_accounts', 'cash_positions', 'cash_transactions', 'cash_forecasts',
        'ar_invoices', 'liquidity_metrics',
        'chart_of_accounts', 'journal_entries', 'journal_lines', 'trial_balances',
        'intercompany_transactions', 'reconciliations', 'recon_items',
        'close_periods', 'close_tasks',
        'alerts', 'alert_rules', 'risk_scores', 'alert_history',
        'service_registry', 'incidents', 'api_metrics_log'
    ];
    t text;
    cnt integer;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Add column if not exists
        EXECUTE format(
            'ALTER TABLE %I ADD COLUMN IF NOT EXISTS organization_id UUID', t
        );
        -- Create index
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS idx_%s_org_id ON %I(organization_id)', t, t
        );
        -- Backfill
        EXECUTE format(
            'UPDATE %I SET organization_id = %L WHERE organization_id IS NULL', t, '00000000-0000-4000-a000-000000000010'
        );
        GET DIAGNOSTICS cnt = ROW_COUNT;
        RAISE NOTICE '% — % rows backfilled', t, cnt;
    END LOOP;
END $$;

SELECT 'Backfill complete' AS status;
