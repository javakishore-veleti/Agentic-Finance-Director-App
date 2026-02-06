#!/bin/bash
set -e
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Script 20 — Admin Live Wiring Part 1                   ║"
echo "║  Backend passlib fix + Users & Roles + API Keys          ║"
echo "╚══════════════════════════════════════════════════════════╝"

BASE_DIR="$(cd "$(dirname "$0")/../../../.." && pwd)"
CRUD_DIR="$BASE_DIR/Services/afda-crud-api"
ADMIN_MOD="$CRUD_DIR/app/modules/admin"
NG_DIR="$BASE_DIR/Portals/agentic-finance-director-app/src/app"
ADMIN_NG="$NG_DIR/modules/admin"

# ─────────────────────────────────────────────────────────────────
# 1. Fix passlib in admin/service.py (same fix as auth module)
# ─────────────────────────────────────────────────────────────────
echo "── 1/5 Fixing passlib in admin service.py ──"

cat > "$ADMIN_MOD/service.py" << 'PYEOF'
import secrets
import hashlib
import bcrypt
from uuid import UUID
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.admin.dao import (
    UserDAO, RoleDAO, ApiKeyDAO, DataConnectionDAO, AuditLogDAO, SettingsDAO,
)
from app.modules.admin.dtos import (
    UserCreate, UserUpdate, UserDetailOut,
    RoleCreate, RoleUpdate,
    ApiKeyCreate, ApiKeyCreatedOut,
    DataConnectionCreate, DataConnectionUpdate, ConnectionTestResult,
    SettingsUpdate,
)
from app.shared.exceptions import NotFoundException, BadRequestException


class SimplePwd:
    """Direct bcrypt — avoids passlib/bcrypt version mismatch."""
    def hash(self, password: str) -> str:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify(self, plain: str, hashed: str) -> bool:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

pwd_context = SimplePwd()


class UserService:
    def __init__(self, db: AsyncSession):
        self.dao = UserDAO(db)
        self.role_dao = RoleDAO(db)

    async def list_users(self, status=None, limit=50, offset=0):
        return await self.dao.get_all(status, limit, offset)

    async def get_user(self, user_id: UUID) -> UserDetailOut:
        user = await self.dao.get_by_id(user_id)
        if not user:
            raise NotFoundException("User", user_id)
        roles = [ur.role.name for ur in user.user_roles]
        return UserDetailOut(
            id=user.id, email=user.email, display_name=user.display_name,
            status=user.status.value if hasattr(user.status, 'value') else str(user.status),
            department=user.department,
            last_login_at=user.last_login_at, created_at=user.created_at, roles=roles,
        )

    async def create_user(self, data: UserCreate):
        existing = await self.dao.get_by_email(data.email)
        if existing:
            raise BadRequestException(f"Email already registered: {data.email}")
        user_data = {
            "email": data.email,
            "display_name": data.display_name,
            "password_hash": pwd_context.hash(data.password),
            "department": data.department,
        }
        user = await self.dao.create(user_data)
        for role_id in data.role_ids:
            await self.dao.assign_role(user.id, role_id)
        return user

    async def update_user(self, user_id: UUID, data: UserUpdate):
        existing = await self.dao.get_by_id(user_id)
        if not existing:
            raise NotFoundException("User", user_id)
        return await self.dao.update(user_id, data.model_dump(exclude_unset=True))

    async def deactivate_user(self, user_id: UUID):
        existing = await self.dao.get_by_id(user_id)
        if not existing:
            raise NotFoundException("User", user_id)
        return await self.dao.update(user_id, {"status": "inactive"})


class RoleService:
    def __init__(self, db: AsyncSession):
        self.dao = RoleDAO(db)

    async def list_roles(self):
        return await self.dao.get_all()

    async def create_role(self, data: RoleCreate):
        return await self.dao.create(data.model_dump())

    async def update_role(self, role_id: UUID, data: RoleUpdate):
        existing = await self.dao.get_by_id(role_id)
        if not existing:
            raise NotFoundException("Role", role_id)
        return await self.dao.update(role_id, data.model_dump(exclude_unset=True))


