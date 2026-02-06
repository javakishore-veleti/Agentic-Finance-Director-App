import { Routes } from '@angular/router';

export const routes: Routes = [
  /* ─── Auth (no layout shell) ───────────────────────────── */
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Sign In — Finance Director'
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
    title: 'Create Account — Finance Director'
  },

  /* ─── App Shell (navbar + sidebar + router-outlet) ─────── */
  {
    path: '',
    loadComponent: () => import('./layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      { path: '', redirectTo: 'command', pathMatch: 'full' },
      {
        path: 'command',
        loadChildren: () => import('./modules/command-center/command-center.routes').then(m => m.COMMAND_CENTER_ROUTES),
        title: 'Command Center'
      },
      {
        path: 'fpa',
        loadChildren: () => import('./modules/fpa/fpa.routes').then(m => m.FPA_ROUTES),
        title: 'FP&A'
      },
      {
        path: 'treasury',
        loadChildren: () => import('./modules/treasury/treasury.routes').then(m => m.TREASURY_ROUTES),
        title: 'Treasury'
      },
      {
        path: 'accounting',
        loadChildren: () => import('./modules/accounting/accounting.routes').then(m => m.ACCOUNTING_ROUTES),
        title: 'Accounting'
      },
      {
        path: 'agent-studio',
        loadChildren: () => import('./modules/agent-studio/agent-studio.routes').then(m => m.AGENT_STUDIO_ROUTES),
        title: 'Agent Studio'
      },
      {
        path: 'risk',
        loadChildren: () => import('./modules/risk-intelligence/risk.routes').then(m => m.RISK_ROUTES),
        title: 'Risk Intelligence'
      },
      {
        path: 'monitoring',
        loadChildren: () => import('./modules/monitoring/monitoring.routes').then(m => m.MONITORING_ROUTES),
        title: 'Monitoring'
      },
      {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        title: 'Administration'
      },
    ]
  },

  /* ─── Fallback ─────────────────────────────────────────── */
  { path: '**', redirectTo: 'login' }
];
