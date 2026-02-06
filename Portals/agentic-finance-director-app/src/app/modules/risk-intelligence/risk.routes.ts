import { Routes } from '@angular/router';
import { RiskLayoutComponent } from './risk-layout.component';

export const RISK_ROUTES: Routes = [
  {
    path: '',
    component: RiskLayoutComponent,
    children: [
      { path: '', redirectTo: 'alerts', pathMatch: 'full' },
      { path: 'alerts',     loadComponent: () => import('./pages/alert-center/alert-center.component').then(m => m.AlertCenterComponent) },
      { path: 'dashboard',  loadComponent: () => import('./pages/risk-dashboard/risk-dashboard.component').then(m => m.RiskDashboardComponent) },
      { path: 'rules',      loadComponent: () => import('./pages/alert-rules/alert-rules.component').then(m => m.AlertRulesComponent) },
      { path: 'history',    loadComponent: () => import('./pages/alert-history/alert-history.component').then(m => m.AlertHistoryComponent) },
    ]
  }
];
