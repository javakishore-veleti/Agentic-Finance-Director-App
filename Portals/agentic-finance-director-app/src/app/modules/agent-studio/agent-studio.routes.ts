import { Routes } from '@angular/router';
import { AgentStudioLayoutComponent } from './agent-studio-layout.component';

export const AGENT_STUDIO_ROUTES: Routes = [
  {
    path: '',
    component: AgentStudioLayoutComponent,
    children: [
      { path: '', redirectTo: 'console', pathMatch: 'full' },
      { path: 'console',    loadComponent: () => import('./pages/agent-console/agent-console.component').then(m => m.AgentConsoleComponent) },
      { path: 'workflows',  loadComponent: () => import('./pages/workflow-manager/workflow-manager.component').then(m => m.WorkflowManagerComponent) },
      { path: 'prompts',    loadComponent: () => import('./pages/prompt-library/prompt-library.component').then(m => m.PromptLibraryComponent) },
      { path: 'history',    loadComponent: () => import('./pages/execution-history/execution-history.component').then(m => m.ExecutionHistoryComponent) },
      { path: 'engine',     loadComponent: () => import('./pages/engine-config/engine-config.component').then(m => m.EngineConfigComponent) },
    ]
  }
];
