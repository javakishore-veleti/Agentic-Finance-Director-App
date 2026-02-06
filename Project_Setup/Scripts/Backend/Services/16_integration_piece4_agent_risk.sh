#!/bin/bash
###############################################################################
# 16_integration_piece4_agent_risk.sh
# Creates: Angular HTTP services for Agent Studio + Risk Intelligence modules
# Agent Studio uses AgentService (core) for gateway endpoints
# Risk maps to: /api/v1/risk/* backend endpoints
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

SRC="Portals/agentic-finance-director-app/src/app"

echo "🔧 [16] Integration Piece 4 — Agent Studio + Risk Intelligence services..."

# =============================================================================
# 1. Agent Studio service (wraps core AgentService with UI-specific logic)
# =============================================================================
mkdir -p "$SRC/modules/agent-studio/services"

cat > "$SRC/modules/agent-studio/services/agent-studio.service.ts" << 'EOF'
import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AgentService, AgentMessage, ChatRequest } from '../../../core/services/agent.service';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──
export interface ChatSession {
  id: string;
  title: string;
  engine: string;
  agent_id?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  engine: string;
  status: string;
  trigger_type: string;
  schedule?: string;
  last_run_at: string | null;
  run_count: number;
  created_at: string;
}

export interface Execution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  engine: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  input_summary: string;
  output_summary: string;
  error?: string;
  tokens_used: number;
}

export interface EngineConfig {
  id: string;
  engine_type: string;
  name: string;
  status: string;
  endpoint_url: string;
  api_key_masked: string;
  default_model: string;
  max_tokens: number;
  temperature: number;
  rate_limit_rpm: number;
  health_status: string;
  last_health_check: string | null;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  system_prompt: string;
  variables: string[];
  engine_compatibility: string[];
  usage_count: number;
  created_by: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AgentStudioService {
  // Local chat state
  readonly messages = signal<AgentMessage[]>([]);
  readonly isStreaming = signal(false);
  readonly activeSessionId = signal<string | null>(null);

  private sessionId = `session-${Date.now()}`;

  constructor(
    private agent: AgentService,
    private api: ApiService
  ) {}

  // ── Chat ──
  sendMessage(message: string, engine?: string): void {
    // Add user message locally
    this.messages.update(msgs => [...msgs, { role: 'user', content: message }]);
    this.isStreaming.set(true);

    const request: ChatRequest = {
      message,
      session_id: this.sessionId,
      engine
    };

    this.agent.sendMessage(request).subscribe({
      next: (response) => {
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: response.content || response.message || JSON.stringify(response) }]);
        this.isStreaming.set(false);
      },
      error: () => {
        this.messages.update(msgs => [...msgs, { role: 'system', content: 'Failed to get response. Is the Agent Gateway running?' }]);
        this.isStreaming.set(false);
      }
    });
  }

  getSessions(): Observable<ChatSession[]> {
    return this.agent.getSessions();
  }

  getChatHistory(sessionId: string): Observable<AgentMessage[]> {
    return this.agent.getChatHistory(sessionId);
  }

  clearChat(): void {
    this.messages.set([]);
    this.sessionId = `session-${Date.now()}`;
  }

  // ── WebSocket Chat ──
  connectRealtime(): void {
    this.agent.connectWebSocket(this.sessionId).subscribe(msg => {
      this.messages.update(msgs => [...msgs, msg]);
    });
  }

  sendRealtimeMessage(message: string): void {
    this.messages.update(msgs => [...msgs, { role: 'user', content: message }]);
    this.agent.sendWebSocketMessage(message);
  }

  disconnectRealtime(): void {
    this.agent.disconnectWebSocket();
  }

  // ── Workflows ──
  getWorkflows(engine?: string): Observable<Workflow[]> {
    return this.agent.getWorkflows(engine) as Observable<Workflow[]>;
  }

  getWorkflow(id: string): Observable<Workflow> {
    return this.agent.getWorkflow(id) as Observable<Workflow>;
  }

  triggerWorkflow(id: string, input?: any): Observable<any> {
    return this.agent.triggerWorkflow(id, input);
  }

  // ── Executions ──
  getExecutions(limit = 50): Observable<Execution[]> {
    return this.agent.getExecutions(limit) as Observable<Execution[]>;
  }

  getExecution(id: string): Observable<Execution> {
    return this.agent.getExecution(id) as Observable<Execution>;
  }

  // ── Engines ──
  getEngines(): Observable<EngineConfig[]> {
    return this.agent.getEngines() as Observable<EngineConfig[]>;
  }

  getEngine(id: string): Observable<EngineConfig> {
    return this.agent.getEngine(id) as Observable<EngineConfig>;
  }

  updateEngine(id: string, data: Partial<EngineConfig>): Observable<EngineConfig> {
    return this.agent.updateEngine(id, data) as Observable<EngineConfig>;
  }

  // ── Prompt Library (CRUD API side) ──
  getPromptTemplates(category?: string): Observable<PromptTemplate[]> {
    const params: any = {};
    if (category) params.category = category;
    return this.api.get<PromptTemplate[]>('/agent-studio/prompts', params);
  }

  getPromptTemplate(id: string): Observable<PromptTemplate> {
    return this.api.get<PromptTemplate>(`/agent-studio/prompts/${id}`);
  }

  createPromptTemplate(data: Partial<PromptTemplate>): Observable<PromptTemplate> {
    return this.api.post<PromptTemplate>('/agent-studio/prompts', data);
  }

  updatePromptTemplate(id: string, data: Partial<PromptTemplate>): Observable<PromptTemplate> {
    return this.api.put<PromptTemplate>(`/agent-studio/prompts/${id}`, data);
  }

  deletePromptTemplate(id: string): Observable<void> {
    return this.api.delete<void>(`/agent-studio/prompts/${id}`);
  }

  // ── SSE Streaming ──
  streamAgentEvents(executionId: string): Observable<MessageEvent> {
    return this.agent.streamEvents(`/executions/${executionId}/stream`);
  }
}
EOF