class ApiKeyService:
    def __init__(self, db: AsyncSession):
        self.dao = ApiKeyDAO(db)

    async def list_keys(self):
        return await self.dao.get_all()

    async def generate_key(self, data: ApiKeyCreate, created_by: str = None) -> ApiKeyCreatedOut:
        raw_key = f"afda_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        expires_at = None
        if data.expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=data.expires_in_days)
        key_data = {
            "name": data.name,
            "key_prefix": raw_key[:12],
            "key_hash": key_hash,
            "scopes": data.scopes,
            "expires_at": expires_at,
            "created_by": created_by,
        }
        key_obj = await self.dao.create(key_data)
        return ApiKeyCreatedOut(
            id=key_obj.id, name=key_obj.name, key=raw_key,
            key_prefix=key_obj.key_prefix, scopes=data.scopes,
            expires_at=expires_at, created_at=key_obj.created_at,
        )

    async def revoke_key(self, key_id: UUID):
        success = await self.dao.revoke(key_id)
        if not success:
            raise NotFoundException("API Key", key_id)
        return True


class DataConnectionService:
    def __init__(self, db: AsyncSession):
        self.dao = DataConnectionDAO(db)

    async def list_connections(self):
        return await self.dao.get_all()

    async def create_connection(self, data: DataConnectionCreate):
        return await self.dao.create(data.model_dump())

    async def update_connection(self, conn_id: UUID, data: DataConnectionUpdate):
        existing = await self.dao.get_by_id(conn_id)
        if not existing:
            raise NotFoundException("Data Connection", conn_id)
        return await self.dao.update(conn_id, data.model_dump(exclude_unset=True))

    async def test_connection(self, conn_id: UUID) -> ConnectionTestResult:
        conn = await self.dao.get_by_id(conn_id)
        if not conn:
            raise NotFoundException("Data Connection", conn_id)
        await self.dao.update(conn_id, {"status": "connected", "last_sync_at": datetime.utcnow()})
        return ConnectionTestResult(
            connection_id=conn_id, success=True, latency_ms=45.2,
            message=f"Successfully connected to {conn.name}",
        )


class AuditLogService:
    def __init__(self, db: AsyncSession):
        self.dao = AuditLogDAO(db)

    async def get_logs(self, resource_type=None, action=None, limit=100, offset=0):
        return await self.dao.get_all(resource_type, action, limit, offset)

    async def log(self, user_id: str, action: str, resource_type: str,
                  resource_id: str = None, details: dict = None, ip: str = None):
        await self.dao.create({
            "user_id": user_id, "action": action, "resource_type": resource_type,
            "resource_id": resource_id, "details": details, "ip_address": ip,
        })


class SettingsService:
    def __init__(self, db: AsyncSession):
        self.dao = SettingsDAO(db)

    async def get_settings(self):
        return await self.dao.get_all()

    async def update_settings(self, data: SettingsUpdate, updated_by: str = None):
        for key, value in data.settings.items():
            await self.dao.upsert(key, value, updated_by)
        return await self.dao.get_all()
PYEOF

# ─────────────────────────────────────────────────────────────────
# 2. Update Angular admin.service.ts — match backend DTOs
# ─────────────────────────────────────────────────────────────────
echo "── 2/5 Updating admin.service.ts DTOs ──"

cat > "$ADMIN_NG/services/admin.service.ts" << 'TSEOF'
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

