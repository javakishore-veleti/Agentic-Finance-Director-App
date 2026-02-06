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
