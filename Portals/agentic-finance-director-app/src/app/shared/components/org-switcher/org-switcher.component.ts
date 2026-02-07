import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgContextService } from '../../../core/services/org-context.service';
import { UserOrganization } from '../../../core/models/auth.model';

@Component({
  selector: 'app-org-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (orgContext.hasMultipleOrgs()) {
      <div class="org-switcher">
        <button
          class="org-switcher-btn"
          (click)="toggleDropdown()"
          [class.open]="isOpen"
        >
          <span class="org-code">{{ orgContext.organizationCode() }}</span>
          <span class="org-name">{{ orgContext.organizationName() }}</span>
          <svg class="chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5L6 8L9 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>

        @if (isOpen) {
          <div class="org-dropdown" (click)="$event.stopPropagation()">
            <div class="org-dropdown-header">Switch Organization</div>
            @for (org of orgContext.organizations(); track org.id) {
              <button
                class="org-option"
                [class.active]="org.id === orgContext.organizationId()"
                (click)="selectOrg(org)"
              >
                <span class="option-code">{{ org.code }}</span>
                <span class="option-name">{{ org.name }}</span>
                <span class="option-role">{{ org.role }}</span>
                @if (org.is_default) {
                  <span class="default-badge">default</span>
                }
              </button>
            }
          </div>
          <div class="org-backdrop" (click)="isOpen = false"></div>
        }
      </div>
    } @else if (orgContext.selectedOrg()) {
      <div class="org-single">
        <span class="org-code">{{ orgContext.organizationCode() }}</span>
        <span class="org-name">{{ orgContext.organizationName() }}</span>
      </div>
    }
  `,
  styles: [`
    .org-switcher { position: relative; }

    .org-switcher-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.15s;
      font-size: 13px;
    }
    .org-switcher-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); }
    .org-switcher-btn.open { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); }

    .org-code {
      background: rgba(99,102,241,0.3);
      color: #a5b4fc;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .org-name { font-weight: 500; }
    .chevron { transition: transform 0.2s; }
    .open .chevron { transform: rotate(180deg); }

    .org-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      min-width: 280px;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.3);
      z-index: 1001;
      overflow: hidden;
    }
    .org-dropdown-header {
      padding: 10px 14px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .org-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 14px;
      border: none;
      background: transparent;
      color: #cbd5e1;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      transition: background 0.1s;
    }
    .org-option:hover { background: rgba(255,255,255,0.05); }
    .org-option.active { background: rgba(99,102,241,0.15); color: #a5b4fc; }
    .option-code {
      background: rgba(99,102,241,0.2);
      color: #a5b4fc;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
    }
    .option-name { flex: 1; }
    .option-role { font-size: 11px; color: #64748b; }
    .default-badge {
      font-size: 9px;
      background: rgba(34,197,94,0.15);
      color: #4ade80;
      padding: 1px 5px;
      border-radius: 3px;
    }

    .org-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
    }

    .org-single {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      color: #94a3b8;
      font-size: 13px;
    }
  `],
})
export class OrgSwitcherComponent {
  orgContext = inject(OrgContextService);
  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectOrg(org: UserOrganization): void {
    this.orgContext.switchOrg(org.id);
    this.isOpen = false;
    // Reload current page to refresh data with new org context
    window.location.reload();
  }
}
