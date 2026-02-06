import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-service-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/monitoring">Monitoring</a>
      <span class="separator">/</span>
      <span class="current">Service Status</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Service Status</h1>
        <p class="afda-page-subtitle">Real-time health checks, uptime history, and dependency status for all platform services</p>
      </div>
      <div class="afda-page-actions">
        <div class="live-indicator">
          <span class="live-dot"></span>
          <span class="live-text">Live</span>
        </div>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-clock-history"></i> Incident Log
        </button>
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-arrow-clockwise"></i> Check All
        </button>
      </div>
    </div>

    <!-- Overall Status Bar -->
    <div class="overall-bar" [ngClass]="overallStatus">
      <div class="ob-icon">
        <i [class]="'bi ' + overallIcon"></i>
      </div>
      <div class="ob-info">
        <div class="ob-title">{{ overallTitle }}</div>
        <div class="ob-sub">{{ overallSub }}</div>
      </div>
      <div class="ob-stats">
        @for (s of overallStats; track s.label) {
          <div class="ob-stat">
            <span class="ob-stat-value font-mono">{{ s.value }}</span>
            <span class="ob-stat-label">{{ s.label }}</span>
          </div>
        }
      </div>
    </div>

    <!-- Service Groups -->
    @for (group of serviceGroups; track group.name) {
      <div class="service-group">
        <div class="sg-header">
          <div class="sg-title">{{ group.name }}</div>
          <div class="sg-summary">
            <span class="sg-count font-mono">{{ group.services.length }} services</span>
            <span class="sg-status-dot" [style.background]="getGroupStatusColor(group)"></span>
            <span class="sg-status-text" [style.color]="getGroupStatusColor(group)">{{ getGroupStatusText(group) }}</span>
          </div>
        </div>
        <div class="sg-grid">
          @for (svc of group.services; track svc.name) {
            <div class="svc-card" [class.expanded]="expandedService === svc.name" [class.degraded]="svc.status === 'Degraded'" [class.down]="svc.status === 'Down'">
              <div class="svc-header" (click)="toggleService(svc.name)">
                <div class="svc-status-indicator" [style.background]="getStatusColor(svc.status)"></div>
                <div class="svc-info">
                  <div class="svc-name-row">
                    <span class="svc-name">{{ svc.name }}</span>
                    <span class="svc-version font-mono">{{ svc.version }}</span>
                  </div>
                  <div class="svc-desc">{{ svc.desc }}</div>
                </div>
                <div class="svc-metrics">
                  <div class="svc-metric">
                    <span class="svm-value font-mono" [style.color]="getLatencyColor(svc.latency)">{{ svc.latency }}ms</span>
                    <span class="svm-label">Latency</span>
                  </div>
                  <div class="svc-metric">
                    <span class="svm-value font-mono">{{ svc.uptime }}%</span>
                    <span class="svm-label">Uptime</span>
                  </div>
                </div>
                <span class="svc-status-chip" [style.background]="getStatusBg(svc.status)" [style.color]="getStatusColor(svc.status)">
                  {{ svc.status }}
                </span>
                <i [class]="expandedService === svc.name ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" style="color: var(--text-tertiary); font-size: 14px;"></i>
              </div>

              @if (expandedService === svc.name) {
                <div class="svc-expanded">
                  <!-- Uptime Bar (30 days) -->
                  <div class="svc-uptime-section">
                    <div class="su-title">30-Day Uptime History</div>
                    <div class="su-bar">
                      @for (day of svc.uptimeHistory; track $index) {
                        <div class="su-day" [style.background]="day.color" [title]="day.tooltip"></div>
                      }
                    </div>
                    <div class="su-labels">
                      <span>30 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>

                  <!-- Health Checks -->
                  <div class="svc-detail-grid">
                    <div class="sd-section">
                      <div class="sd-title">Health Checks</div>
                      @for (check of svc.healthChecks; track check.name) {
                        <div class="hc-row">
                          <div class="hc-dot" [style.background]="getStatusColor(check.status)"></div>
                          <span class="hc-name">{{ check.name }}</span>
                          <span class="hc-value font-mono">{{ check.value }}</span>
                        </div>
                      }
                    </div>

                    <!-- Endpoints -->
                    <div class="sd-section">
                      <div class="sd-title">Endpoints</div>
                      @for (ep of svc.endpoints; track ep.path) {
                        <div class="ep-row">
                          <span class="ep-method" [ngClass]="'method-' + ep.method.toLowerCase()">{{ ep.method }}</span>
                          <span class="ep-path font-mono">{{ ep.path }}</span>
                          <span class="ep-status font-mono" [style.color]="getLatencyColor(ep.latency)">{{ ep.latency }}ms</span>
                        </div>
                      }
                    </div>

                    <!-- Dependencies -->
                    <div class="sd-section">
                      <div class="sd-title">Dependencies</div>
                      @for (dep of svc.dependencies; track dep.name) {
                        <div class="dep-row">
                          <div class="dep-dot" [style.background]="getStatusColor(dep.status)"></div>
                          <span class="dep-name">{{ dep.name }}</span>
                          <span class="dep-status" [style.color]="getStatusColor(dep.status)">{{ dep.status }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Recent Incidents -->
                  @if (svc.incidents.length > 0) {
                    <div class="svc-incidents">
                      <div class="sd-title">Recent Incidents</div>
                      @for (inc of svc.incidents; track inc.date) {
                        <div class="inc-row">
                          <div class="inc-dot" [style.background]="inc.color"></div>
                          <div class="inc-info">
                            <span class="inc-text">{{ inc.text }}</span>
                            <span class="inc-date font-mono">{{ inc.date }} · {{ inc.duration }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    }

    <!-- External Dependencies -->
    <div class="afda-card" style="margin-top: 16px; animation: fadeUp 0.4s ease 0.2s both;">
      <div class="afda-card-header">
        <div class="afda-card-title">External Dependencies</div>
        <span class="afda-badge afda-badge-low">{{ externalDeps.length }} monitored</span>
      </div>
      <div class="ext-grid">
        @for (dep of externalDeps; track dep.name) {
          <div class="ext-card">
            <div class="ext-header">
              <div class="ext-dot" [style.background]="getStatusColor(dep.status)"></div>
              <span class="ext-name">{{ dep.name }}</span>
              <span class="ext-status-chip" [style.background]="getStatusBg(dep.status)" [style.color]="getStatusColor(dep.status)">
                {{ dep.status }}
              </span>
            </div>
            <div class="ext-metrics">
              <span class="ext-metric font-mono">{{ dep.latency }}ms</span>
              <span class="ext-metric font-mono">{{ dep.uptime }}%</span>
            </div>
            <div class="ext-bar">
              @for (day of dep.history; track $index) {
                <div class="ext-bar-day" [style.background]="day"></div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .live-indicator {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 12px; background: #ECFDF5;
      border-radius: 20px; border: 1px solid #A7F3D0;
    }

    .live-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #059669;
      animation: pulse 2s infinite;
    }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

    .live-text { font-size: 11px; font-weight: 700; color: #059669; }

    /* Overall Bar */
    .overall-bar {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 24px; border-radius: var(--radius-lg);
      margin-bottom: 20px; animation: fadeUp 0.4s ease both;
      &.operational { background: linear-gradient(135deg, #ECFDF5, #D1FAE5); border: 1px solid #A7F3D0; }
      &.degraded { background: linear-gradient(135deg, #FFFBEB, #FEF3C7); border: 1px solid #FDE68A; }
      &.outage { background: linear-gradient(135deg, #FEF2F2, #FEE2E2); border: 1px solid #FCA5A5; }
    }

    .ob-icon { font-size: 28px; }
    .operational .ob-icon { color: #059669; }

    .ob-info { flex: 1; }
    .ob-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .ob-sub { font-size: 12px; color: var(--text-secondary); }

    .ob-stats { display: flex; gap: 28px; }

    .ob-stat { text-align: center; }
    .ob-stat-value { display: block; font-size: 16px; font-weight: 800; color: var(--text-primary); }
    .ob-stat-label { display: block; font-size: 10px; color: var(--text-tertiary); }

    /* Service Groups */
    .service-group { margin-bottom: 20px; }

    .sg-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px;
    }

    .sg-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }

    .sg-summary { display: flex; align-items: center; gap: 8px; }
    .sg-count { font-size: 11px; color: var(--text-tertiary); }
    .sg-status-dot { width: 7px; height: 7px; border-radius: 50%; }
    .sg-status-text { font-size: 11px; font-weight: 600; }

    .sg-grid { display: flex; flex-direction: column; gap: 6px; }

    /* Service Card */
    .svc-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-md); overflow: hidden;
      box-shadow: var(--shadow-sm); transition: all 0.15s;
      animation: fadeUp 0.3s ease both;
      &:hover { border-color: #D1D5DB; }
      &.expanded { box-shadow: var(--shadow-md); border-color: var(--primary); }
      &.degraded { border-left: 3px solid #D97706; }
      &.down { border-left: 3px solid #DC2626; }
    }

    .svc-header {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 18px; cursor: pointer;
      transition: background 0.1s;
      &:hover { background: var(--bg-section); }
    }

    .svc-status-indicator {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }

    .svc-info { flex: 1; min-width: 0; }

    .svc-name-row { display: flex; align-items: center; gap: 8px; }
    .svc-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .svc-version { font-size: 10px; color: var(--text-tertiary); background: var(--bg-section); padding: 1px 6px; border-radius: 4px; }
    .svc-desc { font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px; }

    .svc-metrics { display: flex; gap: 20px; }

    .svc-metric { text-align: center; min-width: 60px; }
    .svm-value { display: block; font-size: 14px; font-weight: 700; }
    .svm-label { display: block; font-size: 9px; color: var(--text-tertiary); text-transform: uppercase; }

    .svc-status-chip {
      font-size: 10px; font-weight: 700; padding: 3px 10px;
      border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px;
    }

    /* Expanded */
    .svc-expanded {
      padding: 0 18px 16px;
      border-top: 1px solid var(--border-light);
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }

    /* Uptime Bar */
    .svc-uptime-section { padding: 14px 0; }

    .su-title {
      font-size: 10.5px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;
    }

    .su-bar { display: flex; gap: 2px; height: 24px; }

    .su-day {
      flex: 1; border-radius: 2px; cursor: default;
      transition: transform 0.1s;
      &:hover { transform: scaleY(1.2); }
    }

    .su-labels {
      display: flex; justify-content: space-between;
      font-size: 9px; color: var(--text-tertiary); margin-top: 4px;
    }

    /* Detail Grid */
    .svc-detail-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 20px; padding: 12px 0;
    }

    .sd-title {
      font-size: 10.5px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px;
    }

    .hc-row {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .hc-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .hc-name { font-size: 12px; color: var(--text-secondary); flex: 1; }
    .hc-value { font-size: 11px; font-weight: 600; }

    .ep-row {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .ep-method {
      font-size: 9px; font-weight: 800; padding: 1px 6px;
      border-radius: 3px; text-transform: uppercase;
      &.method-get { background: #ECFDF5; color: #059669; }
      &.method-post { background: #EFF6FF; color: #2563EB; }
      &.method-put { background: #FEF3C7; color: #92400E; }
    }

    .ep-path { font-size: 11px; color: var(--text-primary); flex: 1; }
    .ep-status { font-size: 11px; font-weight: 600; }

    .dep-row {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .dep-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .dep-name { font-size: 12px; color: var(--text-secondary); flex: 1; }
    .dep-status { font-size: 11px; font-weight: 600; }

    /* Incidents */
    .svc-incidents { padding-top: 12px; border-top: 1px solid var(--border-light); }

    .inc-row {
      display: flex; gap: 10px; padding: 8px 0;
      border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .inc-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .inc-info { flex: 1; }
    .inc-text { font-size: 12px; color: var(--text-secondary); display: block; }
    .inc-date { font-size: 10px; color: var(--text-tertiary); }

    /* External Dependencies */
    .ext-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
    }

    .ext-card {
      padding: 12px 14px; background: var(--bg-section);
      border: 1px solid var(--border-light); border-radius: var(--radius-sm);
    }

    .ext-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .ext-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .ext-name { font-size: 12px; font-weight: 700; color: var(--text-primary); flex: 1; }

    .ext-status-chip {
      font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 8px;
    }

    .ext-metrics {
      display: flex; gap: 12px; margin-bottom: 8px;
      font-size: 12px; font-weight: 600; color: var(--text-secondary);
    }

    .ext-bar { display: flex; gap: 1px; height: 10px; }

    .ext-bar-day {
      flex: 1; border-radius: 1px;
      min-width: 2px;
    }

    @media (max-width: 1100px) {
      .svc-detail-grid { grid-template-columns: 1fr; }
      .ext-grid { grid-template-columns: repeat(2, 1fr); }
      .svc-metrics { display: none; }
    }
  `]
})
export class ServiceStatusComponent {
  expandedService = '';
  overallStatus = 'operational';
  overallIcon = 'bi-shield-check';
  overallTitle = 'All Services Operational';
  overallSub = 'Last checked 12 seconds ago · Next check in 48s';

  overallStats = [
    { value: '14/14', label: 'Services Up' },
    { value: '99.94%', label: 'Avg Uptime' },
    { value: '38ms', label: 'Avg Latency' },
    { value: '0', label: 'Incidents (24h)' },
  ];

  generateUptimeHistory(uptimePct: number): any[] {
    const days = [];
    for (let i = 0; i < 30; i++) {
      const r = Math.random();
      if (r > (uptimePct / 100) * 0.98) {
        days.push({ color: '#D97706', tooltip: `Day ${30 - i}: Partial degradation` });
      } else if (r > (uptimePct / 100) * 0.99 + 0.005) {
        days.push({ color: '#DC2626', tooltip: `Day ${30 - i}: Outage` });
      } else {
        days.push({ color: '#059669', tooltip: `Day ${30 - i}: 100% uptime` });
      }
    }
    return days;
  }

  serviceGroups = [
    {
      name: 'Core Application Services',
      services: [
        {
          name: 'Angular Portal', version: 'v18.2', desc: 'Frontend web application', status: 'Operational',
          latency: 12, uptime: 99.99,
          uptimeHistory: this.generateUptimeHistory(99.99),
          healthChecks: [
            { name: 'HTTP Response', status: 'Operational', value: '200 OK' },
            { name: 'Bundle Load', status: 'Operational', value: '1.2s' },
            { name: 'WebSocket', status: 'Operational', value: 'Connected' },
          ],
          endpoints: [
            { method: 'GET', path: '/', latency: 12 },
            { method: 'GET', path: '/assets/config.json', latency: 4 },
          ],
          dependencies: [
            { name: 'Nginx Proxy', status: 'Operational' },
            { name: 'Flask CRUD API', status: 'Operational' },
          ],
          incidents: []
        },
        {
          name: 'Flask CRUD API', version: 'v2.1.4', desc: 'RESTful data operations (port 8000)', status: 'Operational',
          latency: 18, uptime: 99.96,
          uptimeHistory: this.generateUptimeHistory(99.96),
          healthChecks: [
            { name: 'HTTP Health', status: 'Operational', value: '200 OK' },
            { name: 'DB Connection Pool', status: 'Operational', value: '8/20 active' },
            { name: 'Request Queue', status: 'Operational', value: '0 pending' },
          ],
          endpoints: [
            { method: 'GET', path: '/api/v1/health', latency: 4 },
            { method: 'GET', path: '/api/v1/transactions', latency: 22 },
            { method: 'POST', path: '/api/v1/journal-entries', latency: 38 },
            { method: 'PUT', path: '/api/v1/forecasts/:id', latency: 28 },
          ],
          dependencies: [
            { name: 'PostgreSQL', status: 'Operational' },
            { name: 'Redis Cache', status: 'Operational' },
          ],
          incidents: [
            { text: 'Connection pool exhaustion during batch import', date: 'Jan 31', duration: '8 min', color: '#D97706' },
          ]
        },
        {
          name: 'FastAPI Agent Gateway', version: 'v1.3.2', desc: 'Agent orchestration API (port 8001)', status: 'Operational',
          latency: 42, uptime: 99.88,
          uptimeHistory: this.generateUptimeHistory(99.88),
          healthChecks: [
            { name: 'HTTP Health', status: 'Operational', value: '200 OK' },
            { name: 'Agent Registry', status: 'Operational', value: '8 agents' },
            { name: 'Task Queue', status: 'Operational', value: '3 queued' },
            { name: 'WebSocket Streams', status: 'Operational', value: '12 active' },
          ],
          endpoints: [
            { method: 'GET', path: '/api/v1/agents', latency: 8 },
            { method: 'POST', path: '/api/v1/agents/:id/run', latency: 142 },
            { method: 'GET', path: '/api/v1/runs/:id/stream', latency: 6 },
            { method: 'POST', path: '/api/v1/chat', latency: 280 },
          ],
          dependencies: [
            { name: 'LangGraph Engine', status: 'Operational' },
            { name: 'n8n Orchestrator', status: 'Operational' },
            { name: 'PostgreSQL', status: 'Operational' },
            { name: 'Redis Cache', status: 'Operational' },
          ],
          incidents: [
            { text: 'Elevated latency during concurrent graph execution', date: 'Feb 6', duration: '15 min', color: '#D97706' },
          ]
        },
      ]
    },
    {
      name: 'AI / Agent Engines',
      services: [
        {
          name: 'LangGraph Server', version: 'v0.4.2', desc: 'Primary agent execution engine', status: 'Operational',
          latency: 42, uptime: 99.42,
          uptimeHistory: this.generateUptimeHistory(99.42),
          healthChecks: [
            { name: 'Graph Executor', status: 'Operational', value: '4 active' },
            { name: 'Checkpoint Store', status: 'Operational', value: '2.1 GB' },
            { name: 'Memory Backend', status: 'Operational', value: 'Redis OK' },
          ],
          endpoints: [
            { method: 'POST', path: '/runs', latency: 148 },
            { method: 'GET', path: '/runs/:id', latency: 8 },
            { method: 'POST', path: '/threads', latency: 12 },
          ],
          dependencies: [
            { name: 'PostgreSQL (state)', status: 'Operational' },
            { name: 'Redis (memory)', status: 'Operational' },
            { name: 'Anthropic API', status: 'Operational' },
            { name: 'OpenAI API', status: 'Operational' },
          ],
          incidents: [
            { text: 'Latency spike 42ms → 218ms during batch close', date: 'Feb 6', duration: '15 min', color: '#D97706' },
            { text: 'Checkpoint store disk full', date: 'Jan 28', duration: '45 min', color: '#DC2626' },
          ]
        },
        {
          name: 'n8n Orchestrator', version: 'v1.72.1', desc: 'Workflow automation engine', status: 'Operational',
          latency: 38, uptime: 99.82,
          uptimeHistory: this.generateUptimeHistory(99.82),
          healthChecks: [
            { name: 'Workflow Engine', status: 'Operational', value: '3 active' },
            { name: 'Worker Pool', status: 'Operational', value: '4/8 busy' },
            { name: 'Webhook Listener', status: 'Operational', value: 'Listening' },
          ],
          endpoints: [
            { method: 'POST', path: '/webhook/:id', latency: 12 },
            { method: 'GET', path: '/api/v1/workflows', latency: 8 },
            { method: 'POST', path: '/api/v1/executions', latency: 42 },
          ],
          dependencies: [
            { name: 'PostgreSQL (n8n)', status: 'Operational' },
          ],
          incidents: []
        },
        {
          name: 'AWS Bedrock (us-east-1)', version: 'v2024.12', desc: 'Managed LLM inference', status: 'Operational',
          latency: 68, uptime: 99.95,
          uptimeHistory: this.generateUptimeHistory(99.95),
          healthChecks: [
            { name: 'Runtime API', status: 'Operational', value: 'Available' },
            { name: 'Guardrails', status: 'Operational', value: 'Active' },
            { name: 'Provisioned Throughput', status: 'Operational', value: '2 units' },
          ],
          endpoints: [
            { method: 'POST', path: '/model/invoke', latency: 68 },
            { method: 'POST', path: '/model/invoke-stream', latency: 42 },
          ],
          dependencies: [
            { name: 'AWS IAM', status: 'Operational' },
            { name: 'AWS CloudWatch', status: 'Operational' },
          ],
          incidents: []
        },
      ]
    },
    {
      name: 'Data & Infrastructure',
      services: [
        {
          name: 'PostgreSQL', version: 'v16.2', desc: 'Primary relational database', status: 'Operational',
          latency: 4, uptime: 99.99,
          uptimeHistory: this.generateUptimeHistory(99.99),
          healthChecks: [
            { name: 'Connection Pool', status: 'Operational', value: '12/100' },
            { name: 'Replication Lag', status: 'Operational', value: '0ms' },
            { name: 'Disk Usage', status: 'Operational', value: '42 GB / 100 GB' },
            { name: 'Active Queries', status: 'Operational', value: '4' },
          ],
          endpoints: [],
          dependencies: [],
          incidents: []
        },
        {
          name: 'Redis Cache', version: 'v7.2', desc: 'In-memory cache and message broker', status: 'Operational',
          latency: 2, uptime: 99.99,
          uptimeHistory: this.generateUptimeHistory(99.99),
          healthChecks: [
            { name: 'Memory Usage', status: 'Operational', value: '1.2 GB / 8 GB' },
            { name: 'Connected Clients', status: 'Operational', value: '18' },
            { name: 'Hit Rate', status: 'Operational', value: '94.2%' },
          ],
          endpoints: [],
          dependencies: [],
          incidents: [
            { text: 'Memory peak triggered eviction policy', date: 'Feb 6', duration: '2 min', color: '#D97706' },
          ]
        },
        {
          name: 'Nginx Reverse Proxy', version: 'v1.25', desc: 'Load balancer and SSL termination', status: 'Operational',
          latency: 1, uptime: 99.99,
          uptimeHistory: this.generateUptimeHistory(99.99),
          healthChecks: [
            { name: 'Worker Processes', status: 'Operational', value: '4 active' },
            { name: 'SSL Certificate', status: 'Operational', value: 'Valid (82d)' },
            { name: 'Rate Limiting', status: 'Operational', value: 'Active' },
          ],
          endpoints: [],
          dependencies: [],
          incidents: []
        },
        {
          name: 'Prometheus', version: 'v2.48', desc: 'Metrics collection and alerting', status: 'Operational',
          latency: 6, uptime: 99.98,
          uptimeHistory: this.generateUptimeHistory(99.98),
          healthChecks: [
            { name: 'Scrape Targets', status: 'Operational', value: '9/9 up' },
            { name: 'Storage', status: 'Operational', value: '8.4 GB' },
            { name: 'Alert Rules', status: 'Operational', value: '28 active' },
          ],
          endpoints: [
            { method: 'GET', path: '/api/v1/query', latency: 12 },
            { method: 'GET', path: '/-/healthy', latency: 1 },
          ],
          dependencies: [],
          incidents: []
        },
        {
          name: 'Grafana', version: 'v10.2', desc: 'Dashboards and visualization', status: 'Operational',
          latency: 14, uptime: 99.97,
          uptimeHistory: this.generateUptimeHistory(99.97),
          healthChecks: [
            { name: 'API Health', status: 'Operational', value: '200 OK' },
            { name: 'Dashboards', status: 'Operational', value: '12 loaded' },
            { name: 'Data Sources', status: 'Operational', value: '3 connected' },
          ],
          endpoints: [
            { method: 'GET', path: '/api/health', latency: 6 },
          ],
          dependencies: [
            { name: 'Prometheus', status: 'Operational' },
          ],
          incidents: []
        },
      ]
    }
  ];

  externalDeps = [
    { name: 'Anthropic API', status: 'Operational', latency: 180, uptime: 99.98, history: this.genExtHistory(99.98) },
    { name: 'OpenAI API', status: 'Operational', latency: 220, uptime: 99.95, history: this.genExtHistory(99.95) },
    { name: 'AWS Bedrock', status: 'Operational', latency: 68, uptime: 99.95, history: this.genExtHistory(99.95) },
    { name: 'Plaid API', status: 'Operational', latency: 145, uptime: 99.90, history: this.genExtHistory(99.90) },
    { name: 'Stripe API', status: 'Operational', latency: 92, uptime: 99.99, history: this.genExtHistory(99.99) },
    { name: 'SendGrid', status: 'Operational', latency: 110, uptime: 99.96, history: this.genExtHistory(99.96) },
    { name: 'Slack API', status: 'Operational', latency: 85, uptime: 99.98, history: this.genExtHistory(99.98) },
    { name: 'AWS S3', status: 'Operational', latency: 22, uptime: 99.99, history: this.genExtHistory(99.99) },
  ];

  genExtHistory(uptimePct: number): string[] {
    const colors = [];
    for (let i = 0; i < 14; i++) {
      const r = Math.random();
      if (r > uptimePct / 100 * 0.98) colors.push('#D97706');
      else colors.push('#059669');
    }
    return colors;
  }

  toggleService(name: string) {
    this.expandedService = this.expandedService === name ? '' : name;
  }

  getStatusColor(status: string): string {
    const m: any = { Operational: '#059669', Degraded: '#D97706', Down: '#DC2626' };
    return m[status] || '#6B7280';
  }

  getStatusBg(status: string): string {
    const m: any = { Operational: '#ECFDF5', Degraded: '#FEF3C7', Down: '#FEE2E2' };
    return m[status] || '#F3F4F6';
  }

  getLatencyColor(ms: number): string {
    if (ms > 200) return '#DC2626';
    if (ms > 100) return '#D97706';
    return '#059669';
  }

  getGroupStatusColor(group: any): string {
    if (group.services.some((s: any) => s.status === 'Down')) return '#DC2626';
    if (group.services.some((s: any) => s.status === 'Degraded')) return '#D97706';
    return '#059669';
  }

  getGroupStatusText(group: any): string {
    if (group.services.some((s: any) => s.status === 'Down')) return 'Outage';
    if (group.services.some((s: any) => s.status === 'Degraded')) return 'Degraded';
    return 'All Operational';
  }
}