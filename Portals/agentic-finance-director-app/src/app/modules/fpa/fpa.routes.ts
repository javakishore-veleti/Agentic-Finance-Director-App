import { Routes } from '@angular/router';
import { FpaLayoutComponent } from './fpa-layout.component';

export const FPA_ROUTES: Routes = [
  {
    path: '',
    component: FpaLayoutComponent,
    children: [
      { path: '', redirectTo: 'budget', pathMatch: 'full' },
      { path: 'budget',    loadComponent: () => import('./pages/budget-vs-actual/budget-vs-actual.component').then(m => m.BudgetVsActualComponent) },
      { path: 'variance',  loadComponent: () => import('./pages/variance-analysis/variance-analysis.component').then(m => m.VarianceAnalysisComponent) },
      { path: 'flux',      loadComponent: () => import('./pages/flux-commentary/flux-commentary.component').then(m => m.FluxCommentaryComponent) },
      { path: 'forecast',  loadComponent: () => import('./pages/forecasting/forecasting.component').then(m => m.ForecastingComponent) },
      { path: 'reports',   loadComponent: () => import('./pages/reports/fpa-reports.component').then(m => m.FpaReportsComponent) },
    ]
  }
];
