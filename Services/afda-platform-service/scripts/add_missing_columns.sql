-- Add missing columns to platform DB tables
-- Safe to re-run (IF NOT EXISTS / try-catch pattern)

ALTER TABLE platform_user ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE api_key ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP;
ALTER TABLE data_connection ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE platform_setting ADD COLUMN IF NOT EXISTS description VARCHAR(500);
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS actor_email VARCHAR(300);
