import { Injectable, signal, computed, effect } from '@angular/core';
import { UserOrganization } from '../models/auth.model';

const ORG_STORAGE_KEY = 'afda_selected_org';

/**
 * OrgContextService manages the currently selected organization.
 *
 * - Persists selection in localStorage
 * - Provides the organization_id for X-Organization-Id header
 * - Exposes reactive signals for org name, code, role
 * - Emits when org changes so modules can refresh data
 */
@Injectable({ providedIn: 'root' })
export class OrgContextService {
  /** All organizations the user belongs to */
  readonly organizations = signal<UserOrganization[]>([]);

  /** Currently selected organization */
  readonly selectedOrg = signal<UserOrganization | null>(null);

  /** Derived signals */
  readonly organizationId = computed(() => this.selectedOrg()?.id ?? '');
  readonly organizationName = computed(() => this.selectedOrg()?.name ?? '');
  readonly organizationCode = computed(() => this.selectedOrg()?.code ?? '');
  readonly roleInOrg = computed(() => this.selectedOrg()?.role ?? 'viewer');
  readonly hasMultipleOrgs = computed(() => this.organizations().length > 1);

  constructor() {
    // Persist selection to localStorage on change
    effect(() => {
      const org = this.selectedOrg();
      if (org) {
        localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(org));
      }
    });
  }

  /**
   * Initialize with user's organizations (called after login/profile load).
   * Restores previous selection or falls back to default org.
   */
  initialize(orgs: UserOrganization[]): void {
    this.organizations.set(orgs);

    if (orgs.length === 0) {
      this.selectedOrg.set(null);
      return;
    }

    // Try to restore previous selection
    const stored = this._loadStored();
    if (stored) {
      const match = orgs.find((o) => o.id === stored.id);
      if (match) {
        this.selectedOrg.set(match);
        return;
      }
    }

    // Fall back to default org
    const defaultOrg = orgs.find((o) => o.is_default) ?? orgs[0];
    this.selectedOrg.set(defaultOrg);
  }

  /**
   * Switch to a different organization.
   * Returns true if switch was successful.
   */
  switchOrg(orgId: string): boolean {
    const org = this.organizations().find((o) => o.id === orgId);
    if (!org) return false;
    this.selectedOrg.set(org);
    return true;
  }

  /**
   * Clear state (called on logout).
   */
  clear(): void {
    this.organizations.set([]);
    this.selectedOrg.set(null);
    localStorage.removeItem(ORG_STORAGE_KEY);
  }

  /**
   * Check if user has a specific permission in the current org.
   */
  hasRole(...roles: string[]): boolean {
    return roles.includes(this.roleInOrg());
  }

  private _loadStored(): UserOrganization | null {
    try {
      const stored = localStorage.getItem(ORG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
