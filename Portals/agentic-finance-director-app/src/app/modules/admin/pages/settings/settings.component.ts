import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/admin">Administration</a>
      <span class="separator">/</span>
      <span class="current">Settings</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Settings</h1>
        <p class="afda-page-subtitle">Organization profile, preferences, security, and platform configuration</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline">
          <i class="bi bi-arrow-counterclockwise"></i> Reset Defaults
        </button>
        <button class="afda-btn afda-btn-primary">
          <i class="bi bi-check-lg"></i> Save All Changes
        </button>
      </div>
    </div>

    <!-- Settings Layout: Sidebar + Content -->
    <div class="settings-layout">
      <!-- Section Nav -->
      <div class="settings-nav">
        @for (section of sections; track section.id) {
          <button class="sn-item" [class.active]="activeSection === section.id"
                  (click)="activeSection = section.id">
            <i [class]="'bi ' + section.icon"></i>
            <span>{{ section.name }}</span>
          </button>
        }
      </div>

      <!-- Content -->
      <div class="settings-content">

        <!-- Organization -->
        @if (activeSection === 'org') {
          <div class="sc-section" style="animation: fadeUp 0.3s ease both;">
            <div class="sc-title">Organization Profile</div>
            <div class="sc-desc">Basic company information used across the platform</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">Organization Name</label>
                <input type="text" class="form-input" value="Acme Financial Corp">
              </div>
              <div class="form-field">
                <label class="form-label">Legal Entity</label>
                <input type="text" class="form-input" value="Acme Financial Corporation, Inc.">
              </div>
              <div class="form-field">
                <label class="form-label">Industry</label>
                <select class="form-select">
                  <option selected>Financial Services</option>
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Fiscal Year End</label>
                <select class="form-select">
                  <option selected>December 31</option>
                  <option>March 31</option>
                  <option>June 30</option>
                  <option>September 30</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Default Currency</label>
                <select class="form-select">
                  <option selected>USD — US Dollar</option>
                  <option>EUR — Euro</option>
                  <option>GBP — British Pound</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Timezone</label>
                <select class="form-select">
                  <option selected>America/New_York (EST)</option>
                  <option>America/Chicago (CST)</option>
                  <option>America/Los_Angeles (PST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <div class="sc-subtitle">Subsidiaries / Entities</div>
            <div class="entity-list">
              @for (entity of entities; track entity.name) {
                <div class="entity-row">
                  <div class="entity-dot" [style.background]="entity.color"></div>
                  <span class="entity-name">{{ entity.name }}</span>
                  <span class="entity-code font-mono">{{ entity.code }}</span>
                  <span class="entity-currency font-mono">{{ entity.currency }}</span>
                  <span class="entity-status" [style.color]="entity.active ? '#059669' : '#6B7280'">
                    {{ entity.active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              }
              <button class="add-btn"><i class="bi bi-plus"></i> Add Entity</button>
            </div>
          </div>
        }

        <!-- Preferences -->
        @if (activeSection === 'prefs') {
          <div class="sc-section" style="animation: fadeUp 0.3s ease both;">
            <div class="sc-title">Display Preferences</div>
            <div class="sc-desc">Customize the look and feel of the platform</div>
            <div class="pref-grid">
              @for (pref of displayPrefs; track pref.label) {
                <div class="pref-item">
                  <div class="pref-info">
                    <div class="pref-label">{{ pref.label }}</div>
                    <div class="pref-desc">{{ pref.desc }}</div>
                  </div>
                  @if (pref.type === 'toggle') {
                    <div class="toggle" [class.on]="pref.value" (click)="pref.value = !pref.value">
                      <div class="toggle-knob"></div>
                    </div>
                  }
                  @if (pref.type === 'select') {
                    <select class="form-select-sm">
                      @for (opt of pref.options; track opt) {
                        <option [selected]="opt === pref.value">{{ opt }}</option>
                      }
                    </select>
                  }
                </div>
              }
            </div>

            <div class="sc-subtitle">Number Formatting</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">Decimal Separator</label>
                <select class="form-select"><option selected>Period (.)</option><option>Comma (,)</option></select>
              </div>
              <div class="form-field">
                <label class="form-label">Thousands Separator</label>
                <select class="form-select"><option selected>Comma (,)</option><option>Period (.)</option><option>Space</option></select>
              </div>
              <div class="form-field">
                <label class="form-label">Date Format</label>
                <select class="form-select"><option selected>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select>
              </div>
              <div class="form-field">
                <label class="form-label">Currency Display</label>
                <select class="form-select"><option selected>Symbol ($1,234.56)</option><option>Code (USD 1,234.56)</option></select>
              </div>
            </div>
          </div>
        }

        <!-- Notifications -->
        @if (activeSection === 'notif') {
          <div class="sc-section" style="animation: fadeUp 0.3s ease both;">
            <div class="sc-title">Notification Settings</div>
            <div class="sc-desc">Configure how and when alerts are delivered</div>

            <div class="notif-channels">
              @for (ch of notifChannels; track ch.name) {
                <div class="nc-card">
                  <div class="nc-header">
                    <div class="nc-icon" [style.background]="ch.iconBg">
                      <i [class]="'bi ' + ch.icon" [style.color]="ch.iconColor"></i>
                    </div>
                    <div class="nc-info">
                      <div class="nc-name">{{ ch.name }}</div>
                      <div class="nc-detail">{{ ch.detail }}</div>
                    </div>
                    <div class="toggle" [class.on]="ch.enabled" (click)="ch.enabled = !ch.enabled">
                      <div class="toggle-knob"></div>
                    </div>
                  </div>
                  @if (ch.config) {
                    <div class="nc-config">
                      @for (cfg of ch.config; track cfg.label) {
                        <div class="ncf-row">
                          <span class="ncf-label">{{ cfg.label }}</span>
                          <input type="text" class="ncf-input font-mono" [value]="cfg.value">
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <div class="sc-subtitle">Quiet Hours</div>
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">Start</label>
                <select class="form-select"><option selected>10:00 PM</option></select>
              </div>
              <div class="form-field">
                <label class="form-label">End</label>
                <select class="form-select"><option selected>7:00 AM</option></select>
              </div>
            </div>
          </div>
        }

        <!-- Security -->
        @if (activeSection === 'security') {
          <div class="sc-section" style="animation: fadeUp 0.3s ease both;">
            <div class="sc-title">Security Configuration</div>
            <div class="sc-desc">Authentication, session management, and access controls</div>

            <div class="pref-grid">
              @for (sec of securitySettings; track sec.label) {
                <div class="pref-item">
                  <div class="pref-info">
                    <div class="pref-label">{{ sec.label }}</div>
                    <div class="pref-desc">{{ sec.desc }}</div>
                  </div>
                  @if (sec.type === 'toggle') {
                    <div class="toggle" [class.on]="sec.value" (click)="sec.value = !sec.value">
                      <div class="toggle-knob"></div>
                    </div>
                  }
                  @if (sec.type === 'select') {
                    <select class="form-select-sm">
                      @for (opt of sec.options; track opt) {
                        <option [selected]="opt === sec.value">{{ opt }}</option>
                      }
                    </select>
                  }
                </div>
              }
            </div>

            <div class="sc-subtitle">IP Allowlist</div>
            <div class="ip-list">
              @for (ip of ipAllowlist; track ip.cidr) {
                <div class="ip-row">
                  <span class="ip-cidr font-mono">{{ ip.cidr }}</span>
                  <span class="ip-label">{{ ip.label }}</span>
                  <button class="ip-remove"><i class="bi bi-x"></i></button>
                </div>
              }
              <button class="add-btn"><i class="bi bi-plus"></i> Add IP Range</button>
            </div>
          </div>
        }

        <!-- Data Retention -->
        @if (activeSection === 'data') {
          <div class="sc-section" style="animation: fadeUp 0.3s ease both;">
            <div class="sc-title">Data Retention Policies</div>
            <div class="sc-desc">Configure how long different data types are stored</div>

            <div class="retention-list">
              @for (r of retentionPolicies; track r.type) {
                <div class="ret-row">
                  <div class="ret-icon" [style.background]="r.iconBg">
                    <i [class]="'bi ' + r.icon" [style.color]="r.iconColor"></i>
                  </div>
                  <div class="ret-info">
                    <div class="ret-type">{{ r.type }}</div>
                    <div class="ret-desc">{{ r.desc }}</div>
                  </div>
                  <select class="form-select-sm" style="width: 140px;">
                    @for (opt of r.options; track opt) {
                      <option [selected]="opt === r.value">{{ opt }}</option>
                    }
                  </select>
                  <span class="ret-size font-mono">{{ r.currentSize }}</span>
                </div>
              }
            </div>

            <div class="sc-subtitle" style="margin-top: 20px;">Storage Usage</div>
            <div class="storage-bars">
              @for (s of storageUsage; track s.label) {
                <div class="sb-row">
                  <span class="sb-label">{{ s.label }}</span>
                  <div class="sb-bar">
                    <div class="sb-bar-fill" [style.width.%]="s.pct" [style.background]="s.color"></div>
                  </div>
                  <span class="sb-size font-mono">{{ s.size }}</span>
                  <span class="sb-pct font-mono" [style.color]="s.color">{{ s.pct }}%</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Feature Flags -->
        @if (activeSection === 'features') {
          <div class="sc-section" style="animation: fadeUp 0.3s ease both;">
            <div class="sc-title">Feature Flags</div>
            <div class="sc-desc">Enable or disable experimental and optional platform features</div>

            <div class="ff-list">
              @for (ff of featureFlags; track ff.name) {
                <div class="ff-item" [class.disabled]="!ff.enabled">
                  <div class="ff-info">
                    <div class="ff-name-row">
                      <span class="ff-name">{{ ff.name }}</span>
                      @if (ff.badge) {
                        <span class="ff-badge" [style.background]="ff.badgeBg" [style.color]="ff.badgeColor">{{ ff.badge }}</span>
                      }
                    </div>
                    <div class="ff-desc">{{ ff.desc }}</div>
                  </div>
                  <div class="toggle" [class.on]="ff.enabled" (click)="ff.enabled = !ff.enabled">
                    <div class="toggle-knob"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .settings-layout {
      display: grid; grid-template-columns: 220px 1fr;
      gap: 20px; min-height: 600px;
    }

    /* Nav */
    .settings-nav {
      display: flex; flex-direction: column; gap: 2px;
      position: sticky; top: 20px; align-self: flex-start;
    }

    .sn-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; font-size: 13px; font-weight: 500;
      border: none; border-radius: var(--radius-md);
      background: transparent; color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; text-align: left;
      font-family: var(--font-sans);
      i { font-size: 15px; width: 18px; text-align: center; }
      &:hover { background: var(--bg-section); color: var(--text-primary); }
      &.active {
        background: var(--primary-light); color: var(--primary);
        font-weight: 600;
      }
    }

    /* Content */
    .settings-content {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px 28px;
      box-shadow: var(--shadow-card);
    }

    .sc-title { font-size: 17px; font-weight: 700; color: var(--text-primary); }
    .sc-desc { font-size: 13px; color: var(--text-tertiary); margin: 4px 0 20px; }

    .sc-subtitle {
      font-size: 13px; font-weight: 700; color: var(--text-primary);
      margin: 20px 0 12px; padding-top: 16px;
      border-top: 1px solid var(--border-light);
    }

    /* Form Grid */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; }

    .form-field { display: flex; flex-direction: column; gap: 4px; }

    .form-label {
      font-size: 11px; font-weight: 600; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px;
    }

    .form-input, .form-select {
      padding: 9px 12px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 13px;
      background: var(--bg-section); color: var(--text-primary);
      font-family: var(--font-sans); outline: none;
      &:focus { border-color: var(--primary); }
    }

    /* Entity List */
    .entity-list { display: flex; flex-direction: column; gap: 6px; }

    .entity-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; background: var(--bg-section);
      border: 1px solid var(--border-light); border-radius: var(--radius-sm);
    }

    .entity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .entity-name { font-size: 13px; font-weight: 600; flex: 1; color: var(--text-primary); }
    .entity-code { font-size: 11px; color: var(--text-tertiary); min-width: 50px; }
    .entity-currency { font-size: 11px; color: var(--text-tertiary); min-width: 36px; }
    .entity-status { font-size: 11px; font-weight: 600; }

    .add-btn {
      display: flex; align-items: center; gap: 4px;
      padding: 8px 12px; font-size: 12px; font-weight: 500;
      border: 1px dashed var(--border); border-radius: var(--radius-sm);
      background: transparent; color: var(--text-tertiary);
      cursor: pointer; font-family: var(--font-sans); margin-top: 4px;
      &:hover { border-color: var(--primary); color: var(--primary); }
    }

    /* Toggle */
    .toggle {
      width: 42px; height: 24px; background: #D1D5DB;
      border-radius: 12px; position: relative; cursor: pointer;
      transition: background 0.2s; flex-shrink: 0;
      &.on { background: var(--primary); }
    }

    .toggle-knob {
      width: 20px; height: 20px; background: white;
      border-radius: 50%; position: absolute; top: 2px; left: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      transition: left 0.2s;
    }

    .toggle.on .toggle-knob { left: 20px; }

    /* Preferences */
    .pref-grid { display: flex; flex-direction: column; gap: 4px; }

    .pref-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: var(--bg-section);
      border: 1px solid var(--border-light); border-radius: var(--radius-sm);
    }

    .pref-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .pref-desc { font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px; }

    /* Notification Channels */
    .notif-channels { display: flex; flex-direction: column; gap: 10px; }

    .nc-card {
      border: 1px solid var(--border-light); border-radius: var(--radius-md);
      overflow: hidden;
    }

    .nc-header {
      display: flex; align-items: center; gap: 14px; padding: 14px 16px;
    }

    .nc-icon {
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 16px; flex-shrink: 0;
    }

    .nc-info { flex: 1; }
    .nc-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .nc-detail { font-size: 11.5px; color: var(--text-tertiary); }

    .nc-config {
      padding: 10px 16px; background: var(--bg-section);
      border-top: 1px solid var(--border-light);
    }

    .ncf-row {
      display: flex; align-items: center; gap: 12px; margin-bottom: 6px;
      &:last-child { margin-bottom: 0; }
    }

    .ncf-label { font-size: 11px; color: var(--text-tertiary); min-width: 100px; }

    .ncf-input {
      flex: 1; padding: 6px 10px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 12px;
      background: var(--bg-white); color: var(--text-primary); outline: none;
      &:focus { border-color: var(--primary); }
    }

    /* IP List */
    .ip-list { display: flex; flex-direction: column; gap: 6px; }

    .ip-row {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 14px; background: var(--bg-section);
      border: 1px solid var(--border-light); border-radius: var(--radius-sm);
    }

    .ip-cidr { font-size: 13px; font-weight: 600; min-width: 140px; }
    .ip-label { font-size: 12px; color: var(--text-tertiary); flex: 1; }

    .ip-remove {
      background: none; border: none; color: var(--text-tertiary);
      cursor: pointer; font-size: 14px;
      &:hover { color: #DC2626; }
    }

    /* Retention */
    .retention-list { display: flex; flex-direction: column; gap: 8px; }

    .ret-row {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 16px; background: var(--bg-section);
      border: 1px solid var(--border-light); border-radius: var(--radius-sm);
    }

    .ret-icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 14px; flex-shrink: 0;
    }

    .ret-info { flex: 1; }
    .ret-type { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .ret-desc { font-size: 11px; color: var(--text-tertiary); }
    .ret-size { font-size: 11px; color: var(--text-tertiary); min-width: 50px; text-align: right; }

    /* Storage Bars */
    .storage-bars { display: flex; flex-direction: column; gap: 8px; }

    .sb-row { display: flex; align-items: center; gap: 10px; }
    .sb-label { font-size: 12px; color: var(--text-secondary); min-width: 120px; }

    .sb-bar { flex: 1; height: 8px; background: var(--border-light); border-radius: 10px; overflow: hidden; }
    .sb-bar-fill { height: 100%; border-radius: 10px; }
    .sb-size { font-size: 11px; min-width: 50px; text-align: right; }
    .sb-pct { font-size: 11px; font-weight: 600; min-width: 32px; text-align: right; }

    /* Feature Flags */
    .ff-list { display: flex; flex-direction: column; gap: 4px; }

    .ff-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; background: var(--bg-section);
      border: 1px solid var(--border-light); border-radius: var(--radius-sm);
      transition: opacity 0.2s;
      &.disabled { opacity: 0.55; }
    }

    .ff-name-row { display: flex; align-items: center; gap: 8px; }
    .ff-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }

    .ff-badge {
      font-size: 9px; font-weight: 700; padding: 2px 8px;
      border-radius: 8px; text-transform: uppercase;
    }

    .ff-desc { font-size: 11.5px; color: var(--text-tertiary); margin-top: 2px; }

    @media (max-width: 900px) {
      .settings-layout { grid-template-columns: 1fr; }
      .settings-nav { flex-direction: row; overflow-x: auto; position: static; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class SettingsComponent {
  activeSection = 'org';

  sections = [
    { id: 'org', name: 'Organization', icon: 'bi-building' },
    { id: 'prefs', name: 'Preferences', icon: 'bi-palette' },
    { id: 'notif', name: 'Notifications', icon: 'bi-bell' },
    { id: 'security', name: 'Security', icon: 'bi-shield-lock' },
    { id: 'data', name: 'Data Retention', icon: 'bi-database' },
    { id: 'features', name: 'Feature Flags', icon: 'bi-toggles' },
  ];

  entities = [
    { name: 'Acme Financial Corp (Parent)', code: 'AFC-US', currency: 'USD', color: '#0D6B5C', active: true },
    { name: 'Acme EU Subsidiary', code: 'AFC-EU', currency: 'EUR', color: '#2563EB', active: true },
    { name: 'Acme UK Operations', code: 'AFC-UK', currency: 'GBP', color: '#7C3AED', active: true },
    { name: 'Acme Asia Holdings', code: 'AFC-AP', currency: 'SGD', color: '#D97706', active: false },
  ];

  displayPrefs: any[] = [
    { label: 'Dark Mode', desc: 'Switch to dark theme across all pages', type: 'toggle', value: false },
    { label: 'Compact Layout', desc: 'Reduce spacing and card padding', type: 'toggle', value: false },
    { label: 'Show Animations', desc: 'Enable transition and entrance animations', type: 'toggle', value: true },
    { label: 'Default Dashboard View', desc: 'Landing page after login', type: 'select', value: 'Command Center', options: ['Command Center', 'FP&A', 'Treasury', 'Accounting'] },
    { label: 'Table Rows Per Page', desc: 'Default pagination size for all tables', type: 'select', value: '25', options: ['10', '25', '50', '100'] },
    { label: 'Chart Refresh Interval', desc: 'Auto-refresh for real-time dashboards', type: 'select', value: '30s', options: ['10s', '30s', '60s', '5m', 'Manual'] },
  ];

  notifChannels = [
    { name: 'Email', detail: 'SMTP-based delivery to team distribution lists', icon: 'bi-envelope', iconBg: '#EFF6FF', iconColor: '#2563EB', enabled: true,
      config: [{ label: 'SMTP Host', value: 'smtp.company.com:587' }, { label: 'From Address', value: 'alerts@acme-finance.com' }] },
    { name: 'Slack', detail: 'Real-time channel notifications via webhook', icon: 'bi-chat-dots', iconBg: '#EDE9FE', iconColor: '#7C3AED', enabled: true,
      config: [{ label: 'Webhook URL', value: 'https://hooks.slack.com/services/T0XXX/B0XXX/xxxx' }, { label: 'Default Channel', value: '#finance-alerts' }] },
    { name: 'SMS', detail: 'Critical alerts only — Twilio integration', icon: 'bi-phone', iconBg: '#ECFDF5', iconColor: '#059669', enabled: false,
      config: [{ label: 'Account SID', value: 'AC••••••••••••' }, { label: 'Auth Token', value: '••••••••••••' }] },
    { name: 'In-App Notifications', detail: 'Alert Center and browser push notifications', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706', enabled: true, config: null },
    { name: 'Webhook', detail: 'HTTP POST to external systems (PagerDuty, etc.)', icon: 'bi-broadcast', iconBg: '#F3F4F6', iconColor: '#374151', enabled: false,
      config: [{ label: 'Endpoint URL', value: '' }, { label: 'Auth Header', value: '' }] },
  ];

  securitySettings: any[] = [
    { label: 'Two-Factor Authentication', desc: 'Require MFA for all users', type: 'toggle', value: true },
    { label: 'Session Timeout', desc: 'Auto-logout after inactivity', type: 'select', value: '30 minutes', options: ['15 minutes', '30 minutes', '1 hour', '4 hours', 'Never'] },
    { label: 'Password Complexity', desc: 'Minimum requirements for passwords', type: 'select', value: 'Strong (12+ chars)', options: ['Basic (8+ chars)', 'Strong (12+ chars)', 'Very Strong (16+ chars)'] },
    { label: 'Single Sign-On (SAML)', desc: 'Enable SSO via identity provider', type: 'toggle', value: false },
    { label: 'API Rate Limiting', desc: 'Enforce per-user API rate limits', type: 'toggle', value: true },
    { label: 'Audit Logging', desc: 'Log all user actions for compliance', type: 'toggle', value: true },
    { label: 'IP Allowlist Enforcement', desc: 'Restrict access to approved IP ranges', type: 'toggle', value: true },
  ];

  ipAllowlist = [
    { cidr: '10.0.0.0/8', label: 'Internal network' },
    { cidr: '172.16.0.0/12', label: 'VPN range' },
    { cidr: '203.0.113.42/32', label: 'Office static IP' },
  ];

  retentionPolicies = [
    { type: 'Transaction Data', desc: 'GL entries, journal postings, invoices', icon: 'bi-receipt', iconBg: '#E8F5F1', iconColor: '#0D6B5C', value: '7 years', options: ['1 year', '3 years', '5 years', '7 years', 'Indefinite'], currentSize: '28 GB' },
    { type: 'Agent Run Logs', desc: 'Execution traces, LLM prompts/responses', icon: 'bi-robot', iconBg: '#EDE9FE', iconColor: '#7C3AED', value: '90 days', options: ['30 days', '60 days', '90 days', '180 days', '1 year'], currentSize: '12 GB' },
    { type: 'Alert History', desc: 'Historical alert records and resolutions', icon: 'bi-bell', iconBg: '#FEF3C7', iconColor: '#D97706', value: '1 year', options: ['90 days', '180 days', '1 year', '3 years'], currentSize: '2.4 GB' },
    { type: 'Audit Logs', desc: 'User actions, login events, API calls', icon: 'bi-shield-check', iconBg: '#EFF6FF', iconColor: '#2563EB', value: '3 years', options: ['1 year', '3 years', '5 years', '7 years'], currentSize: '4.8 GB' },
    { type: 'System Metrics', desc: 'Prometheus time-series data', icon: 'bi-graph-up', iconBg: '#ECFDF5', iconColor: '#059669', value: '30 days', options: ['7 days', '14 days', '30 days', '90 days'], currentSize: '8.4 GB' },
  ];

  storageUsage = [
    { label: 'Transaction Data', size: '28 GB', pct: 28, color: '#0D6B5C' },
    { label: 'Agent Run Logs', size: '12 GB', pct: 12, color: '#7C3AED' },
    { label: 'System Metrics', size: '8.4 GB', pct: 8, color: '#059669' },
    { label: 'Audit Logs', size: '4.8 GB', pct: 5, color: '#2563EB' },
    { label: 'Alert History', size: '2.4 GB', pct: 2, color: '#D97706' },
    { label: 'Free Space', size: '44.4 GB', pct: 45, color: '#E5E7EB' },
  ];

  featureFlags: any[] = [
    { name: 'AI Auto-Resolution', desc: 'Allow AI agents to automatically resolve low-risk alerts', enabled: true, badge: 'GA', badgeBg: '#ECFDF5', badgeColor: '#059669' },
    { name: 'Natural Language Chat', desc: 'Chat with financial data using natural language queries', enabled: true, badge: 'GA', badgeBg: '#ECFDF5', badgeColor: '#059669' },
    { name: 'Predictive Forecasting', desc: 'ML-based cash flow and revenue predictions', enabled: true, badge: 'GA', badgeBg: '#ECFDF5', badgeColor: '#059669' },
    { name: 'Multi-Entity Consolidation', desc: 'Automated IC elimination and consolidation', enabled: true, badge: null, badgeBg: '', badgeColor: '' },
    { name: 'CrewAI Engine', desc: 'Experimental CrewAI agent execution engine', enabled: false, badge: 'BETA', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
    { name: 'AutoGen Engine', desc: 'Microsoft AutoGen multi-agent framework', enabled: false, badge: 'ALPHA', badgeBg: '#FEE2E2', badgeColor: '#DC2626' },
    { name: 'Voice Commands', desc: 'Voice-activated agent interactions via browser', enabled: false, badge: 'ALPHA', badgeBg: '#FEE2E2', badgeColor: '#DC2626' },
    { name: 'Custom Dashboards', desc: 'User-created dashboard layouts and saved views', enabled: false, badge: 'BETA', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
    { name: 'SOX Auto-Evidence', desc: 'Automated SOX control evidence collection', enabled: true, badge: 'BETA', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
    { name: 'Webhook Integrations', desc: 'Outbound webhooks for external system events', enabled: false, badge: 'BETA', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
  ];
}