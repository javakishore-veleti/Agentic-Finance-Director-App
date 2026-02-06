import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afda-users-roles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/admin">Administration</a>
      <span class="separator">/</span>
      <span class="current">Users & Roles</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">Users & Roles</h1>
        <p class="afda-page-subtitle">Manage team members, role assignments, and access permissions</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-outline" (click)="activeTab = 'roles'">
          <i class="bi bi-shield"></i> Manage Roles
        </button>
        <button class="afda-btn afda-btn-primary" (click)="showInviteModal = true">
          <i class="bi bi-person-plus"></i> Invite User
        </button>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="kpi-row stagger">
      @for (kpi of kpis; track kpi.label) {
        <div class="afda-stat-card">
          <div class="accent-bar" [ngClass]="kpi.accent"></div>
          <div class="afda-stat-label">{{ kpi.label }}</div>
          <div class="afda-stat-value" style="margin-top: 6px;">{{ kpi.value }}</div>
          <div class="afda-stat-footnote">{{ kpi.footnote }}</div>
        </div>
      }
    </div>

    <!-- Tabs -->
    <div class="tab-row">
      <button class="tab-btn" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">
        <i class="bi bi-people"></i> Users ({{ users.length }})
      </button>
      <button class="tab-btn" [class.active]="activeTab === 'roles'" (click)="activeTab = 'roles'">
        <i class="bi bi-shield"></i> Roles ({{ roles.length }})
      </button>
    </div>

    <!-- Users Tab -->
    @if (activeTab === 'users') {
      <!-- Filters -->
      <div class="filter-bar stagger">
        <div class="filter-search">
          <i class="bi bi-search"></i>
          <input type="text" placeholder="Search users..." class="filter-search-input" (input)="onSearch($event)">
        </div>
        <div class="filter-chips">
          @for (f of roleFilters; track f) {
            <button class="filter-chip" [class.active]="activeRoleFilter === f" (click)="activeRoleFilter = f">{{ f }}</button>
          }
        </div>
        <div class="filter-chips">
          @for (f of statusFilters; track f) {
            <button class="filter-chip" [class.active]="activeStatusFilter === f" (click)="activeStatusFilter = f">{{ f }}</button>
          }
        </div>
      </div>

      <!-- User Table -->
      <div class="afda-card" style="animation: fadeUp 0.4s ease 0.06s both;">
        <table class="afda-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>MFA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (user of filteredUsers; track user.email) {
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar" [style.background]="user.avatarColor">
                      {{ user.initials }}
                    </div>
                    <div>
                      <div class="user-name">{{ user.name }}</div>
                      <div class="user-email font-mono">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-chip" [style.background]="getRoleBg(user.role)" [style.color]="getRoleColor(user.role)">
                    {{ user.role }}
                  </span>
                </td>
                <td><span class="dept-text">{{ user.department }}</span></td>
                <td>
                  <div class="status-cell">
                    <span class="status-dot" [style.background]="getStatusColor(user.status)"></span>
                    <span [style.color]="getStatusColor(user.status)">{{ user.status }}</span>
                  </div>
                </td>
                <td><span class="last-active font-mono">{{ user.lastActive }}</span></td>
                <td>
                  <i [class]="user.mfa ? 'bi bi-shield-check' : 'bi bi-shield-x'"
                     [style.color]="user.mfa ? '#059669' : '#DC2626'"
                     style="font-size: 16px;"></i>
                </td>
                <td>
                  <button class="row-action-btn"><i class="bi bi-three-dots-vertical"></i></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Roles Tab -->
    @if (activeTab === 'roles') {
      <div class="roles-section" style="animation: fadeUp 0.4s ease 0.06s both;">
        <!-- Role Cards -->
        <div class="role-cards">
          @for (role of roles; track role.name) {
            <div class="role-card" [class.expanded]="expandedRole === role.name"
                 [style.border-left-color]="role.color">
              <div class="rc-header" (click)="expandedRole = expandedRole === role.name ? '' : role.name">
                <div class="rc-icon" [style.background]="role.iconBg">
                  <i [class]="'bi ' + role.icon" [style.color]="role.color"></i>
                </div>
                <div class="rc-info">
                  <div class="rc-name">{{ role.name }}</div>
                  <div class="rc-desc">{{ role.desc }}</div>
                </div>
                <div class="rc-meta">
                  <span class="rc-count font-mono">{{ role.userCount }} users</span>
                </div>
                <i [class]="expandedRole === role.name ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" style="color: var(--text-tertiary);"></i>
              </div>

              @if (expandedRole === role.name) {
                <div class="rc-expanded">
                  <div class="perm-grid">
                    @for (group of role.permissionGroups; track group.name) {
                      <div class="pg-section">
                        <div class="pg-title">{{ group.name }}</div>
                        @for (perm of group.permissions; track perm.name) {
                          <div class="pg-row">
                            <span class="pg-perm">{{ perm.name }}</span>
                            <div class="perm-dots">
                              @for (level of ['View', 'Create', 'Edit', 'Delete']; track level) {
                                <div class="perm-dot" [class.granted]="perm.levels.includes(level)"
                                     [title]="level">
                                  <i [class]="perm.levels.includes(level) ? 'bi bi-check' : 'bi bi-x'"></i>
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  <div class="rc-actions">
                    <button class="afda-btn afda-btn-outline afda-btn-sm">
                      <i class="bi bi-pencil"></i> Edit Role
                    </button>
                    @if (!role.system) {
                      <button class="afda-btn afda-btn-outline afda-btn-sm" style="color: #DC2626; border-color: #DC2626;">
                        <i class="bi bi-trash"></i> Delete
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Permission Legend -->
        <div class="perm-legend">
          <span class="pl-title">Permission Levels:</span>
          @for (level of ['View', 'Create', 'Edit', 'Delete']; track level) {
            <span class="pl-item">
              <span class="pl-dot granted"><i class="bi bi-check"></i></span>
              {{ level }}
            </span>
          }
        </div>
      </div>
    }

    <!-- Invite Modal -->
    @if (showInviteModal) {
      <div class="modal-overlay" (click)="showInviteModal = false">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Invite User</h3>
            <button class="modal-close" (click)="showInviteModal = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" placeholder="colleague@company.com">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" placeholder="Jane Smith">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Role</label>
              <select class="form-select">
                @for (role of roles; track role.name) {
                  <option>{{ role.name }}</option>
                }
              </select>
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Department</label>
              <select class="form-select">
                <option>Finance</option><option>Accounting</option><option>Treasury</option>
                <option>FP&A</option><option>IT</option><option>Internal Audit</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-outline" (click)="showInviteModal = false">Cancel</button>
            <button class="afda-btn afda-btn-primary" (click)="showInviteModal = false">
              <i class="bi bi-send"></i> Send Invite
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .kpi-row {
      display: grid; grid-template-columns: repeat(5, 1fr);
      gap: 12px; margin-bottom: 16px;
    }

    /* Tabs */
    .tab-row { display: flex; gap: 4px; margin-bottom: 14px; }

    .tab-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 18px; font-size: 13px; font-weight: 500;
      border: 1px solid var(--border); border-radius: var(--radius-md);
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; font-family: var(--font-sans); transition: all 0.15s;
      i { font-size: 14px; }
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active {
        background: var(--primary); border-color: var(--primary);
        color: white; font-weight: 600;
      }
    }

    /* Filters */
    .filter-bar {
      display: flex; gap: 10px; align-items: center;
      margin-bottom: 14px; flex-wrap: wrap;
    }

    .filter-search {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 14px; background: var(--bg-card);
      border: 1px solid var(--border); border-radius: var(--radius-md);
      i { color: var(--text-tertiary); font-size: 14px; }
    }

    .filter-search-input {
      border: none; outline: none; background: transparent;
      font-size: 13px; font-family: var(--font-sans);
      color: var(--text-primary); width: 160px;
      &::placeholder { color: var(--text-tertiary); }
    }

    .filter-chips { display: flex; gap: 4px; }

    .filter-chip {
      padding: 5px 12px; font-size: 11.5px; font-weight: 500;
      border: 1px solid var(--border); border-radius: 20px;
      background: var(--bg-white); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; }
    }

    /* User Cell */
    .user-cell { display: flex; align-items: center; gap: 10px; }

    .user-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      display: grid; place-items: center;
      font-size: 12px; font-weight: 700; color: white;
      flex-shrink: 0;
    }

    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .user-email { font-size: 10.5px; color: var(--text-tertiary); }

    .role-chip {
      font-size: 10px; font-weight: 700; padding: 3px 10px;
      border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px;
    }

    .dept-text { font-size: 12px; color: var(--text-secondary); }

    .status-cell { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; }

    .last-active { font-size: 11.5px; color: var(--text-tertiary); }

    .row-action-btn {
      background: none; border: none; color: var(--text-tertiary);
      cursor: pointer; font-size: 14px; padding: 4px;
      border-radius: var(--radius-sm);
      &:hover { background: var(--bg-section); color: var(--text-primary); }
    }

    /* Roles Section */
    .role-cards { display: flex; flex-direction: column; gap: 8px; }

    .role-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-left: 4px solid var(--border);
      border-radius: var(--radius-md); overflow: hidden;
      box-shadow: var(--shadow-sm);
      &.expanded { box-shadow: var(--shadow-md); }
    }

    .rc-header {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 18px; cursor: pointer;
      &:hover { background: var(--bg-section); }
    }

    .rc-icon {
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      display: grid; place-items: center; font-size: 16px; flex-shrink: 0;
    }

    .rc-info { flex: 1; }
    .rc-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .rc-desc { font-size: 12px; color: var(--text-tertiary); }
    .rc-count { font-size: 12px; color: var(--text-secondary); }

    .rc-expanded {
      padding: 0 18px 16px;
      border-top: 1px solid var(--border-light);
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }

    /* Permission Grid */
    .perm-grid {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 16px; padding: 14px 0;
    }

    .pg-title {
      font-size: 10.5px; font-weight: 700; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px;
    }

    .pg-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 0; border-bottom: 1px solid var(--border-light);
      &:last-child { border-bottom: none; }
    }

    .pg-perm { font-size: 12px; color: var(--text-secondary); }

    .perm-dots { display: flex; gap: 4px; }

    .perm-dot {
      width: 20px; height: 20px; border-radius: 4px;
      display: grid; place-items: center;
      background: #FEE2E2; color: #DC2626; font-size: 10px;
      &.granted { background: #ECFDF5; color: #059669; }
    }

    .rc-actions {
      display: flex; gap: 8px; padding-top: 12px;
      border-top: 1px solid var(--border-light);
    }

    /* Permission Legend */
    .perm-legend {
      display: flex; align-items: center; gap: 14px;
      margin-top: 14px; padding: 10px 16px;
      background: var(--bg-section); border-radius: var(--radius-sm);
    }

    .pl-title { font-size: 11px; font-weight: 700; color: var(--text-tertiary); }

    .pl-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: var(--text-secondary);
    }

    .pl-dot {
      width: 18px; height: 18px; border-radius: 3px;
      display: grid; place-items: center;
      background: #FEE2E2; color: #DC2626; font-size: 9px;
      &.granted { background: #ECFDF5; color: #059669; }
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
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      width: 100%; max-width: 480px; overflow: hidden;
      animation: slideUp 0.2s ease;
    }

    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 24px; border-bottom: 1px solid var(--border-light);
      h3 { margin: 0; font-size: 16px; }
    }

    .modal-close {
      background: none; border: none; font-size: 16px;
      color: var(--text-tertiary); cursor: pointer;
      &:hover { color: var(--text-primary); }
    }

    .modal-body { padding: 20px 24px; }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 14px 24px; border-top: 1px solid var(--border-light);
      background: var(--bg-section);
    }

    .form-label {
      font-size: 11px; font-weight: 600; color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 4px;
    }

    .form-input, .form-select {
      width: 100%; padding: 9px 12px; border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-size: 13px;
      background: var(--bg-section); color: var(--text-primary);
      font-family: var(--font-sans); outline: none; box-sizing: border-box;
      &:focus { border-color: var(--primary); }
    }

    .form-field { display: flex; flex-direction: column; }

    @media (max-width: 1100px) {
      .kpi-row { grid-template-columns: repeat(3, 1fr); }
      .perm-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class UsersRolesComponent {
  activeTab = 'users';
  activeRoleFilter = 'All';
  activeStatusFilter = 'All';
  searchTerm = '';
  expandedRole = '';
  showInviteModal = false;

  roleFilters = ['All', 'Admin', 'Controller', 'Analyst', 'Auditor', 'Viewer'];
  statusFilters = ['All', 'Active', 'Invited', 'Inactive'];

  kpis = [
    { label: 'Total Users', value: '12', footnote: 'across all roles', accent: 'teal' },
    { label: 'Active Now', value: '8', footnote: 'online in last 15m', accent: 'green' },
    { label: 'Pending Invites', value: '2', footnote: 'awaiting acceptance', accent: 'blue' },
    { label: 'MFA Enabled', value: '83%', footnote: '10 of 12 users', accent: 'purple' },
    { label: 'Roles Defined', value: '5', footnote: '2 system, 3 custom', accent: 'teal' },
  ];

  users = [
    { name: 'Sarah Chen', email: 'sarah.chen@acme.com', initials: 'SC', avatarColor: '#0D6B5C', role: 'Admin', department: 'Finance', status: 'Active', lastActive: '2 min ago', mfa: true },
    { name: 'Michael Torres', email: 'm.torres@acme.com', initials: 'MT', avatarColor: '#2563EB', role: 'Controller', department: 'Accounting', status: 'Active', lastActive: '5 min ago', mfa: true },
    { name: 'Jennifer Park', email: 'j.park@acme.com', initials: 'JP', avatarColor: '#7C3AED', role: 'Controller', department: 'Treasury', status: 'Active', lastActive: '12 min ago', mfa: true },
    { name: 'David Kim', email: 'd.kim@acme.com', initials: 'DK', avatarColor: '#059669', role: 'Analyst', department: 'FP&A', status: 'Active', lastActive: '8 min ago', mfa: true },
    { name: 'Emily Watson', email: 'e.watson@acme.com', initials: 'EW', avatarColor: '#D97706', role: 'Analyst', department: 'FP&A', status: 'Active', lastActive: '22 min ago', mfa: true },
    { name: 'Robert Liu', email: 'r.liu@acme.com', initials: 'RL', avatarColor: '#DC2626', role: 'Analyst', department: 'Accounting', status: 'Active', lastActive: '1h ago', mfa: true },
    { name: 'Maria Chen', email: 'maria.chen@acme.com', initials: 'MC', avatarColor: '#4F46E5', role: 'Auditor', department: 'Internal Audit', status: 'Active', lastActive: '35 min ago', mfa: true },
    { name: 'Alex Patel', email: 'a.patel@acme.com', initials: 'AP', avatarColor: '#0D6B5C', role: 'Auditor', department: 'Internal Audit', status: 'Active', lastActive: '45 min ago', mfa: true },
    { name: 'James Wilson', email: 'j.wilson@acme.com', initials: 'JW', avatarColor: '#6B7280', role: 'Viewer', department: 'Executive', status: 'Active', lastActive: '3h ago', mfa: false },
    { name: 'Lisa Anderson', email: 'l.anderson@acme.com', initials: 'LA', avatarColor: '#7C3AED', role: 'Viewer', department: 'Executive', status: 'Inactive', lastActive: '12 days ago', mfa: false },
    { name: 'Tom Sullivan', email: 't.sullivan@acme.com', initials: 'TS', avatarColor: '#2563EB', role: 'Analyst', department: 'Treasury', status: 'Invited', lastActive: '—', mfa: false },
    { name: 'Priya Sharma', email: 'p.sharma@acme.com', initials: 'PS', avatarColor: '#059669', role: 'Controller', department: 'Accounting', status: 'Invited', lastActive: '—', mfa: false },
  ];

  roles = [
    {
      name: 'Admin', desc: 'Full system access including user management and configuration', color: '#DC2626',
      icon: 'bi-shield-fill-check', iconBg: '#FEE2E2', userCount: 1, system: true,
      permissionGroups: [
        { name: 'User Management', permissions: [
          { name: 'Users', levels: ['View', 'Create', 'Edit', 'Delete'] },
          { name: 'Roles', levels: ['View', 'Create', 'Edit', 'Delete'] },
          { name: 'API Keys', levels: ['View', 'Create', 'Edit', 'Delete'] },
        ]},
        { name: 'Platform Config', permissions: [
          { name: 'Settings', levels: ['View', 'Edit'] },
          { name: 'Feature Flags', levels: ['View', 'Edit'] },
          { name: 'Data Connections', levels: ['View', 'Create', 'Edit', 'Delete'] },
        ]},
        { name: 'Financial Data', permissions: [
          { name: 'Transactions', levels: ['View', 'Create', 'Edit', 'Delete'] },
          { name: 'Journal Entries', levels: ['View', 'Create', 'Edit', 'Delete'] },
          { name: 'Reports', levels: ['View', 'Create', 'Edit'] },
        ]},
        { name: 'Agent Operations', permissions: [
          { name: 'Agents', levels: ['View', 'Create', 'Edit', 'Delete'] },
          { name: 'Engine Config', levels: ['View', 'Create', 'Edit', 'Delete'] },
          { name: 'Run History', levels: ['View', 'Delete'] },
        ]},
      ]
    },
    {
      name: 'Controller', desc: 'Full financial data access with agent management', color: '#0D6B5C',
      icon: 'bi-briefcase', iconBg: '#E8F5F1', userCount: 3, system: true,
      permissionGroups: [
        { name: 'Financial Data', permissions: [
          { name: 'Transactions', levels: ['View', 'Create', 'Edit'] },
          { name: 'Journal Entries', levels: ['View', 'Create', 'Edit'] },
          { name: 'Reports', levels: ['View', 'Create', 'Edit'] },
          { name: 'Close Process', levels: ['View', 'Create', 'Edit'] },
        ]},
        { name: 'Agent Operations', permissions: [
          { name: 'Agents', levels: ['View', 'Edit'] },
          { name: 'Run History', levels: ['View'] },
          { name: 'Alerts', levels: ['View', 'Edit'] },
        ]},
      ]
    },
    {
      name: 'Analyst', desc: 'Read/write on financial data, view-only on system config', color: '#2563EB',
      icon: 'bi-graph-up', iconBg: '#EFF6FF', userCount: 4, system: false,
      permissionGroups: [
        { name: 'Financial Data', permissions: [
          { name: 'Transactions', levels: ['View'] },
          { name: 'Forecasts', levels: ['View', 'Create', 'Edit'] },
          { name: 'Reports', levels: ['View', 'Create'] },
        ]},
        { name: 'Agent Operations', permissions: [
          { name: 'Agents', levels: ['View'] },
          { name: 'Chat', levels: ['View', 'Create'] },
          { name: 'Run History', levels: ['View'] },
        ]},
      ]
    },
    {
      name: 'Auditor', desc: 'Read-only access to all data for compliance review', color: '#7C3AED',
      icon: 'bi-search', iconBg: '#EDE9FE', userCount: 2, system: false,
      permissionGroups: [
        { name: 'All Modules', permissions: [
          { name: 'Financial Data', levels: ['View'] },
          { name: 'Agent Activity', levels: ['View'] },
          { name: 'Audit Log', levels: ['View'] },
          { name: 'Settings', levels: ['View'] },
        ]},
      ]
    },
    {
      name: 'Viewer', desc: 'Dashboard and report view-only access', color: '#6B7280',
      icon: 'bi-eye', iconBg: '#F3F4F6', userCount: 2, system: false,
      permissionGroups: [
        { name: 'Read Only', permissions: [
          { name: 'Dashboards', levels: ['View'] },
          { name: 'Reports', levels: ['View'] },
        ]},
      ]
    },
  ];

  get filteredUsers() {
    let result = this.users;
    if (this.activeRoleFilter !== 'All') result = result.filter(u => u.role === this.activeRoleFilter);
    if (this.activeStatusFilter !== 'All') result = result.filter(u => u.status === this.activeStatusFilter);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
    }
    return result;
  }

  getRoleBg(role: string): string {
    const m: any = { Admin: '#FEE2E2', Controller: '#E8F5F1', Analyst: '#EFF6FF', Auditor: '#EDE9FE', Viewer: '#F3F4F6' };
    return m[role] || '#F3F4F6';
  }

  getRoleColor(role: string): string {
    const m: any = { Admin: '#DC2626', Controller: '#0D6B5C', Analyst: '#2563EB', Auditor: '#7C3AED', Viewer: '#6B7280' };
    return m[role] || '#6B7280';
  }

  getStatusColor(status: string): string {
    const m: any = { Active: '#059669', Invited: '#D97706', Inactive: '#6B7280' };
    return m[status] || '#6B7280';
  }

  onSearch(event: Event) { this.searchTerm = (event.target as HTMLInputElement).value; }
}