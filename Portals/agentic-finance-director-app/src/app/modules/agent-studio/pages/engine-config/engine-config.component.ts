import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-engine-config',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/agent-studio/agent-console">Agent Studio</a>
      <span class="separator">/</span>
      <span class="current">Engine Config</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Engine Configuration</h1>
        <p class="afda-page-subtitle">Orchestration engines, LLM models, and runtime settings</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline" (click)="testAllConnections()">
          <i class="bi bi-arrow-clockwise"></i> Test Connections
        </button>
        <button class="afda-btn afda-btn-primary" (click)="openAddEngine()">
          <i class="bi bi-plus-lg"></i> Add Engine
        </button>
      </div>
    </div>

    <!-- Engine Summary Stats -->
    <div class="engine-summary stagger">
      @for (s of engineSummary; track s.label) {
        <div class="es-card">
          <div class="es-icon" [style.background]="s.iconBg">
            <i [class]="'bi ' + s.icon" [style.color]="s.iconColor"></i>
          </div>
          <div>
            <div class="es-value font-mono">{{ s.value }}</div>
            <div class="es-label">{{ s.label }}</div>
          </div>
        </div>
      }
    </div>

    <!-- Engine Instance List -->
    <div class="engine-list stagger">
      @for (engine of configuredEngines; track engine.id) {
        <div class="engine-card" [class.active]="engine.enabled" [class.expanded]="expandedEngine === engine.id">
          <!-- Card Header (always visible) -->
          <div class="ec-header" (click)="toggleEngine(engine.id)">
            <div class="ec-logo" [style.background]="getEngineType(engine.type).logoBg">
              <i [class]="'bi ' + getEngineType(engine.type).logoIcon"
                 [style.color]="getEngineType(engine.type).logoColor" style="font-size: 20px;"></i>
            </div>
            <div class="ec-info">
              <div class="ec-name">{{ engine.name }}</div>
              <div class="ec-type-row">
                <span class="ec-type-chip" [style.background]="getEngineType(engine.type).chipBg"
                      [style.color]="getEngineType(engine.type).chipColor">{{ engine.type }}</span>
                <span class="ec-version font-mono">{{ engine.version }}</span>
              </div>
            </div>
            <div class="ec-status-col">
              <div class="ec-conn-dot" [style.background]="engine.connected ? '#059669' : '#DC2626'"></div>
              <span class="ec-conn-text">{{ engine.connected ? 'Connected' : 'Disconnected' }}</span>
              <span class="ec-latency font-mono">{{ engine.latency }}</span>
            </div>
            <div class="ec-metrics-mini">
              @for (m of engine.metrics; track m.label) {
                <div class="ecm-mini">
                  <span class="ecm-mini-value font-mono">{{ m.value }}</span>
                  <span class="ecm-mini-label">{{ m.label }}</span>
                </div>
              }
            </div>
            <div class="ec-toggle" [class.on]="engine.enabled"
                 (click)="engine.enabled = !engine.enabled; $event.stopPropagation()">
              <div class="ec-toggle-knob"></div>
            </div>
            <button class="ec-expand-btn">
              <i [class]="expandedEngine === engine.id ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
            </button>
          </div>

          <!-- Expanded Config Panel -->
          @if (expandedEngine === engine.id) {
            <div class="ec-expanded">
              <div class="ec-expanded-grid">
                <!-- Dynamic Config Fields -->
                <div class="ec-config-section">
                  <div class="ecs-title">Connection Settings</div>
                  @for (field of engine.connectionFields; track field.label) {
                    <div class="ec-field">
                      <label class="ec-field-label">{{ field.label }}</label>
                      @if (field.type === 'text' || field.type === 'password') {
                        <div class="ec-input-wrap">
                          <input [type]="field.type" [value]="field.value" class="ec-input font-mono">
                          @if (field.type === 'password') {
                            <i class="bi bi-eye-slash ec-input-icon"></i>
                          }
                        </div>
                      }
                      @if (field.type === 'select') {
                        <select class="ec-select">
                          @for (opt of field.options; track opt) {
                            <option [selected]="opt === field.value">{{ opt }}</option>
                          }
                        </select>
                      }
                      @if (field.type === 'number') {
                        <input type="number" [value]="field.value" class="ec-input font-mono">
                      }
                    </div>
                  }
                </div>

                <!-- Engine-Specific Config -->
                <div class="ec-config-section">
                  <div class="ecs-title">{{ engine.type }}-Specific Settings</div>
                  @for (field of engine.engineFields; track field.label) {
                    <div class="ec-field">
                      <label class="ec-field-label">{{ field.label }}</label>
                      @if (field.type === 'text' || field.type === 'password') {
                        <div class="ec-input-wrap">
                          <input [type]="field.type" [value]="field.value" class="ec-input font-mono">
                        </div>
                      }
                      @if (field.type === 'select') {
                        <select class="ec-select">
                          @for (opt of field.options; track opt) {
                            <option [selected]="opt === field.value">{{ opt }}</option>
                          }
                        </select>
                      }
                      @if (field.type === 'number') {
                        <input type="number" [value]="field.value" class="ec-input font-mono">
                      }
                      @if (field.type === 'toggle') {
                        <div class="ec-toggle small" [class.on]="field.value === 'true'"
                             (click)="field.value = field.value === 'true' ? 'false' : 'true'">
                          <div class="ec-toggle-knob"></div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Assigned Agents -->
                <div class="ec-config-section">
                  <div class="ecs-title">Assigned Agents</div>
                  @if (engine.agents.length > 0) {
                    @for (agent of engine.agents; track agent.name) {
                      <div class="assigned-agent">
                        <div class="aa-dot" [style.background]="agent.color"></div>
                        <span class="aa-name">{{ agent.name }}</span>
                        <span class="aa-status">{{ agent.status }}</span>
                      </div>
                    }
                  } @else {
                    <div class="ec-empty">No agents assigned</div>
                  }
                </div>
              </div>

              <!-- Action Bar -->
              <div class="ec-action-bar">
                <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 14px;"
                        (click)="$event.stopPropagation()">
                  <i class="bi bi-arrow-clockwise"></i> Test Connection
                </button>
                <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 14px;">
                  <i class="bi bi-clipboard"></i> Duplicate
                </button>
                <div style="flex: 1;"></div>
                <button class="afda-btn afda-btn-outline" style="font-size: 11.5px; padding: 6px 14px; color: #DC2626; border-color: #FCA5A5;"
                        (click)="deleteEngine(engine.id); $event.stopPropagation()">
                  <i class="bi bi-trash3"></i> Delete
                </button>
                <button class="afda-btn afda-btn-primary" style="font-size: 11.5px; padding: 6px 14px;">
                  <i class="bi bi-check-lg"></i> Save
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Add Engine Modal -->
    @if (showAddEngine) {
      <div class="modal-overlay" (click)="showAddEngine = false">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Add Engine Instance</h3>
            <button class="modal-close" (click)="showAddEngine = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <div class="modal-step-label">1. Select Engine Type</div>
            <div class="engine-type-grid">
              @for (et of engineTypes; track et.type) {
                <div class="et-option" [class.selected]="newEngineType === et.type"
                     (click)="selectEngineType(et.type)">
                  <div class="et-icon" [style.background]="et.logoBg">
                    <i [class]="'bi ' + et.logoIcon" [style.color]="et.logoColor" style="font-size: 22px;"></i>
                  </div>
                  <div class="et-name">{{ et.type }}</div>
                  <div class="et-desc">{{ et.shortDesc }}</div>
                </div>
              }
            </div>
            @if (newEngineType) {
              <div class="modal-step-label" style="margin-top: 20px;">2. Configure Instance</div>
              <div class="modal-fields">
                <div class="ec-field">
                  <label class="ec-field-label">Instance Name</label>
                  <input type="text" class="ec-input" [placeholder]="newEngineType + ' - Primary'">
                </div>
                <div class="ec-field">
                  <label class="ec-field-label">Version</label>
                  <input type="text" class="ec-input font-mono" [value]="getEngineType(newEngineType).defaultVersion">
                </div>
                @for (field of getNewEngineFields(); track field.label) {
                  <div class="ec-field">
                    <label class="ec-field-label">{{ field.label }}</label>
                    @if (field.type === 'text' || field.type === 'password') {
                      <div class="ec-input-wrap">
                        <input [type]="field.type" [placeholder]="field.placeholder || ''" class="ec-input font-mono">
                        @if (field.type === 'password') {
                          <i class="bi bi-eye-slash ec-input-icon"></i>
                        }
                      </div>
                    }
                    @if (field.type === 'select') {
                      <select class="ec-select">
                        @for (opt of field.options; track opt) {
                          <option>{{ opt }}</option>
                        }
                      </select>
                    }
                  </div>
                }
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-outline" (click)="showAddEngine = false">Cancel</button>
            <button class="afda-btn afda-btn-primary" [class.disabled]="!newEngineType">
              <i class="bi bi-plus-lg"></i> Add Engine
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Per-Engine Resources Section -->
    <div class="per-engine-section">
      <!-- Engine Tabs -->
      <div class="engine-tabs">
        @for (engine of enabledEngines; track engine.id) {
          <button class="engine-tab" [class.active]="selectedResourceEngine === engine.id"
                  (click)="selectedResourceEngine = engine.id">
            <div class="et-tab-icon" [style.background]="getEngineType(engine.type).logoBg">
              <i [class]="'bi ' + getEngineType(engine.type).logoIcon"
                 [style.color]="getEngineType(engine.type).logoColor" style="font-size: 12px;"></i>
            </div>
            <span>{{ engine.name }}</span>
            <div class="et-tab-dot" [style.background]="engine.connected ? '#059669' : '#DC2626'"></div>
          </button>
        }
      </div>

      <!-- Scoped Content -->
      @if (selectedEngineData) {
        <div class="config-grid">
          <!-- LLM Models for this engine -->
          <div class="afda-card" style="animation: fadeUp 0.4s ease 0.14s both;">
            <div class="afda-card-header">
              <div>
                <div class="afda-card-title">LLM Model Configuration</div>
                <div class="scoped-subtitle">
                  <div class="scoped-dot" [style.background]="getEngineType(selectedEngineData.type).logoColor"></div>
                  {{ selectedEngineData.name }}
                </div>
              </div>
              <button class="afda-btn afda-btn-outline" style="font-size: 11px; padding: 4px 10px;">
                <i class="bi bi-plus-lg"></i> Add Model
              </button>
            </div>
            <table class="afda-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Provider</th>
                  <th>Use Case</th>
                  <th>Temperature</th>
                  <th>Max Tokens</th>
                  <th>Cost/1K</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (model of selectedEngineData.llmModels; track model.name) {
                  <tr>
                    <td>
                      <div class="model-cell">
                        <div class="model-dot" [style.background]="model.color"></div>
                        <div>
                          <div class="model-name">{{ model.name }}</div>
                          <div class="model-id font-mono">{{ model.modelId }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="provider-chip" [style.background]="model.providerBg" [style.color]="model.providerColor">
                        {{ model.provider }}
                      </span>
                    </td>
                    <td style="font-size: 12px; color: var(--text-secondary);">{{ model.useCase }}</td>
                    <td class="font-mono" style="font-size: 12px;">{{ model.temperature }}</td>
                    <td class="font-mono" style="font-size: 12px;">{{ model.maxTokens }}</td>
                    <td class="font-mono" style="font-size: 12px;">{{ model.costPer1k }}</td>
                    <td><span class="afda-badge" [ngClass]="model.badgeClass">{{ model.status }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Rate Limits + Health for this engine -->
          <div class="config-side">
            <div class="afda-card" style="animation: fadeUp 0.4s ease 0.16s both;">
              <div class="afda-card-header" style="margin-bottom: 8px;">
                <div class="afda-card-title">Rate Limits & Quotas</div>
              </div>
              <div class="scoped-subtitle" style="margin-bottom: 10px;">
                <div class="scoped-dot" [style.background]="getEngineType(selectedEngineData.type).logoColor"></div>
                {{ selectedEngineData.name }}
              </div>
              @for (limit of selectedEngineData.rateLimits; track limit.label) {
                <div class="limit-row">
                  <div class="limit-info">
                    <span class="limit-label">{{ limit.label }}</span>
                    <span class="limit-usage font-mono">{{ limit.used }} / {{ limit.max }}</span>
                  </div>
                  <div class="limit-bar">
                    <div class="limit-bar-fill" [style.width.%]="limit.pct"
                         [style.background]="limit.pct > 80 ? '#DC2626' : limit.pct > 60 ? '#D97706' : 'var(--primary)'">
                    </div>
                  </div>
                  <span class="limit-pct font-mono" [class.text-unfavorable]="limit.pct > 80">{{ limit.pct }}%</span>
                </div>
              }
            </div>

            <div class="afda-card" style="margin-top: 14px; animation: fadeUp 0.4s ease 0.18s both;">
              <div class="afda-card-header">
                <div class="afda-card-title">Service Health</div>
                <span class="afda-badge" [ngClass]="selectedEngineData.healthBadge">{{ selectedEngineData.healthLabel }}</span>
              </div>
              <div class="scoped-subtitle" style="margin-bottom: 10px;">
                <div class="scoped-dot" [style.background]="getEngineType(selectedEngineData.type).logoColor"></div>
                {{ selectedEngineData.name }}
              </div>
              @for (svc of selectedEngineData.services; track svc.name) {
                <div class="health-row">
                  <div class="health-dot" [style.background]="svc.healthy ? '#059669' : '#DC2626'"></div>
                  <span class="health-name">{{ svc.name }}</span>
                  <span class="health-latency font-mono">{{ svc.latency }}</span>
                  <span class="health-uptime font-mono">{{ svc.uptime }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Engine Summary */
    .engine-summary {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 12px; margin-bottom: 20px;
    }

    .es-card {
      display: flex; align-items: center; gap: 12px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 14px 16px;
      box-shadow: var(--shadow-sm);
      animation: fadeUp 0.4s ease both;
    }

    .es-icon {
      width: 38px; height: 38px; border-radius: var(--radius-md);
      display: grid; place-items: center; font-size: 16px; flex-shrink: 0;
    }

    .es-value { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .es-label { font-size: 11px; color: var(--text-tertiary); }

    /* Engine List */
    .engine-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }

    .engine-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
      box-shadow: var(--shadow-card);
      animation: fadeUp 0.4s ease both;
      transition: border-color 0.15s;
      &:hover { border-color: #D1D5DB; }
      &.active { border-left: 3px solid var(--primary); }
      &.expanded { box-shadow: var(--shadow-md); }
    }

    .ec-header {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; cursor: pointer;
      transition: background 0.1s;
      &:hover { background: var(--bg-section); }
    }

    .ec-logo {
      width: 42px; height: 42px; border-radius: var(--radius-md);
      display: grid; place-items: center; flex-shrink: 0;
    }

    .ec-info { flex: 1; min-width: 0; }
    .ec-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .ec-type-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; }

    .ec-type-chip {
      display: inline-flex; padding: 1px 8px; font-size: 10px;
      font-weight: 600; border-radius: 10px;
    }

    .ec-version { font-size: 10.5px; color: var(--text-tertiary); }

    .ec-status-col { display: flex; align-items: center; gap: 6px; min-width: 140px; }

    .ec-conn-dot {
      width: 8px; height: 8px; border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .ec-conn-text { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
    .ec-latency { font-size: 11px; color: var(--text-tertiary); }

    .ec-metrics-mini { display: flex; gap: 16px; }

    .ecm-mini { text-align: center; min-width: 50px; }
    .ecm-mini-value { display: block; font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .ecm-mini-label { display: block; font-size: 9.5px; color: var(--text-tertiary); text-transform: uppercase; }

    .ec-toggle {
      width: 40px; height: 22px; background: #D1D5DB;
      border-radius: 11px; position: relative; cursor: pointer;
      transition: background 0.2s; flex-shrink: 0;
      &.on { background: var(--primary); }
      &.small { width: 34px; height: 18px; }
    }

    .ec-toggle-knob {
      width: 18px; height: 18px; background: white;
      border-radius: 50%; position: absolute; top: 2px; left: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      transition: left 0.2s;
    }

    .ec-toggle.on .ec-toggle-knob { left: 20px; }
    .ec-toggle.small .ec-toggle-knob { width: 14px; height: 14px; }
    .ec-toggle.small.on .ec-toggle-knob { left: 18px; }

    .ec-expand-btn {
      background: none; border: none; color: var(--text-tertiary);
      cursor: pointer; padding: 4px; font-size: 16px;
    }

    /* Expanded Panel */
    .ec-expanded {
      padding: 0 20px 16px;
      border-top: 1px solid var(--border-light);
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 800px; }
    }

    .ec-expanded-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 20px; padding: 16px 0;
    }

    .ecs-title {
      font-size: 11.5px; font-weight: 700; color: var(--text-primary);
      margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.3px;
    }

    .ec-field { margin-bottom: 10px; }

    .ec-field-label {
      display: block; font-size: 10.5px; font-weight: 600;
      color: var(--text-tertiary); text-transform: uppercase;
      letter-spacing: 0.3px; margin-bottom: 3px;
    }

    .ec-input-wrap { position: relative; }

    .ec-input {
      width: 100%; padding: 7px 10px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 12px;
      background: var(--bg-section); color: var(--text-primary);
      box-sizing: border-box; font-family: var(--font-sans);
      outline: none; transition: border-color 0.15s;
      &:focus { border-color: var(--primary); }
      &::placeholder { color: var(--text-tertiary); }
    }

    .ec-input-icon {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      color: var(--text-tertiary); font-size: 14px; cursor: pointer;
    }

    .ec-select {
      width: 100%; padding: 7px 10px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 12px;
      background: var(--bg-white); color: var(--text-primary);
      font-family: var(--font-sans);
    }

    .assigned-agent {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .aa-dot { width: 8px; height: 8px; border-radius: 50%; }
    .aa-name { font-size: 12.5px; font-weight: 500; flex: 1; }
    .aa-status { font-size: 11px; color: var(--text-tertiary); }

    .ec-empty { font-size: 12px; color: var(--text-tertiary); font-style: italic; padding: 8px 0; }

    .ec-action-bar {
      display: flex; gap: 8px; padding-top: 14px;
      border-top: 1px solid var(--border-light);
    }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: grid; place-items: center; z-index: 1000;
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-panel {
      background: var(--bg-card); border-radius: var(--radius-lg);
      box-shadow: 0 24px 48px rgba(0,0,0,0.2);
      width: 680px; max-height: 85vh; overflow-y: auto;
      animation: scaleIn 0.2s ease;
    }

    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--border-light);
    }

    .modal-title { font-size: 16px; font-weight: 700; margin: 0; }

    .modal-close {
      background: none; border: none; font-size: 18px;
      color: var(--text-tertiary); cursor: pointer;
      &:hover { color: var(--text-primary); }
    }

    .modal-body { padding: 20px 24px; }

    .modal-step-label {
      font-size: 12px; font-weight: 700; color: var(--text-primary);
      margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.3px;
    }

    .engine-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

    .et-option {
      padding: 16px; border: 2px solid var(--border);
      border-radius: var(--radius-md); cursor: pointer;
      text-align: center; transition: all 0.15s;
      &:hover { border-color: var(--primary); background: var(--primary-subtle); }
      &.selected { border-color: var(--primary); background: var(--primary-light); box-shadow: 0 0 0 2px var(--primary-light); }
    }

    .et-icon {
      width: 48px; height: 48px; border-radius: var(--radius-md);
      display: grid; place-items: center; margin: 0 auto 8px;
    }

    .et-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .et-desc { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }

    .modal-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 16px 24px; border-top: 1px solid var(--border-light);
    }

    .disabled { opacity: 0.5; pointer-events: none; }

    /* ===== Per-Engine Resources Section ===== */
    .per-engine-section { margin-top: 0; }

    .engine-tabs {
      display: flex; gap: 4px; padding: 4px;
      background: var(--bg-section); border-radius: var(--radius-md);
      margin-bottom: 16px; overflow-x: auto;
    }

    .engine-tab {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; font-size: 12.5px; font-weight: 500;
      border: none; border-radius: var(--radius-sm);
      background: transparent; color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
      font-family: var(--font-sans);
      &:hover { background: var(--bg-white); color: var(--text-primary); }
      &.active {
        background: var(--bg-white); color: var(--primary);
        font-weight: 600; box-shadow: var(--shadow-sm);
      }
    }

    .et-tab-icon {
      width: 22px; height: 22px; border-radius: 4px;
      display: grid; place-items: center; flex-shrink: 0;
    }

    .et-tab-dot {
      width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
    }

    .scoped-subtitle {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; color: var(--text-tertiary); font-weight: 500;
      margin-top: 2px;
    }

    .scoped-dot { width: 7px; height: 7px; border-radius: 50%; }

    /* Config Grid */
    .config-grid {
      display: grid; grid-template-columns: 1fr 340px;
      gap: 16px;
    }

    .config-side { display: flex; flex-direction: column; }

    .model-cell { display: flex; align-items: center; gap: 8px; }
    .model-dot { width: 8px; height: 8px; border-radius: 3px; flex-shrink: 0; }
    .model-name { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
    .model-id { font-size: 10px; color: var(--text-tertiary); }

    .provider-chip {
      display: inline-flex; padding: 2px 8px; font-size: 10px;
      font-weight: 600; border-radius: 10px;
    }

    /* Rate Limits */
    .limit-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
    .limit-info { flex: 1; }
    .limit-label { display: block; font-size: 12px; color: var(--text-primary); }
    .limit-usage { display: block; font-size: 10.5px; color: var(--text-tertiary); }

    .limit-bar {
      width: 80px; height: 6px; background: var(--border-light);
      border-radius: 10px; overflow: hidden;
    }

    .limit-bar-fill { height: 100%; border-radius: 10px; }
    .limit-pct { font-size: 12px; font-weight: 600; min-width: 32px; text-align: right; }

    /* Health */
    .health-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .health-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .health-name { font-size: 12px; font-weight: 500; flex: 1; }
    .health-latency { font-size: 11px; color: var(--text-tertiary); min-width: 50px; }
    .health-uptime { font-size: 11px; color: #059669; min-width: 50px; text-align: right; }

    @media (max-width: 1200px) {
      .engine-summary { grid-template-columns: repeat(3, 1fr); }
      .ec-metrics-mini { display: none; }
      .ec-expanded-grid { grid-template-columns: 1fr; }
      .config-grid { grid-template-columns: 1fr; }
      .engine-type-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class EngineConfigComponent {
  expandedEngine = '';
  showAddEngine = false;
  newEngineType = '';
  selectedResourceEngine = 'lg-primary';

  engineSummary = [
    { value: '6', label: 'Engine Instances', icon: 'bi-cpu', iconBg: '#E8F5F1', iconColor: '#0D6B5C' },
    { value: '5', label: 'Connected', icon: 'bi-link-45deg', iconBg: '#ECFDF5', iconColor: '#059669' },
    { value: '10', label: 'Agents Assigned', icon: 'bi-robot', iconBg: '#EFF6FF', iconColor: '#2563EB' },
    { value: '1,340', label: 'Runs This Week', icon: 'bi-lightning', iconBg: '#FEF3C7', iconColor: '#D97706' },
    { value: '99.6%', label: 'Avg Uptime', icon: 'bi-graph-up', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
  ];

  engineTypes = [
    { type: 'LangGraph', logoIcon: 'bi-diagram-3', logoBg: '#E8F5F1', logoColor: '#0D6B5C', chipBg: '#E8F5F1', chipColor: '#0D6B5C', shortDesc: 'Multi-agent orchestration', defaultVersion: 'v0.4.2' },
    { type: 'n8n', logoIcon: 'bi-shuffle', logoBg: '#FEF3C7', logoColor: '#D97706', chipBg: '#FEF3C7', chipColor: '#92400E', shortDesc: 'Workflow automation', defaultVersion: 'v1.72.1' },
    { type: 'AWS Bedrock', logoIcon: 'bi-cloud', logoBg: '#EFF6FF', logoColor: '#2563EB', chipBg: '#EFF6FF', chipColor: '#1E40AF', shortDesc: 'Managed AI models', defaultVersion: 'v2024.12' },
    { type: 'CrewAI', logoIcon: 'bi-people', logoBg: '#EDE9FE', logoColor: '#7C3AED', chipBg: '#EDE9FE', chipColor: '#5B21B6', shortDesc: 'Collaborative AI agents', defaultVersion: 'v0.28.0' },
    { type: 'AutoGen', logoIcon: 'bi-gear-wide-connected', logoBg: '#FCE7F3', logoColor: '#DB2777', chipBg: '#FCE7F3', chipColor: '#9D174D', shortDesc: 'Multi-agent conversations', defaultVersion: 'v0.4.0' },
    { type: 'Custom', logoIcon: 'bi-code-slash', logoBg: '#F3F4F6', logoColor: '#374151', chipBg: '#F3F4F6', chipColor: '#374151', shortDesc: 'Custom REST/gRPC engine', defaultVersion: 'v1.0.0' },
  ];

  configuredEngines: any[] = [
    {
      id: 'lg-primary', name: 'LangGraph Primary', type: 'LangGraph', version: 'v0.4.2',
      enabled: true, connected: true, latency: '42ms',
      metrics: [{ value: '5', label: 'Agents' }, { value: '842', label: 'Runs/Wk' }, { value: '99.4%', label: 'Uptime' }],
      connectionFields: [
        { label: 'Endpoint', type: 'text', value: 'https://langgraph.internal:8100' },
        { label: 'API Key', type: 'password', value: '••••••••••••••••' },
        { label: 'Timeout (seconds)', type: 'number', value: '1800' },
      ],
      engineFields: [
        { label: 'Default Model', type: 'select', value: 'Claude Sonnet 4', options: ['Claude Sonnet 4', 'Claude Opus 4', 'Claude Haiku 4', 'GPT-4o'] },
        { label: 'Graph Persistence', type: 'select', value: 'PostgreSQL', options: ['PostgreSQL', 'SQLite', 'Redis'] },
        { label: 'Max Concurrent Graphs', type: 'number', value: '10' },
        { label: 'Enable Checkpointing', type: 'toggle', value: 'true' },
        { label: 'Retry Policy', type: 'select', value: 'Exponential Backoff', options: ['Exponential Backoff', 'Fixed Interval', 'None'] },
      ],
      agents: [
        { name: 'Close Agent', color: '#0D6B5C', status: 'Running' },
        { name: 'Flux Agent', color: '#7C3AED', status: 'Running' },
        { name: 'JE Agent', color: '#059669', status: 'Running' },
        { name: 'Report Gen Agent', color: '#6366F1', status: 'Idle' },
        { name: 'IC Recon Agent', color: '#0D6B5C', status: 'Idle' },
      ]
    },
    {
      id: 'n8n-primary', name: 'n8n Workflow Engine', type: 'n8n', version: 'v1.72.1',
      enabled: true, connected: true, latency: '38ms',
      metrics: [{ value: '3', label: 'Workflows' }, { value: '312', label: 'Runs/Wk' }, { value: '99.8%', label: 'Uptime' }],
      connectionFields: [
        { label: 'Endpoint', type: 'text', value: 'https://n8n.internal:5678' },
        { label: 'API Key', type: 'password', value: '••••••••••••••••' },
        { label: 'Timeout (seconds)', type: 'number', value: '900' },
      ],
      engineFields: [
        { label: 'Execution Mode', type: 'select', value: 'Queue', options: ['Queue', 'Regular', 'Webhook'] },
        { label: 'Worker Concurrency', type: 'number', value: '5' },
        { label: 'Webhook Base URL', type: 'text', value: 'https://n8n.internal:5678/webhook' },
        { label: 'Save Execution Data', type: 'toggle', value: 'true' },
      ],
      agents: [
        { name: 'Forecast Agent', color: '#D97706', status: 'Running' },
        { name: 'AR Collection Agent', color: '#DB2777', status: 'Idle' },
      ]
    },
    {
      id: 'bedrock-us', name: 'AWS Bedrock (US-East)', type: 'AWS Bedrock', version: 'v2024.12',
      enabled: true, connected: true, latency: '68ms',
      metrics: [{ value: '2', label: 'Agents' }, { value: '186', label: 'Runs/Wk' }, { value: '99.9%', label: 'Uptime' }],
      connectionFields: [
        { label: 'Region', type: 'select', value: 'us-east-1', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'] },
        { label: 'Access Key ID', type: 'password', value: '••••••••••••••••' },
        { label: 'Secret Access Key', type: 'password', value: '••••••••••••••••' },
      ],
      engineFields: [
        { label: 'Default Model', type: 'select', value: 'Claude Sonnet 4', options: ['Claude Sonnet 4', 'Claude Haiku 4', 'Titan Express', 'Titan Embeddings'] },
        { label: 'Guardrails Enabled', type: 'toggle', value: 'true' },
        { label: 'Guardrail ID', type: 'text', value: 'gr-finance-v2' },
        { label: 'Throughput Mode', type: 'select', value: 'On-Demand', options: ['On-Demand', 'Provisioned'] },
      ],
      agents: [
        { name: 'Recon Agent', color: '#2563EB', status: 'Running' },
        { name: 'Risk Monitor', color: '#DC2626', status: 'Idle' },
      ]
    },
    {
      id: 'bedrock-eu', name: 'AWS Bedrock (EU-West)', type: 'AWS Bedrock', version: 'v2024.12',
      enabled: true, connected: true, latency: '82ms',
      metrics: [{ value: '1', label: 'Agents' }, { value: '42', label: 'Runs/Wk' }, { value: '99.9%', label: 'Uptime' }],
      connectionFields: [
        { label: 'Region', type: 'select', value: 'eu-west-1', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'] },
        { label: 'Access Key ID', type: 'password', value: '••••••••••••••••' },
        { label: 'Secret Access Key', type: 'password', value: '••••••••••••••••' },
      ],
      engineFields: [
        { label: 'Default Model', type: 'select', value: 'Claude Haiku 4', options: ['Claude Sonnet 4', 'Claude Haiku 4', 'Titan Express'] },
        { label: 'Guardrails Enabled', type: 'toggle', value: 'true' },
        { label: 'Guardrail ID', type: 'text', value: 'gr-finance-eu-v1' },
        { label: 'Throughput Mode', type: 'select', value: 'On-Demand', options: ['On-Demand', 'Provisioned'] },
      ],
      agents: [
        { name: 'EU Compliance Agent', color: '#0D6B5C', status: 'Running' },
      ]
    },
    {
      id: 'lg-staging', name: 'LangGraph Staging', type: 'LangGraph', version: 'v0.4.3-rc1',
      enabled: false, connected: false, latency: '—',
      metrics: [{ value: '0', label: 'Agents' }, { value: '0', label: 'Runs/Wk' }, { value: '—', label: 'Uptime' }],
      connectionFields: [
        { label: 'Endpoint', type: 'text', value: 'https://langgraph-staging.internal:8100' },
        { label: 'API Key', type: 'password', value: '••••••••••••••••' },
        { label: 'Timeout (seconds)', type: 'number', value: '1800' },
      ],
      engineFields: [
        { label: 'Default Model', type: 'select', value: 'Claude Sonnet 4', options: ['Claude Sonnet 4', 'Claude Opus 4'] },
        { label: 'Graph Persistence', type: 'select', value: 'SQLite', options: ['PostgreSQL', 'SQLite', 'Redis'] },
        { label: 'Max Concurrent Graphs', type: 'number', value: '3' },
        { label: 'Enable Checkpointing', type: 'toggle', value: 'false' },
        { label: 'Retry Policy', type: 'select', value: 'None', options: ['Exponential Backoff', 'Fixed Interval', 'None'] },
      ],
      agents: []
    },
    {
      id: 'crewai-exp', name: 'CrewAI Experimental', type: 'CrewAI', version: 'v0.28.0',
      enabled: false, connected: false, latency: '—',
      metrics: [{ value: '0', label: 'Agents' }, { value: '0', label: 'Runs/Wk' }, { value: '—', label: 'Uptime' }],
      connectionFields: [
        { label: 'Endpoint', type: 'text', value: 'https://crewai.internal:9000' },
        { label: 'API Key', type: 'password', value: '••••••••••••••••' },
        { label: 'Timeout (seconds)', type: 'number', value: '600' },
      ],
      engineFields: [
        { label: 'Default LLM', type: 'select', value: 'Claude Sonnet 4', options: ['Claude Sonnet 4', 'GPT-4o', 'Gemini Pro'] },
        { label: 'Memory Backend', type: 'select', value: 'Short-term', options: ['Short-term', 'Long-term', 'Entity'] },
        { label: 'Process Type', type: 'select', value: 'Sequential', options: ['Sequential', 'Hierarchical'] },
        { label: 'Verbose Logging', type: 'toggle', value: 'true' },
      ],
      agents: []
    },
  ];

  // Per-engine resource data (keyed by engine id)
  engineResources: Record<string, any> = {
    'lg-primary': {
      llmModels: [
        { name: 'Claude Sonnet 4', modelId: 'claude-sonnet-4-20250514', provider: 'Anthropic', providerBg: '#E8F5F1', providerColor: '#0D6B5C', color: '#0D6B5C', useCase: 'Primary reasoning', temperature: '0.3', maxTokens: '4,096', costPer1k: '$0.003', status: 'Active', badgeClass: 'afda-badge-success' },
        { name: 'Claude Opus 4', modelId: 'claude-opus-4-20250514', provider: 'Anthropic', providerBg: '#E8F5F1', providerColor: '#0D6B5C', color: '#7C3AED', useCase: 'Complex analysis', temperature: '0.2', maxTokens: '4,096', costPer1k: '$0.015', status: 'Active', badgeClass: 'afda-badge-success' },
        { name: 'Claude Haiku 4', modelId: 'claude-haiku-4-20250414', provider: 'Anthropic', providerBg: '#E8F5F1', providerColor: '#0D6B5C', color: '#059669', useCase: 'Fast classification', temperature: '0.1', maxTokens: '4,096', costPer1k: '$0.0008', status: 'Active', badgeClass: 'afda-badge-success' },
        { name: 'GPT-4o', modelId: 'gpt-4o-2024-11-20', provider: 'OpenAI', providerBg: '#F3F4F6', providerColor: '#374151', color: '#374151', useCase: 'Fallback / comparison', temperature: '0.3', maxTokens: '4,096', costPer1k: '$0.005', status: 'Standby', badgeClass: 'afda-badge-medium' },
      ],
      rateLimits: [
        { label: 'API Requests (hourly)', used: '842', max: '2,000', pct: 42 },
        { label: 'Token Budget (daily)', used: '1.24M', max: '5M', pct: 25 },
        { label: 'Concurrent Graphs', used: '5', max: '10', pct: 50 },
        { label: 'Checkpoint Storage', used: '1.2 GB', max: '5 GB', pct: 24 },
        { label: 'Monthly Spend', used: '$86', max: '$300', pct: 29 },
      ],
      services: [
        { name: 'LangGraph Server', latency: '42ms', uptime: '99.4%', healthy: true },
        { name: 'PostgreSQL (State)', latency: '4ms', uptime: '99.99%', healthy: true },
        { name: 'Redis (Cache)', latency: '2ms', uptime: '99.99%', healthy: true },
        { name: 'FastAPI Gateway', latency: '18ms', uptime: '99.8%', healthy: true },
      ],
      healthBadge: 'afda-badge-success', healthLabel: 'All OK'
    },
    'n8n-primary': {
      llmModels: [
        { name: 'Claude Sonnet 4', modelId: 'claude-sonnet-4-20250514', provider: 'Anthropic', providerBg: '#E8F5F1', providerColor: '#0D6B5C', color: '#0D6B5C', useCase: 'Workflow AI nodes', temperature: '0.3', maxTokens: '4,096', costPer1k: '$0.003', status: 'Active', badgeClass: 'afda-badge-success' },
        { name: 'Claude Haiku 4', modelId: 'claude-haiku-4-20250414', provider: 'Anthropic', providerBg: '#E8F5F1', providerColor: '#0D6B5C', color: '#059669', useCase: 'Quick triage', temperature: '0.1', maxTokens: '4,096', costPer1k: '$0.0008', status: 'Active', badgeClass: 'afda-badge-success' },
      ],
      rateLimits: [
        { label: 'Workflow Executions (hourly)', used: '48', max: '200', pct: 24 },
        { label: 'Webhook Events (daily)', used: '312', max: '5,000', pct: 6 },
        { label: 'Worker Threads', used: '3', max: '5', pct: 60 },
        { label: 'Execution Data', used: '840 MB', max: '5 GB', pct: 17 },
        { label: 'Monthly Spend', used: '$32', max: '$100', pct: 32 },
      ],
      services: [
        { name: 'n8n Orchestrator', latency: '38ms', uptime: '99.8%', healthy: true },
        { name: 'PostgreSQL (n8n DB)', latency: '5ms', uptime: '99.99%', healthy: true },
        { name: 'Webhook Listener', latency: '12ms', uptime: '99.9%', healthy: true },
      ],
      healthBadge: 'afda-badge-success', healthLabel: 'All OK'
    },
    'bedrock-us': {
      llmModels: [
        { name: 'Claude Sonnet 4', modelId: 'claude-sonnet-4-20250514', provider: 'AWS Bedrock', providerBg: '#EFF6FF', providerColor: '#2563EB', color: '#0D6B5C', useCase: 'Reconciliation', temperature: '0.2', maxTokens: '4,096', costPer1k: '$0.003', status: 'Active', badgeClass: 'afda-badge-success' },
        { name: 'Claude Haiku 4', modelId: 'claude-haiku-4-20250414', provider: 'AWS Bedrock', providerBg: '#EFF6FF', providerColor: '#2563EB', color: '#059669', useCase: 'Risk scoring', temperature: '0.1', maxTokens: '4,096', costPer1k: '$0.0008', status: 'Active', badgeClass: 'afda-badge-success' },
        { name: 'Titan Express', modelId: 'amazon.titan-text-express-v1', provider: 'AWS', providerBg: '#EFF6FF', providerColor: '#2563EB', color: '#2563EB', useCase: 'Embedding / search', temperature: '0.0', maxTokens: '8,192', costPer1k: '$0.0008', status: 'Active', badgeClass: 'afda-badge-success' },
      ],
      rateLimits: [
        { label: 'Invocations (per minute)', used: '24', max: '100', pct: 24 },
        { label: 'Input Tokens (daily)', used: '420K', max: '2M', pct: 21 },
        { label: 'Output Tokens (daily)', used: '86K', max: '500K', pct: 17 },
        { label: 'Provisioned Throughput', used: '0', max: '—', pct: 0 },
        { label: 'Monthly Spend', used: '$24', max: '$100', pct: 24 },
      ],
      services: [
        { name: 'Bedrock Runtime (us-east-1)', latency: '68ms', uptime: '99.9%', healthy: true },
        { name: 'Bedrock Guardrails', latency: '22ms', uptime: '99.9%', healthy: true },
        { name: 'S3 (Model Artifacts)', latency: '8ms', uptime: '99.99%', healthy: true },
      ],
      healthBadge: 'afda-badge-success', healthLabel: 'All OK'
    },
    'bedrock-eu': {
      llmModels: [
        { name: 'Claude Haiku 4', modelId: 'claude-haiku-4-20250414', provider: 'AWS Bedrock', providerBg: '#EFF6FF', providerColor: '#2563EB', color: '#059669', useCase: 'EU compliance checks', temperature: '0.1', maxTokens: '4,096', costPer1k: '$0.0008', status: 'Active', badgeClass: 'afda-badge-success' },
        { name: 'Titan Express', modelId: 'amazon.titan-text-express-v1', provider: 'AWS', providerBg: '#EFF6FF', providerColor: '#2563EB', color: '#2563EB', useCase: 'Document embedding', temperature: '0.0', maxTokens: '8,192', costPer1k: '$0.0008', status: 'Active', badgeClass: 'afda-badge-success' },
      ],
      rateLimits: [
        { label: 'Invocations (per minute)', used: '6', max: '50', pct: 12 },
        { label: 'Input Tokens (daily)', used: '82K', max: '1M', pct: 8 },
        { label: 'Output Tokens (daily)', used: '18K', max: '250K', pct: 7 },
        { label: 'Monthly Spend', used: '$8', max: '$50', pct: 16 },
      ],
      services: [
        { name: 'Bedrock Runtime (eu-west-1)', latency: '82ms', uptime: '99.9%', healthy: true },
        { name: 'Bedrock Guardrails', latency: '28ms', uptime: '99.9%', healthy: true },
      ],
      healthBadge: 'afda-badge-success', healthLabel: 'All OK'
    },
  };

  get enabledEngines() {
    return this.configuredEngines.filter(e => e.enabled);
  }

  get selectedEngineData(): any {
    const engine = this.configuredEngines.find(e => e.id === this.selectedResourceEngine);
    const resources = this.engineResources[this.selectedResourceEngine];
    if (!engine || !resources) return null;
    return { ...engine, ...resources };
  }

  getEngineType(type: string) {
    return this.engineTypes.find(et => et.type === type) || this.engineTypes[this.engineTypes.length - 1];
  }

  toggleEngine(id: string) {
    this.expandedEngine = this.expandedEngine === id ? '' : id;
  }

  openAddEngine() {
    this.showAddEngine = true;
    this.newEngineType = '';
  }

  selectEngineType(type: string) {
    this.newEngineType = type;
  }

  getNewEngineFields(): any[] {
    const fieldMap: any = {
      'LangGraph': [
        { label: 'Endpoint', type: 'text', placeholder: 'https://langgraph.internal:8100' },
        { label: 'API Key', type: 'password' },
        { label: 'Default Model', type: 'select', options: ['Claude Sonnet 4', 'Claude Opus 4', 'GPT-4o'] },
        { label: 'Graph Persistence', type: 'select', options: ['PostgreSQL', 'SQLite', 'Redis'] },
      ],
      'n8n': [
        { label: 'Endpoint', type: 'text', placeholder: 'https://n8n.internal:5678' },
        { label: 'API Key', type: 'password' },
        { label: 'Execution Mode', type: 'select', options: ['Queue', 'Regular', 'Webhook'] },
        { label: 'Webhook Base URL', type: 'text', placeholder: 'https://n8n.internal:5678/webhook' },
      ],
      'AWS Bedrock': [
        { label: 'Region', type: 'select', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'] },
        { label: 'Access Key ID', type: 'password' },
        { label: 'Secret Access Key', type: 'password' },
        { label: 'Default Model', type: 'select', options: ['Claude Sonnet 4', 'Claude Haiku 4', 'Titan Express'] },
      ],
      'CrewAI': [
        { label: 'Endpoint', type: 'text', placeholder: 'https://crewai.internal:9000' },
        { label: 'API Key', type: 'password' },
        { label: 'Default LLM', type: 'select', options: ['Claude Sonnet 4', 'GPT-4o', 'Gemini Pro'] },
        { label: 'Process Type', type: 'select', options: ['Sequential', 'Hierarchical'] },
      ],
      'AutoGen': [
        { label: 'Endpoint', type: 'text', placeholder: 'https://autogen.internal:8200' },
        { label: 'API Key', type: 'password' },
        { label: 'Default LLM', type: 'select', options: ['Claude Sonnet 4', 'GPT-4o'] },
        { label: 'Human Input Mode', type: 'select', options: ['NEVER', 'TERMINATE', 'ALWAYS'] },
      ],
      'Custom': [
        { label: 'Endpoint URL', type: 'text', placeholder: 'https://your-engine:port' },
        { label: 'Auth Header', type: 'text', placeholder: 'Authorization' },
        { label: 'Auth Token', type: 'password' },
        { label: 'Protocol', type: 'select', options: ['REST', 'gRPC', 'WebSocket'] },
      ],
    };
    return fieldMap[this.newEngineType] || [];
  }

  deleteEngine(id: string) {
    this.configuredEngines = this.configuredEngines.filter(e => e.id !== id);
    if (this.expandedEngine === id) this.expandedEngine = '';
    if (this.selectedResourceEngine === id) {
      const enabled = this.enabledEngines;
      this.selectedResourceEngine = enabled.length > 0 ? enabled[0].id : '';
    }
  }

  testAllConnections() {}
}