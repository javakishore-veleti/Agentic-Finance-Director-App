import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, UserOut, RoleOut } from '../../services/admin.service';

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  role: string;
  department: string;
  status: string;
  lastActive: string;
  mfa: boolean;
}

interface DisplayRole {
  id: string;
  name: string;
  desc: string;
  color: string;
  icon: string;
  iconBg: string;
  userCount: number;
  system: boolean;
  permissionGroups: { name: string; permissions: { name: string; levels: string[] }[] }[];
}

@Component({
  selector: 'afda-users-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

    <!-- Loading -->
    @if (loading) {
      <div class="loading-bar">
        <div class="loading-bar-fill"></div>
      </div>
    }

    <!-- Error -->
    @if (errorMsg) {
      <div class="notice-bar error">
        <i class="bi bi-exclamation-triangle"></i>
        <span>{{ errorMsg }}</span>
        <button class="notice-action" (click)="loadData()">Retry</button>
      </div>
    }

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
              <th>Department</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Created</th>
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
                <td><span class="dept-text">{{ user.department || '—' }}</span></td>
                <td>
                  <div class="status-cell">
                    <span class="status-dot" [style.background]="getStatusColor(user.status)"></span>
                    <span [style.color]="getStatusColor(user.status)">{{ user.status }}</span>
                  </div>
                </td>
                <td><span class="last-active font-mono">{{ user.lastActive }}</span></td>
                <td><span class="last-active font-mono">{{ user.role }}</span></td>
                <td>
                  <div class="action-btns">
                    @if (user.status !== 'inactive') {
                      <button class="icon-btn danger" title="Deactivate" (click)="deactivateUser(user)">
                        <i class="bi bi-person-x"></i>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
            @if (filteredUsers.length === 0) {
              <tr><td colspan="6" style="text-align:center; padding: 40px; color: var(--text-tertiary);">No users found</td></tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Roles Tab -->
    @if (activeTab === 'roles') {
      <div class="roles-section" style="animation: fadeUp 0.4s ease 0.06s both;">
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
                  @if (role.system) {
                    <span class="system-badge">SYSTEM</span>
                  }
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
                                <div class="perm-dot" [class.granted]="perm.levels.includes(level)" [title]="level">
                                  <i [class]="perm.levels.includes(level) ? 'bi bi-check' : 'bi bi-x'"></i>
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    }
                    @if (role.permissionGroups.length === 0) {
                      <div class="pg-section">
                        <div class="pg-title">No permissions configured</div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
          @if (roles.length === 0) {
            <div style="text-align:center; padding: 40px; color: var(--text-tertiary);">No roles found</div>
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
              <input type="email" class="form-input" placeholder="colleague@company.com" [(ngModel)]="inviteForm.email">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" placeholder="Jane Smith" [(ngModel)]="inviteForm.display_name">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" placeholder="Minimum 8 characters" [(ngModel)]="inviteForm.password">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Role</label>
              <select class="form-select" [(ngModel)]="inviteForm.role_id">
                <option value="">Select a role...</option>
                @for (role of roles; track role.id) {
                  <option [value]="role.id">{{ role.name }}</option>
                }
              </select>
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Department</label>
              <select class="form-select" [(ngModel)]="inviteForm.department">
                <option>Finance</option><option>Accounting</option><option>Treasury</option>
                <option>FP&A</option><option>IT</option><option>Internal Audit</option>
              </select>
            </div>
            @if (inviteError) {
              <div class="form-error">{{ inviteError }}</div>
            }
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-outline" (click)="showInviteModal = false">Cancel</button>
            <button class="afda-btn afda-btn-primary" (click)="createUser()" [disabled]="creating">
              <i class="bi bi-send"></i> {{ creating ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </div>
      </div>
    }

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

    .notice-bar { display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: var(--radius-md); margin-bottom: 14px; font-size: 13px; }
    .notice-bar.error { background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626; }
    .notice-action { margin-left: auto; padding: 4px 12px; font-size: 11px; font-weight: 600; border: 1px solid currentColor; border-radius: var(--radius-sm); background: transparent; color: inherit; cursor: pointer; font-family: var(--font-sans); }

    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }

    .tab-row { display: flex; gap: 4px; margin-bottom: 14px; }
    .tab-btn {
      display: flex; align-items: center; gap: 6px; padding: 9px 18px; font-size: 13px; font-weight: 500;
      border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-white);
      color: var(--text-secondary); cursor: pointer; font-family: var(--font-sans); transition: all 0.15s;
      i { font-size: 14px; }
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--primary); border-color: var(--primary); color: white; font-weight: 600; }
    }

    .filter-bar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
    .filter-search { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); i { color: var(--text-tertiary); font-size: 14px; } }
    .filter-search-input { border: none; outline: none; background: transparent; font-size: 13px; font-family: var(--font-sans); color: var(--text-primary); width: 160px; &::placeholder { color: var(--text-tertiary); } }
    .filter-chips { display: flex; gap: 4px; }
    .filter-chip { padding: 5px 12px; font-size: 11.5px; font-weight: 500; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-white); color: var(--text-secondary); cursor: pointer; transition: all 0.15s; font-family: var(--font-sans); &:hover { border-color: var(--primary); color: var(--primary); } &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; } }

    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 700; color: white; flex-shrink: 0; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .user-email { font-size: 10.5px; color: var(--text-tertiary); }
    .dept-text { font-size: 12px; color: var(--text-secondary); }
    .status-cell { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; }
    .last-active { font-size: 11.5px; color: var(--text-tertiary); }

    .action-btns { display: flex; gap: 4px; }
    .icon-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-white); display: grid; place-items: center; cursor: pointer; color: var(--text-tertiary); font-size: 12px; transition: all 0.1s; &:hover { border-color: var(--primary); color: var(--primary); } &.danger:hover { border-color: #DC2626; color: #DC2626; } }

    .role-cards { display: flex; flex-direction: column; gap: 8px; }
    .role-card { background: var(--bg-card); border: 1px solid var(--border); border-left: 4px solid var(--border); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); &.expanded { box-shadow: var(--shadow-md); } }
    .rc-header { display: flex; align-items: center; gap: 14px; padding: 14px 18px; cursor: pointer; &:hover { background: var(--bg-section); } }
    .rc-icon { width: 36px; height: 36px; border-radius: var(--radius-sm); display: grid; place-items: center; font-size: 16px; flex-shrink: 0; }
    .rc-info { flex: 1; }
    .rc-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .rc-desc { font-size: 12px; color: var(--text-tertiary); }
    .system-badge { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 8px; background: #F3F4F6; color: #6B7280; text-transform: uppercase; }
    .rc-expanded { padding: 0 18px 16px; border-top: 1px solid var(--border-light); animation: slideDown 0.2s ease; }
    @keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }
    .perm-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 14px 0; }
    .pg-title { font-size: 10.5px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px; }
    .pg-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid var(--border-light); &:last-child { border-bottom: none; } }
    .pg-perm { font-size: 12px; color: var(--text-secondary); }
    .perm-dots { display: flex; gap: 4px; }
    .perm-dot { width: 20px; height: 20px; border-radius: 4px; display: grid; place-items: center; background: #FEE2E2; color: #DC2626; font-size: 10px; &.granted { background: #ECFDF5; color: #059669; } }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: grid; place-items: center; z-index: 1000; animation: fadeIn 0.15s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-panel { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 100%; max-width: 480px; overflow: hidden; animation: slideUp 0.2s ease; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--border-light); h3 { margin: 0; font-size: 16px; } }
    .modal-close { background: none; border: none; font-size: 16px; color: var(--text-tertiary); cursor: pointer; &:hover { color: var(--text-primary); } }
    .modal-body { padding: 20px 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--border-light); background: var(--bg-section); }
    .form-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 4px; }
    .form-input, .form-select { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; background: var(--bg-section); color: var(--text-primary); font-family: var(--font-sans); outline: none; box-sizing: border-box; &:focus { border-color: var(--primary); } }
    .form-field { display: flex; flex-direction: column; }
    .form-error { padding: 8px 12px; background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: var(--radius-sm); color: #DC2626; font-size: 12px; margin-top: 4px; }

    .toast-success { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; background: #059669; color: white; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 2000; animation: slideUp 0.3s ease; box-shadow: 0 8px 24px rgba(5,150,105,0.3); }

    @media (max-width: 1100px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } .perm-grid { grid-template-columns: 1fr; } }
  `]
})
export class UsersRolesComponent implements OnInit {
  private adminService = inject(AdminService);

  activeTab = 'users';
  activeStatusFilter = 'All';
  searchTerm = '';
  expandedRole = '';
  showInviteModal = false;
  loading = true;
  errorMsg = '';
  successMsg = '';
  creating = false;
  inviteError = '';

  statusFilters = ['All', 'Active', 'Inactive'];

  users: DisplayUser[] = [];
  roles: DisplayRole[] = [];

  inviteForm = { email: '', display_name: '', password: '', role_id: '', department: 'Finance' };

  kpis = [
    { label: 'Total Users', value: '—', footnote: 'across all roles', accent: 'teal' },
    { label: 'Active', value: '—', footnote: 'active accounts', accent: 'green' },
    { label: 'Inactive', value: '—', footnote: 'deactivated', accent: 'orange' },
    { label: 'Roles Defined', value: '—', footnote: 'system + custom', accent: 'purple' },
  ];

  // ── Color palette for avatars ──
  private avatarColors = ['#0D6B5C', '#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#4F46E5', '#6B7280'];
  private roleColors: Record<string, { color: string; icon: string; iconBg: string }> = {
    admin:      { color: '#DC2626', icon: 'bi-shield-fill-check', iconBg: '#FEE2E2' },
    controller: { color: '#0D6B5C', icon: 'bi-briefcase',        iconBg: '#E8F5F1' },
    analyst:    { color: '#2563EB', icon: 'bi-graph-up',          iconBg: '#EFF6FF' },
    auditor:    { color: '#7C3AED', icon: 'bi-search',            iconBg: '#EDE9FE' },
    viewer:     { color: '#6B7280', icon: 'bi-eye',               iconBg: '#F3F4F6' },
    cfo:        { color: '#059669', icon: 'bi-star-fill',         iconBg: '#ECFDF5' },
  };

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.errorMsg = '';

    this.adminService.getUsers().subscribe({
      next: (apiUsers) => {
        this.users = apiUsers.map((u, i) => this.mapUser(u, i));
        this.updateKpis();
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load users: ' + (err?.message || 'Unknown error');
        this.loading = false;
      }
    });

    this.adminService.getRoles().subscribe({
      next: (apiRoles) => {
        this.roles = apiRoles.map(r => this.mapRole(r));
        this.updateKpis();
      },
      error: () => {} // non-critical
    });
  }

  private mapUser(u: UserOut, idx: number): DisplayUser {
    const name = u.display_name || u.email.split('@')[0];
    const parts = name.split(' ');
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
    return {
      id: u.id,
      name,
      email: u.email,
      initials,
      avatarColor: this.avatarColors[idx % this.avatarColors.length],
      role: '—',
      department: u.department || '—',
      status: this.capitalize(u.status),
      lastActive: u.last_login_at ? this.timeAgo(u.last_login_at) : 'Never',
      mfa: false,
    };
  }

  private mapRole(r: RoleOut): DisplayRole {
    const key = r.name.toLowerCase();
    const style = this.roleColors[key] || { color: '#6B7280', icon: 'bi-person', iconBg: '#F3F4F6' };
    const permissionGroups = this.buildPermGroups(r.permissions);
    return {
      id: r.id,
      name: r.name,
      desc: r.description || 'No description',
      color: style.color,
      icon: style.icon,
      iconBg: style.iconBg,
      userCount: 0,
      system: r.is_system,
      permissionGroups,
    };
  }

  private buildPermGroups(perms: Record<string, any>): { name: string; permissions: { name: string; levels: string[] }[] }[] {
    if (!perms || Object.keys(perms).length === 0) return [];
    return Object.entries(perms).map(([groupName, groupPerms]) => ({
      name: groupName,
      permissions: Array.isArray(groupPerms)
        ? groupPerms.map((p: any) => typeof p === 'string' ? { name: p, levels: ['View'] } : p)
        : Object.entries(groupPerms as Record<string, string[]>).map(([name, levels]) => ({ name, levels })),
    }));
  }

  private updateKpis() {
    const active = this.users.filter(u => u.status.toLowerCase() === 'active').length;
    const inactive = this.users.filter(u => u.status.toLowerCase() === 'inactive').length;
    this.kpis = [
      { label: 'Total Users', value: String(this.users.length), footnote: 'across all roles', accent: 'teal' },
      { label: 'Active', value: String(active), footnote: 'active accounts', accent: 'green' },
      { label: 'Inactive', value: String(inactive), footnote: 'deactivated', accent: 'orange' },
      { label: 'Roles Defined', value: String(this.roles.length), footnote: 'system + custom', accent: 'purple' },
    ];
  }

  get filteredUsers(): DisplayUser[] {
    let result = this.users;
    if (this.activeStatusFilter !== 'All') result = result.filter(u => u.status === this.activeStatusFilter);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
    }
    return result;
  }

  createUser() {
    if (!this.inviteForm.email || !this.inviteForm.display_name || !this.inviteForm.password) {
      this.inviteError = 'Please fill in email, name, and password.';
      return;
    }
    if (this.inviteForm.password.length < 8) {
      this.inviteError = 'Password must be at least 8 characters.';
      return;
    }
    this.creating = true;
    this.inviteError = '';

    const payload: any = {
      email: this.inviteForm.email,
      display_name: this.inviteForm.display_name,
      password: this.inviteForm.password,
      department: this.inviteForm.department,
      role_ids: this.inviteForm.role_id ? [this.inviteForm.role_id] : [],
    };

    this.adminService.createUser(payload).subscribe({
      next: () => {
        this.creating = false;
        this.showInviteModal = false;
        this.inviteForm = { email: '', display_name: '', password: '', role_id: '', department: 'Finance' };
        this.showSuccess('User created successfully');
        this.loadData();
      },
      error: (err) => {
        this.creating = false;
        this.inviteError = err?.error?.message || err?.message || 'Failed to create user';
      }
    });
  }

  deactivateUser(user: DisplayUser) {
    if (!confirm(`Deactivate ${user.name}?`)) return;
    this.adminService.deactivateUser(user.id).subscribe({
      next: () => {
        this.showSuccess(`${user.name} deactivated`);
        this.loadData();
      },
      error: () => this.showSuccess('Failed to deactivate user'),
    });
  }

  getStatusColor(status: string): string {
    const m: any = { Active: '#059669', Inactive: '#6B7280', Invited: '#D97706' };
    return m[status] || '#6B7280';
  }

  onSearch(event: Event) { this.searchTerm = (event.target as HTMLInputElement).value; }

  private capitalize(s: string): string { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '—'; }

  private timeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }
}
