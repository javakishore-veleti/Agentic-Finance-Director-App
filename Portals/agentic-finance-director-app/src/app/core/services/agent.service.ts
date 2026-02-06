import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AgentMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  tools?: string[];
  timestamp?: string;
}

export interface AgentRequest {
  message: string;
  sessionId: string;
  engine?: 'n8n' | 'langgraph' | 'bedrock';
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly baseUrl = environment.agentGatewayUrl;
  private ws: WebSocket | null = null;
  private messages$ = new Subject<AgentMessage>();

  constructor(private http: HttpClient) {}

  sendMessage(request: AgentRequest): Observable<AgentMessage> {
    return this.http.post<AgentMessage>(`${this.baseUrl}/api/agent/chat`, request);
  }

  getExecutions(limit = 50): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/api/agent/executions?limit=${limit}`);
  }

  getEngines(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/api/agent/engines`);
  }

  getWorkflows(engine?: string): Observable<unknown[]> {
    const params = engine ? `?engine=${engine}` : '';
    return this.http.get<unknown[]>(`${this.baseUrl}/api/agent/workflows${params}`);
  }

  connectWebSocket(sessionId: string): Subject<AgentMessage> {
    const wsUrl = environment.agentGatewayUrl.replace('http', 'ws');
    this.ws = new WebSocket(`${wsUrl}/ws/agent/${sessionId}`);
    this.ws.onmessage = (event) => this.messages$.next(JSON.parse(event.data));
    this.ws.onerror = (err) => console.error('[Agent WS Error]', err);
    return this.messages$;
  }

  disconnectWebSocket(): void {
    this.ws?.close();
    this.ws = null;
  }
}