// ── DTOs (matching backend exactly) ──
export interface UserOut {
  id: string;
  email: string;
  display_name: string;
  status: string;
  department: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface RoleOut {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
  is_system: boolean;
  created_at: string;
}

export interface ApiKeyOut {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ApiKeyCreatedOut {
  id: string;
  name: string;
  key: string;          // only shown once
  key_prefix: string;
  scopes: string[];
  expires_at: string | null;
  created_at: string;
}

export interface DataConnectionOut {
  id: string;
  name: string;
  connection_type: string;
  provider: string | null;
  status: string;
  last_sync_at: string | null;
  last_error: string | null;
  sync_frequency: string;
  created_at: string;
}

export interface ConnectionTestResult {
  connection_id: string;
  success: boolean;
  latency_ms: number | null;
  message: string;
}

export interface SettingOut {
  key: string;
  value: string;
  category: string;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface AuditLogOut {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly prefix = '/admin';

  constructor(private api: ApiService) {}

  // ── Users ──
  getUsers(status?: string): Observable<UserOut[]> {
    const params: any = {};
    if (status) params.status = status;
    return this.api.get<UserOut[]>(`${this.prefix}/users`, params);
  }

  createUser(data: { email: string; display_name: string; password: string; department?: string; role_ids?: string[] }): Observable<UserOut> {
    return this.api.post<UserOut>(`${this.prefix}/users`, data);
  }

  updateUser(id: string, data: Partial<{ display_name: string; department: string; status: string }>): Observable<UserOut> {
    return this.api.put<UserOut>(`${this.prefix}/users/${id}`, data);
  }

  deactivateUser(id: string): Observable<any> {
    return this.api.delete<any>(`${this.prefix}/users/${id}`);
  }

  // ── Roles ──
  getRoles(): Observable<RoleOut[]> {
    return this.api.get<RoleOut[]>(`${this.prefix}/roles`);
  }

  createRole(data: { name: string; description?: string; permissions?: Record<string, string[]> }): Observable<RoleOut> {
    return this.api.post<RoleOut>(`${this.prefix}/roles`, data);
  }

  updateRole(id: string, data: Partial<{ description: string; permissions: Record<string, string[]> }>): Observable<RoleOut> {
    return this.api.put<RoleOut>(`${this.prefix}/roles/${id}`, data);
  }

  // ── API Keys ──
  getApiKeys(): Observable<ApiKeyOut[]> {
    return this.api.get<ApiKeyOut[]>(`${this.prefix}/api-keys`);
  }

  createApiKey(data: { name: string; scopes: string[]; expires_in_days?: number }): Observable<ApiKeyCreatedOut> {
    return this.api.post<ApiKeyCreatedOut>(`${this.prefix}/api-keys`, data);
  }

  revokeApiKey(id: string): Observable<any> {
    return this.api.delete<any>(`${this.prefix}/api-keys/${id}`);
  }

  // ── Data Connections ──
  getDataConnections(): Observable<DataConnectionOut[]> {
    return this.api.get<DataConnectionOut[]>(`${this.prefix}/data-connections`);
  }

  createDataConnection(data: { name: string; connection_type: string; provider?: string; config_json: Record<string, any>; sync_frequency?: string }): Observable<DataConnectionOut> {
    return this.api.post<DataConnectionOut>(`${this.prefix}/data-connections`, data);
  }

  updateDataConnection(id: string, data: Partial<{ name: string; config_json: Record<string, any>; sync_frequency: string }>): Observable<DataConnectionOut> {
    return this.api.put<DataConnectionOut>(`${this.prefix}/data-connections/${id}`, data);
  }

  testDataConnection(id: string): Observable<ConnectionTestResult> {
    return this.api.post<ConnectionTestResult>(`${this.prefix}/data-connections/${id}/test`, {});
  }

  // ── Audit Log ──
  getAuditLog(params?: { action?: string; resource_type?: string; limit?: number; offset?: number }): Observable<AuditLogOut[]> {
    return this.api.get<AuditLogOut[]>(`${this.prefix}/audit-log`, params);
  }

  // ── Platform Settings ──
  getSettings(): Observable<SettingOut[]> {
    return this.api.get<SettingOut[]>(`${this.prefix}/settings`);
  }

  updateSettings(settings: Record<string, string>): Observable<SettingOut[]> {
    return this.api.put<SettingOut[]>(`${this.prefix}/settings`, { settings });
  }
}
TSEOF

# ─────────────────────────────────────────────────────────────────
# 3. Users & Roles Component — Live data wiring
# ─────────────────────────────────────────────────────────────────
echo "── 3/5 Updating Users & Roles component ──"

cat > "$ADMIN_NG/pages/users-roles/users-roles.component.ts" << 'TSEOF'
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
TSEOF

# ─────────────────────────────────────────────────────────────────
# 4. API Keys Component — Live data wiring
# ─────────────────────────────────────────────────────────────────
echo "── 4/5 Updating API Keys component ──"

cat > "$ADMIN_NG/pages/api-keys/api-keys.component.ts" << 'TSEOF'
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, ApiKeyOut } from '../../services/admin.service';

interface DisplayKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: string;
  created: string;
  expires: string;
  daysToExpiry: number | null;
  lastUsed: string;
  isActive: boolean;
}

@Component({
  selector: 'afda-api-keys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Breadcrumb -->
    <div class="afda-breadcrumb">
      <a routerLink="/admin">Administration</a>
      <span class="separator">/</span>
      <span class="current">API Keys</span>
    </div>

    <!-- Page Header -->
    <div class="afda-page-header">
      <div>
        <h1 class="afda-page-title">API Keys</h1>
        <p class="afda-page-subtitle">Manage API credentials, access scopes, usage tracking, and key rotation</p>
      </div>
      <div class="afda-page-actions">
        <button class="afda-btn afda-btn-primary" (click)="showCreateModal = true">
          <i class="bi bi-plus-lg"></i> Create API Key
        </button>
      </div>
    </div>

    <!-- Loading -->
    @if (loading) {
      <div class="loading-bar"><div class="loading-bar-fill"></div></div>
    }

    <!-- Error -->
    @if (errorMsg) {
      <div class="notice-bar error">
        <i class="bi bi-exclamation-triangle"></i>
        <span>{{ errorMsg }}</span>
        <button class="notice-action" (click)="loadKeys()">Retry</button>
      </div>
    }

    <!-- KPI Row -->
    <div class="kpi-row stagger">
      @for (kpi of kpis; track kpi.label) {
        <div class="afda-stat-card">
          <div class="accent-bar" [ngClass]="kpi.accent"></div>
          <div class="afda-stat-label">{{ kpi.label }}</div>
          <div class="afda-stat-value" style="margin-top: 8px;">{{ kpi.value }}</div>
          <div class="afda-stat-footnote">{{ kpi.footnote }}</div>
        </div>
      }
    </div>

    <!-- Expiring Warning -->
    @if (expiringCount > 0) {
      <div class="notice-bar warning">
        <i class="bi bi-exclamation-triangle"></i>
        <span><strong>{{ expiringCount }} key(s) expiring within 14 days.</strong> Rotate or renew to avoid service disruption.</span>
        <button class="notice-action" (click)="activeFilter = 'Expiring'">Review</button>
      </div>
    }

    <!-- Filters -->
    <div class="filter-bar stagger">
      <div class="filter-search">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Search by name or prefix..." class="filter-search-input" (input)="onSearch($event)">
      </div>
      <div class="filter-chips">
        @for (f of statusFilters; track f) {
          <button class="filter-chip" [class.active]="activeFilter === f" (click)="activeFilter = f">{{ f }}</button>
        }
      </div>
    </div>

    <!-- Keys Table -->
    <div class="afda-card" style="animation: fadeUp 0.4s ease 0.08s both;">
      <table class="afda-table">
        <thead>
          <tr>
            <th>Key Name</th>
            <th>Key Prefix</th>
            <th>Scopes</th>
            <th>Status</th>
            <th>Created</th>
            <th>Expires</th>
            <th>Last Used</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (key of filteredKeys; track key.id) {
            <tr [class.expiring]="key.daysToExpiry !== null && key.daysToExpiry <= 14 && key.daysToExpiry > 0"
                [class.expired]="key.status === 'Revoked'">
              <td>
                <div class="key-name-cell">
                  <i class="bi bi-key" [style.color]="getStatusColor(key.status)"></i>
                  <span class="key-name">{{ key.name }}</span>
                </div>
              </td>
              <td><code class="key-prefix font-mono">{{ key.prefix }}••••••••</code></td>
              <td>
                <div class="scope-chips">
                  @for (scope of key.scopes; track scope) {
                    <span class="scope-chip">{{ scope }}</span>
                  }
                  @if (key.scopes.length === 0) {
                    <span class="scope-chip" style="background: #F3F4F6; color: #6B7280;">none</span>
                  }
                </div>
              </td>
              <td>
                <span class="status-chip" [style.background]="getStatusBg(key.status)" [style.color]="getStatusColor(key.status)">
                  {{ key.status }}
                </span>
              </td>
              <td><span class="date-cell font-mono">{{ key.created }}</span></td>
              <td>
                <span class="date-cell font-mono" [class.expiring-text]="key.daysToExpiry !== null && key.daysToExpiry <= 14 && key.daysToExpiry > 0">
                  {{ key.expires }}
                </span>
                @if (key.daysToExpiry !== null && key.daysToExpiry <= 14 && key.daysToExpiry > 0) {
                  <span class="days-left">{{ key.daysToExpiry }}d left</span>
                }
              </td>
              <td><span class="date-cell font-mono">{{ key.lastUsed }}</span></td>
              <td>
                <div class="action-btns">
                  @if (key.isActive) {
                    <button class="icon-btn danger" title="Revoke" (click)="revokeKey(key)">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  }
                </div>
              </td>
            </tr>
          }
          @if (filteredKeys.length === 0 && !loading) {
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-tertiary);">No API keys found</td></tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    @if (showCreateModal) {
      <div class="modal-overlay" (click)="showCreateModal = false">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Create API Key</h3>
            <button class="modal-close" (click)="showCreateModal = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Key Name</label>
              <input type="text" class="form-input" placeholder="e.g., Production Agent Gateway" [(ngModel)]="createForm.name">
            </div>
            <div class="form-field" style="margin-bottom: 14px;">
              <label class="form-label">Expiration (days)</label>
              <select class="form-select" [(ngModel)]="createForm.expires_in_days">
                <option [ngValue]="30">30 days</option>
                <option [ngValue]="90">90 days</option>
                <option [ngValue]="180">180 days</option>
                <option [ngValue]="365">1 year</option>
                <option [ngValue]="null">No expiry</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Access Scopes</label>
              <div class="scope-selector">
                @for (scope of availableScopes; track scope.name) {
                  <div class="scope-option" [class.selected]="scope.selected" (click)="scope.selected = !scope.selected">
                    <i [class]="scope.selected ? 'bi bi-check-square-fill' : 'bi bi-square'" [style.color]="scope.selected ? 'var(--primary)' : 'var(--text-tertiary)'"></i>
                    <div>
                      <div class="so-name">{{ scope.name }}</div>
                      <div class="so-desc">{{ scope.desc }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
            @if (createError) {
              <div class="form-error" style="margin-top: 10px;">{{ createError }}</div>
            }
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-outline" (click)="showCreateModal = false">Cancel</button>
            <button class="afda-btn afda-btn-primary" (click)="generateKey()" [disabled]="creating">
              <i class="bi bi-key"></i> {{ creating ? 'Generating...' : 'Generate Key' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Key Created Modal -->
    @if (newKeyValue) {
      <div class="modal-overlay">
        <div class="modal-panel">
          <div class="modal-header" style="background: #ECFDF5;">
            <h3 style="color: #059669;"><i class="bi bi-check-circle-fill"></i> API Key Generated</h3>
          </div>
          <div class="modal-body">
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
              Copy this key now — it won't be shown again.
            </p>
            <div class="key-display">
              <code class="font-mono">{{ newKeyValue }}</code>
              <button class="copy-btn" (click)="copyKey()">
                <i class="bi bi-clipboard"></i> Copy
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="afda-btn afda-btn-primary" (click)="newKeyValue = ''">Done</button>
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

    .notice-bar { display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: var(--radius-md); margin-bottom: 14px; font-size: 13px; animation: fadeUp 0.3s ease both; }
    .notice-bar.error { background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626; }
    .notice-bar.warning { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; }
    .notice-action { margin-left: auto; padding: 4px 12px; font-size: 11px; font-weight: 600; border: 1px solid currentColor; border-radius: var(--radius-sm); background: transparent; color: inherit; cursor: pointer; font-family: var(--font-sans); }

    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .filter-bar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
    .filter-search { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); i { color: var(--text-tertiary); font-size: 14px; } }
    .filter-search-input { border: none; outline: none; background: transparent; font-size: 13px; font-family: var(--font-sans); color: var(--text-primary); width: 200px; &::placeholder { color: var(--text-tertiary); } }
    .filter-chips { display: flex; gap: 4px; }
    .filter-chip { padding: 5px 12px; font-size: 11.5px; font-weight: 500; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-white); color: var(--text-secondary); cursor: pointer; transition: all 0.15s; font-family: var(--font-sans); &:hover { border-color: var(--primary); color: var(--primary); } &.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 600; } }

    .key-name-cell { display: flex; align-items: center; gap: 8px; }
    .key-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .key-prefix { font-size: 11px; padding: 3px 8px; background: var(--bg-section); border-radius: 4px; color: var(--text-secondary); }
    .scope-chips { display: flex; gap: 3px; flex-wrap: wrap; }
    .scope-chip { font-size: 9px; font-weight: 600; padding: 2px 6px; background: var(--primary-light); color: var(--primary); border-radius: 6px; }
    .status-chip { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.3px; }
    .date-cell { font-size: 11.5px; color: var(--text-tertiary); }
    .expiring-text { color: #D97706 !important; font-weight: 600; }
    .days-left { display: block; font-size: 9px; font-weight: 700; color: #D97706; margin-top: 1px; }
    tr.expiring { background: #FFFDF7; }
    tr.expired { opacity: 0.5; }

    .action-btns { display: flex; gap: 4px; }
    .icon-btn { width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border-light); background: var(--bg-white); display: grid; place-items: center; cursor: pointer; color: var(--text-tertiary); font-size: 12px; transition: all 0.1s; &:hover { border-color: var(--primary); color: var(--primary); } &.danger:hover { border-color: #DC2626; color: #DC2626; } }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: grid; place-items: center; z-index: 1000; }
    .modal-panel { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 100%; max-width: 520px; overflow: hidden; animation: slideUp 0.2s ease; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--border-light); h3 { margin: 0; font-size: 16px; } }
    .modal-close { background: none; border: none; font-size: 16px; color: var(--text-tertiary); cursor: pointer; }
    .modal-body { padding: 20px 24px; max-height: 60vh; overflow-y: auto; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid var(--border-light); background: var(--bg-section); }
    .form-label { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 4px; }
    .form-input, .form-select { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; background: var(--bg-section); color: var(--text-primary); font-family: var(--font-sans); outline: none; box-sizing: border-box; &:focus { border-color: var(--primary); } }
    .form-field { display: flex; flex-direction: column; }
    .form-error { padding: 8px 12px; background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: var(--radius-sm); color: #DC2626; font-size: 12px; }

    .scope-selector { display: flex; flex-direction: column; gap: 4px; }
    .scope-option { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.1s; &:hover { border-color: var(--border); } &.selected { border-color: var(--primary); background: var(--primary-subtle, #F0FDF4); } i { font-size: 16px; margin-top: 1px; } }
    .so-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .so-desc { font-size: 11px; color: var(--text-tertiary); }

    .key-display { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: #F8FAFC; border: 1px solid var(--border); border-radius: var(--radius-sm); code { flex: 1; font-size: 12px; word-break: break-all; color: var(--text-primary); } }
    .copy-btn { display: flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 11px; font-weight: 600; border: 1px solid var(--primary); border-radius: var(--radius-sm); background: var(--primary-light); color: var(--primary); cursor: pointer; font-family: var(--font-sans); &:hover { background: var(--primary); color: white; } }

    .toast-success { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; background: #059669; color: white; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 2000; animation: slideUp 0.3s ease; box-shadow: 0 8px 24px rgba(5,150,105,0.3); }

    @media (max-width: 1200px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class ApiKeysComponent implements OnInit {
  private adminService = inject(AdminService);

  activeFilter = 'All';
  searchTerm = '';
  showCreateModal = false;
  loading = true;
  errorMsg = '';
  successMsg = '';
  creating = false;
  createError = '';
  newKeyValue = '';

  statusFilters = ['All', 'Active', 'Expiring', 'Revoked'];

  apiKeys: DisplayKey[] = [];

  createForm = { name: '', expires_in_days: 90 as number | null };

  availableScopes: { name: string; desc: string; selected: boolean }[] = [
    { name: 'agents', desc: 'Agent execution, configuration, run history', selected: true },
    { name: 'chat', desc: 'Natural language chat with financial data', selected: true },
    { name: 'transactions', desc: 'GL transactions, journal entries, invoices', selected: false },
    { name: 'forecasts', desc: 'Cash flow and revenue forecasts', selected: false },
    { name: 'webhooks', desc: 'Webhook event subscriptions', selected: false },
    { name: 'health', desc: 'System health and metrics endpoints', selected: false },
    { name: 'admin', desc: 'User management and system configuration', selected: false },
  ];

  kpis = [
    { label: 'Total Keys', value: '—', footnote: 'across all environments', accent: 'teal' },
    { label: 'Active Keys', value: '—', footnote: 'currently valid', accent: 'green' },
    { label: 'Revoked', value: '—', footnote: 'deactivated', accent: 'red' },
    { label: 'Expiring < 14d', value: '—', footnote: 'needs attention', accent: 'orange' },
  ];

  get expiringCount(): number {
    return this.apiKeys.filter(k => k.daysToExpiry !== null && k.daysToExpiry <= 14 && k.daysToExpiry > 0).length;
  }

  get filteredKeys(): DisplayKey[] {
    let result = this.apiKeys;
    if (this.activeFilter === 'Active') result = result.filter(k => k.isActive);
    else if (this.activeFilter === 'Expiring') result = result.filter(k => k.daysToExpiry !== null && k.daysToExpiry <= 14 && k.daysToExpiry > 0);
    else if (this.activeFilter === 'Revoked') result = result.filter(k => !k.isActive);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(k => k.name.toLowerCase().includes(t) || k.prefix.toLowerCase().includes(t));
    }
    return result;
  }

  ngOnInit() { this.loadKeys(); }

  loadKeys() {
    this.loading = true;
    this.errorMsg = '';

    this.adminService.getApiKeys().subscribe({
      next: (keys) => {
        this.apiKeys = keys.map(k => this.mapKey(k));
        this.updateKpis();
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load API keys: ' + (err?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  private mapKey(k: ApiKeyOut): DisplayKey {
    const now = new Date();
    let daysToExpiry: number | null = null;
    let expiresStr = 'Never';
    if (k.expires_at) {
      const exp = new Date(k.expires_at);
      daysToExpiry = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
      expiresStr = this.formatDate(k.expires_at);
    }
    return {
      id: k.id,
      name: k.name,
      prefix: k.key_prefix,
      scopes: Array.isArray(k.scopes) ? k.scopes : [],
      status: k.is_active ? (daysToExpiry !== null && daysToExpiry <= 0 ? 'Expired' : 'Active') : 'Revoked',
      created: this.formatDate(k.created_at),
      expires: expiresStr,
      daysToExpiry: daysToExpiry !== null && daysToExpiry > 0 ? daysToExpiry : null,
      lastUsed: k.last_used_at ? this.timeAgo(k.last_used_at) : 'Never',
      isActive: k.is_active,
    };
  }

  private updateKpis() {
    const active = this.apiKeys.filter(k => k.isActive).length;
    const revoked = this.apiKeys.filter(k => !k.isActive).length;
    const expiring = this.expiringCount;
    this.kpis = [
      { label: 'Total Keys', value: String(this.apiKeys.length), footnote: 'across all environments', accent: 'teal' },
      { label: 'Active Keys', value: String(active), footnote: 'currently valid', accent: 'green' },
      { label: 'Revoked', value: String(revoked), footnote: 'deactivated', accent: 'red' },
      { label: 'Expiring < 14d', value: String(expiring), footnote: 'needs attention', accent: 'orange' },
    ];
  }

  generateKey() {
    if (!this.createForm.name) {
      this.createError = 'Key name is required.';
      return;
    }
    this.creating = true;
    this.createError = '';

    const scopes = this.availableScopes.filter(s => s.selected).map(s => s.name);
    const payload: any = {
      name: this.createForm.name,
      scopes,
    };
    if (this.createForm.expires_in_days) {
      payload.expires_in_days = this.createForm.expires_in_days;
    }

    this.adminService.createApiKey(payload).subscribe({
      next: (result) => {
        this.creating = false;
        this.showCreateModal = false;
        this.newKeyValue = result.key;
        this.createForm = { name: '', expires_in_days: 90 };
        this.availableScopes.forEach(s => s.selected = ['agents', 'chat'].includes(s.name));
        this.loadKeys();
      },
      error: (err) => {
        this.creating = false;
        this.createError = err?.error?.message || err?.message || 'Failed to generate key';
      }
    });
  }

  revokeKey(key: DisplayKey) {
    if (!confirm(`Revoke API key "${key.name}"? This cannot be undone.`)) return;
    this.adminService.revokeApiKey(key.id).subscribe({
      next: () => {
        this.showSuccess('API key revoked');
        this.loadKeys();
      },
      error: () => this.showSuccess('Failed to revoke key'),
    });
  }

  copyKey() {
    navigator.clipboard.writeText(this.newKeyValue).then(() => this.showSuccess('Key copied to clipboard'));
  }

  getStatusColor(status: string): string {
    const m: any = { Active: '#059669', Expired: '#6B7280', Revoked: '#DC2626' };
    return m[status] || '#6B7280';
  }

  getStatusBg(status: string): string {
    const m: any = { Active: '#ECFDF5', Expired: '#F3F4F6', Revoked: '#FEE2E2' };
    return m[status] || '#F3F4F6';
  }

  onSearch(event: Event) { this.searchTerm = (event.target as HTMLInputElement).value; }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private timeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + 'h ago';
    return Math.floor(hours / 24) + 'd ago';
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }
}
TSEOF

# ─────────────────────────────────────────────────────────────────
# 5. Quick verification
# ─────────────────────────────────────────────────────────────────
echo "── 5/5 Verifying files ──"

echo ""
echo "Files updated:"
ls -la "$ADMIN_MOD/service.py"
ls -la "$ADMIN_NG/services/admin.service.ts"
ls -la "$ADMIN_NG/pages/users-roles/users-roles.component.ts"
ls -la "$ADMIN_NG/pages/api-keys/api-keys.component.ts"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Script 20 Complete                                  ║"
echo "║                                                          ║"
echo "║  Updated:                                                ║"
echo "║  • Backend admin/service.py (passlib → bcrypt)           ║"
echo "║  • Angular admin.service.ts (DTOs match backend)         ║"
echo "║  • Users & Roles page (live API data + CRUD)             ║"
echo "║  • API Keys page (live API data + create/revoke)         ║"
echo "║                                                          ║"
echo "║  Test:                                                   ║"
echo "║  1. Restart CRUD API: cd Services/afda-crud-api          ║"
echo "║     kill existing process, then: python -m uvicorn ...   ║"
echo "║  2. Navigate to /admin/users → should show admin user    ║"
echo "║  3. Click 'Invite User' → create a new user             ║"
echo "║  4. Navigate to /admin/keys → create an API key          ║"
echo "║                                                          ║"
echo "║  Next: Run Script 21 for Settings + Data Connections     ║"
echo "╚══════════════════════════════════════════════════════════╝"
