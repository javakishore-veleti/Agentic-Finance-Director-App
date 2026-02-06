import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'settings', pathMatch: 'full' },
      { path: 'settings',     loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'users',        loadComponent: () => import('./pages/users-roles/users-roles.component').then(m => m.UsersRolesComponent) },
      { path: 'keys',         loadComponent: () => import('./pages/api-keys/api-keys.component').then(m => m.ApiKeysComponent) },
      { path: 'connections',  loadComponent: () => import('./pages/data-connections/data-connections.component').then(m => m.DataConnectionsComponent) },
      { path: 'audit',        loadComponent: () => import('./pages/audit-log/audit-log.component').then(m => m.AuditLogComponent) },
    ]
  }
];
