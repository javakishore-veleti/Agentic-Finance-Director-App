import { Routes } from '@angular/router';
import { CommandCenterLayoutComponent } from './command-center-layout.component';

export const COMMAND_CENTER_ROUTES: Routes = [
  {
    path: '',
    component: CommandCenterLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview',    loadComponent: () => import('./pages/overview/overview.component').then(m => m.OverviewComponent) },
      { path: 'kpi',         loadComponent: () => import('./pages/kpi-scorecard/kpi-scorecard.component').then(m => m.KpiScorecardComponent) },
      { path: 'briefing',    loadComponent: () => import('./pages/executive-briefing/executive-briefing.component').then(m => m.ExecutiveBriefingComponent) },
      { path: 'actions',     loadComponent: () => import('./pages/action-items/action-items.component').then(m => m.ActionItemsComponent) },
    ]
  }
];
