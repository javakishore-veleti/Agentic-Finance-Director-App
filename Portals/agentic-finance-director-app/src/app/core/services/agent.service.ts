import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent_id?: string;
  tools_used?: string[];
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  engine?: string;
  agent_id?: string;
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly base = environment.agentBaseUrl;
  private ws: WebSocket | null = null;
  private messageSubject = new Subject<AgentMessage>();

  constructor(private http: HttpClient) {}

  // ── Chat ──
  sendMessage(request: ChatRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.base}/chat`, request).pipe(map(r => r.data));
  }

  getChatHistory(sessionId: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/chat/history/${sessionId}`).pipe(map(r => r.data));
  }

  getSessions(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/chat/sessions`).pipe(map(r => r.data));
  }

  // ── Engines ──
  getEngines(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/engines`).pipe(map(r => r.data));
  }

  getEngine(engineId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.base}/engines/${engineId}`).pipe(map(r => r.data));
  }

  updateEngine(engineId: string, data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.base}/engines/${engineId}`, data).pipe(map(r => r.data));
  }

  // ── Workflows ──
  getWorkflows(engine?: string): Observable<any[]> {
    const params = engine ? `?engine=${engine}` : '';
    return this.http.get<ApiResponse<any[]>>(`${this.base}/workflows${params}`).pipe(map(r => r.data));
  }

  getWorkflow(workflowId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.base}/workflows/${workflowId}`).pipe(map(r => r.data));
  }

  triggerWorkflow(workflowId: string, input?: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.base}/workflows/${workflowId}/trigger`, input || {}).pipe(map(r => r.data));
  }

  // ── Executions ──
  getExecutions(limit = 50): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.base}/executions?limit=${limit}`).pipe(map(r => r.data));
  }

  getExecution(executionId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.base}/executions/${executionId}`).pipe(map(r => r.data));
  }

  // ── WebSocket ──
  connectWebSocket(sessionId: string): Subject<AgentMessage> {
    const wsUrl = environment.wsBaseUrl;
    this.ws = new WebSocket(`${wsUrl}/ws/agent/${sessionId}`);
    this.ws.onmessage = (event) => {
      try { this.messageSubject.next(JSON.parse(event.data)); }
      catch { this.messageSubject.next({ role: 'assistant', content: event.data }); }
    };
    this.ws.onerror = () => this.messageSubject.next({ role: 'system', content: 'Connection error' });
    this.ws.onclose = () => this.messageSubject.next({ role: 'system', content: 'Disconnected' });
    return this.messageSubject;
  }

  sendWebSocketMessage(message: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ message }));
    }
  }

  disconnectWebSocket(): void {
    this.ws?.close();
    this.ws = null;
  }

  // ── SSE Stream ──
  streamEvents(endpoint: string): Observable<MessageEvent> {
    return new Observable(observer => {
      const eventSource = new EventSource(`${this.base}${endpoint}`);
      eventSource.onmessage = (event) => observer.next(event);
      eventSource.onerror = (err) => observer.error(err);
      return () => eventSource.close();
    });
  }
}
