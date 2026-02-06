import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, SettingOut } from '../../services/admin.service';

@Component({
  selector: 'afda-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <button class="afda-btn afda-btn-outline" (click)="resetDefaults()">
          <i class="bi bi-arrow-counterclockwise"></i> Reset Defaults
        </button>
        <button class="afda-btn afda-btn-primary" (click)="saveAll()" [disabled]="saving">
          <i class="bi bi-check-lg"></i> {{ saving ? 'Saving...' : 'Save All Changes' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    @if (loading) {
      <div class="loading-bar"><div class="loading-bar-fill"></div></div>
    }

    <!-- Settings Layout -->
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
                <input type="text" class="form-input" [(ngModel)]="settingsMap['org.name']">
              </div>
              <div class="form-field">
                <label class="form-label">Legal Entity</label>
                <input type="text" class="form-input" [(ngModel)]="settingsMap['org.legal_entity']">
              </div>
              <div class="form-field">
                <label class="form-label">Industry</label>
                <select class="form-select" [(ngModel)]="settingsMap['org.industry']">
                  <option>Financial Services</option>
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Fiscal Year End</label>
                <select class="form-select" [(ngModel)]="settingsMap['org.fiscal_year_end']">
                  <option>December 31</option>
                  <option>March 31</option>
                  <option>June 30</option>
                  <option>September 30</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Default Currency</label>
                <select class="form-select" [(ngModel)]="settingsMap['org.default_currency']">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Timezone</label>
                <select class="form-select" [(ngModel)]="settingsMap['org.timezone']">
                  <option>America/New_York</option>
                  <option>America/Chicago</option>
                  <option>America/Los_Angeles</option>
                  <option>Europe/London</option>
                </select>
              </div>
            </div>
          </div>
        }

        <!-- Preferences -->
        @if (activeSection === 'prefs') {
          <div class="sc-section" style="animation: fadeUp 0.3s ease both;">
            <div class="sc-title">Display Preferences</div>
            <div class="sc-desc">Customize the look and feel of the platform</div>
            <div class="pref-grid">
              @for (pref of displayPrefs; track pref.key) {
                <div class="pref-item">
                  <div class="pref-info">
                    <div class="pref-label">{{ pref.label }}</div>
                    <div class="pref-desc">{{ pref.desc }}</div>
                  </div>
                  @if (pref.type === 'toggle') {
                    <div class="toggle" [class.on]="settingsMap[pref.key] === 'true'" (click)="toggleSetting(pref.key)">
                      <div class="toggle-knob"></div>
                    </div>
                  }
                  @if (pref.type === 'select') {
                    <select class="form-select-sm" [(ngModel)]="settingsMap[pref.key]">
                      @for (opt of pref.options; track opt) {
                        <option [value]="opt">{{ opt }}</option>
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
                <select class="form-select" [(ngModel)]="settingsMap['pref.decimal_separator']">
                  <option>Period (.)</option><option>Comma (,)</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Thousands Separator</label>
                <select class="form-select" [(ngModel)]="settingsMap['pref.thousands_separator']">
                  <option>Comma (,)</option><option>Period (.)</option><option>Space</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Date Format</label>
                <select class="form-select" [(ngModel)]="settingsMap['pref.date_format']">
                  <option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Currency Display</label>
                <select class="form-select" [(ngModel)]="settingsMap['pref.currency_display']">
                  <option>Symbol</option><option>Code</option>
                </select>
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
              @for (sec of securitySettings; track sec.key) {
                <div class="pref-item">
                  <div class="pref-info">
                    <div class="pref-label">{{ sec.label }}</div>
                    <div class="pref-desc">{{ sec.desc }}</div>
                  </div>
                  @if (sec.type === 'toggle') {
                    <div class="toggle" [class.on]="settingsMap[sec.key] === 'true'" (click)="toggleSetting(sec.key)">
                      <div class="toggle-knob"></div>
                    </div>
                  }
                  @if (sec.type === 'select') {
                    <select class="form-select-sm" [(ngModel)]="settingsMap[sec.key]">
                      @for (opt of sec.options; track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  }
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
              @for (ff of featureFlags; track ff.key) {
                <div class="ff-item" [class.disabled]="settingsMap[ff.key] !== 'true'">
                  <div class="ff-info">
                    <div class="ff-name-row">
                      <span class="ff-name">{{ ff.name }}</span>
                      @if (ff.badge) {
                        <span class="ff-badge" [style.background]="ff.badgeBg" [style.color]="ff.badgeColor">{{ ff.badge }}</span>
                      }
                    </div>
                    <div class="ff-desc">{{ ff.desc }}</div>
                  </div>
                  <div class="toggle" [class.on]="settingsMap[ff.key] === 'true'" (click)="toggleSetting(ff.key)">
                    <div class="toggle-knob"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- All Settings (raw) -->
        @if (activeSection === 'raw') {
          <div class="sc-section" style="animation: fadeUp 0.3s ease both;">
            <div class="sc-title">All Platform Settings</div>
            <div class="sc-desc">Raw key-value store from database ({{ rawSettings.length }} settings)</div>
            <div class="raw-settings">
              @for (s of rawSettings; track s.key) {
                <div class="raw-row">
                  <span class="raw-key font-mono">{{ s.key }}</span>
                  <input type="text" class="raw-value font-mono" [(ngModel)]="settingsMap[s.key]">
                  <span class="raw-cat">{{ s.category }}</span>
                </div>
              }
              @if (rawSettings.length === 0) {
                <div style="text-align: center; padding: 30px; color: var(--text-tertiary);">
                  No settings found in database. Save to create initial settings.
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Success Toast -->
    @if (successMsg) {
      <div class="toast-success">
        <i class="bi bi-check-circle-fill"></i> {{ successMsg }}
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .loading-bar { height: 3px; background: var(--border-light); border-radius: 2px; overflow: hidden; margin-bottom: 12px; }
    .loading-bar-fill { height: 100%; width: 30%; background: var(--primary); border-radius: 2px; animation: loadingSlide 1.2s ease infinite; }
    @keyframes loadingSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }

    .settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 20px; min-height: 600px; }
    .settings-nav { display: flex; flex-direction: column; gap: 2px; position: sticky; top: 20px; align-self: flex-start; }
    .sn-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; font-size: 13px; font-weight: 500; border: none; border-radius: var(--radius-md); background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.15s; text-align: left; font-family: var(--font-sans); i { font-size: 15px; width: 18px; text-align: center; } &:hover { background: var(--bg-section); color: var(--text-primary); } &.active { background: var(--primary-light); color: var(--primary); font-weight: 600; } }
    .settings-content { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px 28px; box-shadow: var(--shadow-card); }
    .sc-title { font-size: 17px; font-weight: 700; color: var(--text-primary); }
    .sc-desc { font-size: 13px; color: var(--text-tertiary); margin: 4px 0 20px; }
    .sc-subtitle { font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 20px 0 12px; padding-top: 16px; border-top: 1px solid var(--border-light); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; }
    .form-field { display: flex; flex-direction: column; gap: 4px; }
    .form-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; }
    .form-input, .form-select { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; background: var(--bg-section); color: var(--text-primary); font-family: var(--font-sans); outline: none; &:focus { border-color: var(--primary); } }
    .form-select-sm { padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; background: var(--bg-section); color: var(--text-primary); font-family: var(--font-sans); outline: none; min-width: 140px; }

    .toggle { width: 42px; height: 24px; background: #D1D5DB; border-radius: 12px; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; &.on { background: var(--primary); } }
    .toggle-knob { width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: left 0.2s; }
    .toggle.on .toggle-knob { left: 20px; }

    .pref-grid { display: flex; flex-direction: column; gap: 4px; }
    .pref-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-section); border: 1px solid var(--border-light); border-radius: var(--radius-sm); }
    .pref-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .pref-desc { font-size: 11.5px; color: var(--text-tertiary); margin-top: 1px; }

    .ff-list { display: flex; flex-direction: column; gap: 4px; }
    .ff-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--bg-section); border: 1px solid var(--border-light); border-radius: var(--radius-sm); transition: opacity 0.2s; &.disabled { opacity: 0.55; } }
    .ff-name-row { display: flex; align-items: center; gap: 8px; }
    .ff-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    .ff-badge { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 8px; text-transform: uppercase; }
    .ff-desc { font-size: 11.5px; color: var(--text-tertiary); margin-top: 2px; }

    .raw-settings { display: flex; flex-direction: column; gap: 4px; }
    .raw-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--bg-section); border: 1px solid var(--border-light); border-radius: var(--radius-sm); }
    .raw-key { font-size: 12px; font-weight: 600; color: var(--primary); min-width: 200px; }
    .raw-value { flex: 1; padding: 4px 8px; border: 1px solid var(--border); border-radius: 3px; font-size: 12px; background: var(--bg-white); outline: none; &:focus { border-color: var(--primary); } }
    .raw-cat { font-size: 10px; color: var(--text-tertiary); min-width: 80px; text-align: right; }

    .toast-success { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; background: #059669; color: white; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 2000; animation: slideUp 0.3s ease; box-shadow: 0 8px 24px rgba(5,150,105,0.3); }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 900px) { .settings-layout { grid-template-columns: 1fr; } .settings-nav { flex-direction: row; overflow-x: auto; position: static; } .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class SettingsComponent implements OnInit {
  private adminService = inject(AdminService);

  activeSection = 'org';
  loading = true;
  saving = false;
  successMsg = '';

  // Raw settings from API
  rawSettings: SettingOut[] = [];

  // Editable settings map (key → value)
  settingsMap: Record<string, string> = {};

  sections = [
    { id: 'org', name: 'Organization', icon: 'bi-building' },
    { id: 'prefs', name: 'Preferences', icon: 'bi-palette' },
    { id: 'security', name: 'Security', icon: 'bi-shield-lock' },
    { id: 'features', name: 'Feature Flags', icon: 'bi-toggles' },
    { id: 'raw', name: 'All Settings', icon: 'bi-database' },
  ];

  displayPrefs = [
    { key: 'pref.dark_mode', label: 'Dark Mode', desc: 'Switch to dark theme', type: 'toggle' },
    { key: 'pref.compact_layout', label: 'Compact Layout', desc: 'Reduce spacing and padding', type: 'toggle' },
    { key: 'pref.animations', label: 'Show Animations', desc: 'Enable transition animations', type: 'toggle' },
    { key: 'pref.default_view', label: 'Default Dashboard View', desc: 'Landing page after login', type: 'select', options: ['Command Center', 'FP&A', 'Treasury', 'Accounting'] },
    { key: 'pref.table_rows', label: 'Table Rows Per Page', desc: 'Default pagination size', type: 'select', options: ['10', '25', '50', '100'] },
    { key: 'pref.refresh_interval', label: 'Chart Refresh Interval', desc: 'Auto-refresh for dashboards', type: 'select', options: ['10s', '30s', '60s', '5m', 'Manual'] },
  ];

  securitySettings = [
    { key: 'sec.mfa_required', label: 'Two-Factor Authentication', desc: 'Require MFA for all users', type: 'toggle' },
    { key: 'sec.session_timeout', label: 'Session Timeout', desc: 'Auto-logout after inactivity', type: 'select', options: ['15 minutes', '30 minutes', '1 hour', '4 hours', 'Never'] },
    { key: 'sec.password_complexity', label: 'Password Complexity', desc: 'Minimum requirements', type: 'select', options: ['Basic (8+ chars)', 'Strong (12+ chars)', 'Very Strong (16+ chars)'] },
    { key: 'sec.sso_enabled', label: 'Single Sign-On (SAML)', desc: 'Enable SSO via identity provider', type: 'toggle' },
    { key: 'sec.rate_limiting', label: 'API Rate Limiting', desc: 'Enforce per-user rate limits', type: 'toggle' },
    { key: 'sec.audit_logging', label: 'Audit Logging', desc: 'Log all user actions', type: 'toggle' },
  ];

  featureFlags = [
    { key: 'ff.ai_auto_resolution', name: 'AI Auto-Resolution', desc: 'Allow AI to auto-resolve low-risk alerts', badge: 'GA', badgeBg: '#ECFDF5', badgeColor: '#059669' },
    { key: 'ff.nl_chat', name: 'Natural Language Chat', desc: 'Chat with financial data', badge: 'GA', badgeBg: '#ECFDF5', badgeColor: '#059669' },
    { key: 'ff.predictive_forecast', name: 'Predictive Forecasting', desc: 'ML-based cash flow predictions', badge: 'GA', badgeBg: '#ECFDF5', badgeColor: '#059669' },
    { key: 'ff.multi_entity', name: 'Multi-Entity Consolidation', desc: 'Automated IC elimination', badge: null, badgeBg: '', badgeColor: '' },
    { key: 'ff.crewai_engine', name: 'CrewAI Engine', desc: 'Experimental CrewAI execution', badge: 'BETA', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
    { key: 'ff.autogen_engine', name: 'AutoGen Engine', desc: 'Microsoft AutoGen framework', badge: 'ALPHA', badgeBg: '#FEE2E2', badgeColor: '#DC2626' },
    { key: 'ff.voice_commands', name: 'Voice Commands', desc: 'Voice-activated agent interactions', badge: 'ALPHA', badgeBg: '#FEE2E2', badgeColor: '#DC2626' },
    { key: 'ff.custom_dashboards', name: 'Custom Dashboards', desc: 'User-created dashboard layouts', badge: 'BETA', badgeBg: '#FEF3C7', badgeColor: '#92400E' },
  ];

  // Default values for settings that may not exist in DB
  private defaults: Record<string, string> = {
    'org.name': 'Acme Financial Corp',
    'org.legal_entity': 'Acme Financial Corporation, Inc.',
    'org.industry': 'Financial Services',
    'org.fiscal_year_end': 'December 31',
    'org.default_currency': 'USD',
    'org.timezone': 'America/New_York',
    'pref.dark_mode': 'false',
    'pref.compact_layout': 'false',
    'pref.animations': 'true',
    'pref.default_view': 'Command Center',
    'pref.table_rows': '25',
    'pref.refresh_interval': '30s',
    'pref.decimal_separator': 'Period (.)',
    'pref.thousands_separator': 'Comma (,)',
    'pref.date_format': 'MM/DD/YYYY',
    'pref.currency_display': 'Symbol',
    'sec.mfa_required': 'true',
    'sec.session_timeout': '30 minutes',
    'sec.password_complexity': 'Strong (12+ chars)',
    'sec.sso_enabled': 'false',
    'sec.rate_limiting': 'true',
    'sec.audit_logging': 'true',
    'ff.ai_auto_resolution': 'true',
    'ff.nl_chat': 'true',
    'ff.predictive_forecast': 'true',
    'ff.multi_entity': 'true',
    'ff.crewai_engine': 'false',
    'ff.autogen_engine': 'false',
    'ff.voice_commands': 'false',
    'ff.custom_dashboards': 'false',
  };

  ngOnInit() { this.loadSettings(); }

  loadSettings() {
    this.loading = true;
    // Start with defaults
    this.settingsMap = { ...this.defaults };

    this.adminService.getSettings().subscribe({
      next: (settings) => {
        this.rawSettings = settings;
        // Override defaults with DB values
        for (const s of settings) {
          this.settingsMap[s.key] = s.value;
        }
        this.loading = false;
      },
      error: () => {
        // Use defaults on error
        this.loading = false;
      }
    });
  }

  toggleSetting(key: string) {
    this.settingsMap[key] = this.settingsMap[key] === 'true' ? 'false' : 'true';
  }

  saveAll() {
    this.saving = true;
    this.adminService.updateSettings(this.settingsMap).subscribe({
      next: (settings) => {
        this.rawSettings = settings;
        this.saving = false;
        this.showSuccess('Settings saved successfully');
      },
      error: () => {
        this.saving = false;
        this.showSuccess('Failed to save settings');
      }
    });
  }

  resetDefaults() {
    if (!confirm('Reset all settings to defaults? Unsaved changes will be lost.')) return;
    this.settingsMap = { ...this.defaults };
    this.showSuccess('Settings reset to defaults (not saved yet)');
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }
}
