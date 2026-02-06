#!/bin/bash
###############################################################################
# 13_integration_piece1_proxy_core.sh
# Creates: Angular proxy config, environment update, core API service fix
# Purpose: Route Angular dev server → CRUD API (:8000) + Agent Gateway (:8001)
# Run from: git repo root (Agentic-Finance-Director-App/)
###############################################################################
set -e

PORTAL="Portals/agentic-finance-director-app"
SRC="$PORTAL/src"
CORE="$SRC/app/core"

echo "🔧 [13] Integration Piece 1 — Proxy + Core Services..."

# =============================================================================
# 1. Angular proxy config (routes /api calls to backends)
# =============================================================================
cat > "$PORTAL/proxy.conf.json" << 'EOF'
{
  "/api/v1/agent": {
    "target": "http://localhost:8001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/ws": {
    "target": "http://localhost:8001",
    "secure": false,
    "ws": true,
    "changeOrigin": true
  },
  "/api/v1": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
EOF

echo "  ✅ proxy.conf.json created"

# =============================================================================
# 2. Update angular.json to use proxy config
# =============================================================================
# We use node to safely patch angular.json
node -e "
const fs = require('fs');
const path = '$PORTAL/angular.json';
const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
const projectName = Object.keys(cfg.projects)[0];
const serve = cfg.projects[projectName].architect.serve;

// Add proxyConfig to options (applies to all configs)
if (!serve.options) serve.options = {};
serve.options.proxyConfig = 'proxy.conf.json';

fs.writeFileSync(path, JSON.stringify(cfg, null, 2));
console.log('  ✅ angular.json patched with proxyConfig');
"

# =============================================================================
# 3. Environment files (use relative URLs — proxy handles routing)
# =============================================================================
mkdir -p "$SRC/environments"

cat > "$SRC/environments/environment.ts" << 'EOF'
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  agentBaseUrl: '/api/v1/agent',
  wsBaseUrl: 'ws://localhost:8001',
  grafanaUrl: 'http://localhost:3000',
};
EOF

cat > "$SRC/environments/environment.prod.ts" << 'EOF'
export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  agentBaseUrl: '/api/v1/agent',
  wsBaseUrl: '/ws',
  grafanaUrl: '/grafana',
};
EOF

echo "  ✅ environment.ts + environment.prod.ts created"

# =============================================================================
# 4. Core API Response model (matches FastAPI ApiResponse wrapper)
# =============================================================================
mkdir -p "$CORE/models"

cat > "$CORE/models/api-response.model.ts" << 'EOF'
/**
 * Matches the backend ApiResponse[T] wrapper:
 *   { success: bool, data: T, message?: str, errors?: list }
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
}
EOF

echo "  ✅ api-response.model.ts created"

# =============================================================================
# 5. Core API Gateway service (unified HTTP client with unwrap)
# =============================================================================
mkdir -p "$CORE/services"

cat > "$CORE/services/api.service.ts" << 'EOF'
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET with automatic ApiResponse unwrap → returns just `data`
   */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http
      .get<ApiResponse<T>>(`${this.base}${endpoint}`, { params: httpParams })
      .pipe(map(r => r.data));
  }

  /**
   * GET raw — returns full ApiResponse (useful when you need message/errors)
   */
  getRaw<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.base}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.base}${endpoint}`, body)
      .pipe(map(r => r.data));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.base}${endpoint}`, body)
      .pipe(map(r => r.data));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.base}${endpoint}`, body)
      .pipe(map(r => r.data));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.base}${endpoint}`)
      .pipe(map(r => r.data));
  }
}
EOF

echo "  ✅ api.service.ts created (unified HTTP client with ApiResponse unwrap)"

# =============================================================================
# 6. Agent Gateway service (WebSocket + HTTP for agent endpoints)
# =============================================================================
cat > "$CORE/services/agent.service.ts" << 'EOF'
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
EOF

echo "  ✅ agent.service.ts created (chat, engines, workflows, executions, WS, SSE)"

# =============================================================================
# 7. Error interceptor (handles API errors globally)
# =============================================================================
mkdir -p "$CORE/interceptors"

cat > "$CORE/interceptors/error.interceptor.ts" << 'EOF'
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        notify.error('Cannot reach server. Is the backend running?');
      } else if (error.status === 401) {
        notify.warning('Session expired. Please log in again.');
      } else if (error.status === 403) {
        notify.warning('You do not have permission for this action.');
      } else if (error.status >= 500) {
        notify.error('Server error. Please try again later.');
      } else if (error.error?.message) {
        notify.error(error.error.message);
      }
      return throwError(() => error);
    })
  );
};
EOF

echo "  ✅ error.interceptor.ts created"

# =============================================================================
# 8. Notification service (toast system)
# =============================================================================
cat > "$CORE/services/notification.service.ts" << 'EOF'
import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) { this.add('success', message); }
  error(message: string)   { this.add('error', message); }
  warning(message: string) { this.add('warning', message); }
  info(message: string)    { this.add('info', message); }

  private add(type: Toast['type'], message: string) {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
EOF

echo "  ✅ notification.service.ts created"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "✅ [13] Integration Piece 1 complete!"
echo ""
echo "  Files created/updated:"
echo "    → proxy.conf.json         — Routes /api/v1/* → :8000, /api/v1/agent/* → :8001, /ws → :8001"
echo "    → angular.json            — Patched with proxyConfig"
echo "    → environments/           — environment.ts + environment.prod.ts (relative URLs)"
echo "    → core/models/            — api-response.model.ts (matches FastAPI ApiResponse<T>)"
echo "    → core/services/          — api.service.ts (unified HTTP + unwrap)"
echo "    →                         — agent.service.ts (chat, WS, SSE, engines, workflows)"
echo "    →                         — notification.service.ts (toast system)"
echo "    → core/interceptors/      — error.interceptor.ts (global error handling)"
echo ""
echo "  Proxy routing:"
echo "    /api/v1/agent/*  → http://localhost:8001  (Agent Gateway)"
echo "    /ws/*            → ws://localhost:8001     (WebSocket)"
echo "    /api/v1/*        → http://localhost:8000   (CRUD API)"
echo ""
echo "  Usage in components:"
echo "    // Inject ApiService for CRUD endpoints"
echo "    this.api.get<KPI[]>('/command-center/kpis')"
echo "    this.api.post<Budget>('/fpa/budgets', payload)"
echo ""
echo "    // Inject AgentService for agent endpoints"
echo "    this.agent.sendMessage({ message: 'Analyze Q4' })"
echo "    this.agent.connectWebSocket('session-123')"
echo ""
echo "  ⚡ Restart ng serve to pick up proxy config"
echo "  Next: Run 14_integration_piece2_command_fpa.sh"
