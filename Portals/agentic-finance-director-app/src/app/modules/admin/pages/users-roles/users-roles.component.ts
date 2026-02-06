import { Component } from '@angular/core';

@Component({
  selector: 'afda-adm-users',
  standalone: true,
  template: `
    <div class="afda-page-shell">
      <i class="bi bi-people"></i>
      <h2>Users & Roles</h2>
      <p>User management and role-based access control</p>
      <span class="badge-wip">Phase 3 — Administration</span>
    </div>
  `
})
export class UsersRolesComponent {}
