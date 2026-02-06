import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>({
    id: '1',
    email: 'admin@afda.local',
    displayName: 'Admin User',
    role: 'admin',
    avatarInitials: 'FD',
  });

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  login(email: string, _password: string): void {
    // Stub — will integrate with real auth later
    this.currentUser.set({
      id: '1', email, displayName: 'Admin User', role: 'admin', avatarInitials: 'FD'
    });
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
