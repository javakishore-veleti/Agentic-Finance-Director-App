import { Routes } from '@angular/router';
import { TreasuryLayoutComponent } from './treasury-layout.component';

export const TREASURY_ROUTES: Routes = [
  {
    path: '',
    component: TreasuryLayoutComponent,
    children: [
      { path: '', redirectTo: 'cash', pathMatch: 'full' },
      { path: 'cash',       loadComponent: () => import('./pages/cash-position/cash-position.component').then(m => m.CashPositionComponent) },
      { path: 'forecast',   loadComponent: () => import('./pages/cash-forecast/cash-forecast.component').then(m => m.CashForecastComponent) },
      { path: 'liquidity',  loadComponent: () => import('./pages/liquidity-risk/liquidity-risk.component').then(m => m.LiquidityRiskComponent) },
      { path: 'ar-aging',   loadComponent: () => import('./pages/ar-aging/ar-aging.component').then(m => m.ArAgingComponent) },
      { path: 'banks',      loadComponent: () => import('./pages/bank-accounts/bank-accounts.component').then(m => m.BankAccountsComponent) },
    ]
  }
];
