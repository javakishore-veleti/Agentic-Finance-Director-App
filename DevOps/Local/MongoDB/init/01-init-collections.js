// ═══════════════════════════════════════════════════════════════
//  Agentic Finance Director App — MongoDB Bootstrap
//  Runs automatically on first MongoDB start
// ═══════════════════════════════════════════════════════════════

db = db.getSiblingDB("afda_db");

// ─── Collections ────────────────────────────────────────────
db.createCollection("agent_conversations");
db.createCollection("workflow_runs");
db.createCollection("risk_alerts");
db.createCollection("executive_reports");
db.createCollection("data_feeds");
db.createCollection("audit_log");

// ─── Indexes ────────────────────────────────────────────────
db.agent_conversations.createIndex({ session_id: 1 });
db.agent_conversations.createIndex({ created_at: -1 });
db.agent_conversations.createIndex({ user_id: 1, created_at: -1 });

db.workflow_runs.createIndex({ workflow_name: 1, started_at: -1 });
db.workflow_runs.createIndex({ status: 1 });

db.risk_alerts.createIndex({ severity: 1, created_at: -1 });
db.risk_alerts.createIndex({ is_resolved: 1, severity: 1 });

db.executive_reports.createIndex({ report_type: 1, generated_at: -1 });

db.data_feeds.createIndex({ feed_name: 1, received_at: -1 });

db.audit_log.createIndex({ action: 1, timestamp: -1 });
db.audit_log.createIndex({ user_id: 1, timestamp: -1 });

print("✅ AFDA MongoDB collections and indexes initialized");