echo "  ✅ agent-studio.service.ts — chat, WS, workflows, executions, engines, prompts, SSE"

# =============================================================================
# 2. Risk Intelligence service (15 endpoints)
# =============================================================================
mkdir -p "$SRC/modules/risk-intelligence/services"

cat > "$SRC/modules/risk-intelligence/services/risk.service.ts" << 'EOF'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs ──
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  source: string;
  source_agent: string;
  status: string;
  assigned_to: string | null;
  acknowledged_at: string | null;
  resolved_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: string;
  condition_type: string;
  condition_config: Record<string, any>;
  severity: string;
  is_active: boolean;
  notification_channels: string[];
  cooldown_minutes: number;
  last_triggered_at: string | null;
  trigger_count: number;
  created_by: string;
  created_at: string;
}

export interface RiskScore {
  id: string;
  category: string;
  score: number;
  previous_score: number;
  trend: string;
  factors: string[];
  mitigation_status: string;
  assessed_by: string;
  assessed_at: string;
}

export interface RiskDashboardSummary {
  composite_score: number;
  composite_trend: string;
  active_alerts: number;
  critical_alerts: number;
  categories: RiskScore[];
}

@Injectable({ providedIn: 'root' })
export class RiskService {
  private readonly prefix = '/risk';

  constructor(private api: ApiService) {}

  // ── Alerts ──
  getAlerts(severity?: string, status?: string, category?: string, limit = 100, offset = 0): Observable<Alert[]> {
    const params: any = { limit, offset };
    if (severity) params.severity = severity;
    if (status) params.status = status;
    if (category) params.category = category;
    return this.api.get<Alert[]>(`${this.prefix}/alerts`, params);
  }

  getAlert(id: string): Observable<Alert> {
    return this.api.get<Alert>(`${this.prefix}/alerts/${id}`);
  }

  acknowledgeAlert(id: string): Observable<Alert> {
    return this.api.put<Alert>(`${this.prefix}/alerts/${id}/acknowledge`, {});
  }

  resolveAlert(id: string, resolution?: string): Observable<Alert> {
    return this.api.put<Alert>(`${this.prefix}/alerts/${id}/resolve`, { resolution });
  }

  getAlertHistory(days = 30): Observable<Alert[]> {
    return this.api.get<Alert[]>(`${this.prefix}/alerts/history`, { days });
  }

  getAlertStats(): Observable<any> {
    return this.api.get<any>(`${this.prefix}/alerts/stats`);
  }

  // ── Alert Rules ──
  getAlertRules(category?: string, is_active?: boolean): Observable<AlertRule[]> {
    const params: any = {};
    if (category) params.category = category;
    if (is_active !== undefined) params.is_active = is_active;
    return this.api.get<AlertRule[]>(`${this.prefix}/rules`, params);
  }

  getAlertRule(id: string): Observable<AlertRule> {
    return this.api.get<AlertRule>(`${this.prefix}/rules/${id}`);
  }

  createAlertRule(data: Partial<AlertRule>): Observable<AlertRule> {
    return this.api.post<AlertRule>(`${this.prefix}/rules`, data);
  }

  updateAlertRule(id: string, data: Partial<AlertRule>): Observable<AlertRule> {
    return this.api.put<AlertRule>(`${this.prefix}/rules/${id}`, data);
  }

  toggleAlertRule(id: string, is_active: boolean): Observable<AlertRule> {
    return this.api.patch<AlertRule>(`${this.prefix}/rules/${id}`, { is_active });
  }

  // ── Risk Dashboard ──
  getRiskDashboard(): Observable<RiskDashboardSummary> {
    return this.api.get<RiskDashboardSummary>(`${this.prefix}/dashboard`);
  }

  getRiskScores(): Observable<RiskScore[]> {
    return this.api.get<RiskScore[]>(`${this.prefix}/scores`);
  }

  getRiskTrend(category: string, days = 30): Observable<any[]> {
    return this.api.get<any[]>(`${this.prefix}/scores/${category}/trend`, { days });
  }
}
EOF

echo "  ✅ risk.service.ts — alerts, alert rules, risk dashboard, scores, trends"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "✅ [16] Integration Piece 4 complete!"
echo ""
echo "  Agent Studio service:"
echo "    → sendMessage(), clearChat(), connectRealtime()"
echo "    → getWorkflows(), triggerWorkflow()"
echo "    → getExecutions(), getExecution()"
echo "    → getEngines(), updateEngine()"
echo "    → getPromptTemplates(), createPromptTemplate()"
echo "    → streamAgentEvents() (SSE)"
echo ""
echo "  Risk Intelligence service (15 endpoints):"
echo "    → getAlerts(), acknowledgeAlert(), resolveAlert()"
echo "    → getAlertHistory(), getAlertStats()"
echo "    → getAlertRules(), createAlertRule(), toggleAlertRule()"
echo "    → getRiskDashboard(), getRiskScores(), getRiskTrend()"
echo ""
echo "  Next: Run 17_integration_piece5_monitoring_admin.sh"
