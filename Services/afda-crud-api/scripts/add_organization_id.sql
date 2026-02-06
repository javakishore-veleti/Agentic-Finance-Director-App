-- ============================================================
-- Add organization_id to all domain tables
-- Run against: afda_db (CRUD API database)
-- ============================================================

-- Command Center
ALTER TABLE kpi_definitions ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE kpi_values ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE executive_briefings ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS organization_id UUID;

-- FPA
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE budget_line_items ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE variance_records ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE flux_commentaries ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE forecasts ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE fpa_reports ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Treasury
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE cash_positions ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE cash_transactions ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE cash_forecasts ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE liquidity_metrics ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Accounting
ALTER TABLE chart_of_accounts ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE journal_lines ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE trial_balances ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE intercompany_transactions ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE reconciliations ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE recon_items ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE close_periods ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE close_tasks ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Risk
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE risk_scores ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE alert_history ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Monitoring
ALTER TABLE service_registry ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE api_metrics_log ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kpi_definitions_org ON kpi_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_values_org ON kpi_values(organization_id);
CREATE INDEX IF NOT EXISTS idx_executive_briefings_org ON executive_briefings(organization_id);
CREATE INDEX IF NOT EXISTS idx_action_items_org ON action_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_budgets_org ON budgets(organization_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_items_org ON budget_line_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_variance_records_org ON variance_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_flux_commentaries_org ON flux_commentaries(organization_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_org ON forecasts(organization_id);
CREATE INDEX IF NOT EXISTS idx_fpa_reports_org ON fpa_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_org ON bank_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_cash_positions_org ON cash_positions(organization_id);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_org ON cash_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_cash_forecasts_org ON cash_forecasts(organization_id);
CREATE INDEX IF NOT EXISTS idx_ar_invoices_org ON ar_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_liquidity_metrics_org ON liquidity_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_org ON chart_of_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_org ON journal_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_org ON journal_lines(organization_id);
CREATE INDEX IF NOT EXISTS idx_trial_balances_org ON trial_balances(organization_id);
CREATE INDEX IF NOT EXISTS idx_intercompany_transactions_org ON intercompany_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_org ON reconciliations(organization_id);
CREATE INDEX IF NOT EXISTS idx_recon_items_org ON recon_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_close_periods_org ON close_periods(organization_id);
CREATE INDEX IF NOT EXISTS idx_close_tasks_org ON close_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_alerts_org ON alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_org ON alert_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_org ON risk_scores(organization_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_org ON alert_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_service_registry_org ON service_registry(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_org ON incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_metrics_log_org ON api_metrics_log(organization_id);

SELECT 'Migration complete: organization_id added to all domain tables' AS status;
