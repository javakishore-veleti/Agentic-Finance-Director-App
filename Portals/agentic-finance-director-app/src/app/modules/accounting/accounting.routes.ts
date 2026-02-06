import { Routes } from '@angular/router';
import { AccountingLayoutComponent } from './accounting-layout.component';

export const ACCOUNTING_ROUTES: Routes = [
  {
    path: '',
    component: AccountingLayoutComponent,
    children: [
      { path: '', redirectTo: 'gl', pathMatch: 'full' },
      { path: 'gl',         loadComponent: () => import('./pages/general-ledger/general-ledger.component').then(m => m.GeneralLedgerComponent) },
      { path: 'tb',         loadComponent: () => import('./pages/trial-balance/trial-balance.component').then(m => m.TrialBalanceComponent) },
      { path: 'ic',         loadComponent: () => import('./pages/intercompany/intercompany.component').then(m => m.IntercompanyComponent) },
      { path: 'recon',      loadComponent: () => import('./pages/reconciliation/reconciliation.component').then(m => m.ReconciliationComponent) },
      { path: 'close',      loadComponent: () => import('./pages/close-management/close-management.component').then(m => m.CloseManagementComponent) },
    ]
  }
];
