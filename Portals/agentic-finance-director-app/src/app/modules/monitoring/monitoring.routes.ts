import { Routes } from '@angular/router';
import { MonitoringLayoutComponent } from './monitoring-layout.component';

export const MONITORING_ROUTES: Routes = [
  {
    path: '',
    component: MonitoringLayoutComponent,
    children: [
      { path: '', redirectTo: 'health', pathMatch: 'full' },
      { path: 'health',    loadComponent: () => import('./pages/system-health/system-health.component').then(m => m.SystemHealthComponent) },
      { path: 'services',  loadComponent: () => import('./pages/service-status/service-status.component').then(m => m.ServiceStatusComponent) },
      { path: 'api',       loadComponent: () => import('./pages/api-metrics/api-metrics.component').then(m => m.ApiMetricsComponent) },
      { path: 'grafana',   loadComponent: () => import('./pages/grafana-embed/grafana-embed.component').then(m => m.GrafanaEmbedComponent) },
    ]
  }
];
