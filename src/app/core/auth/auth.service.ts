import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { User, LoginInput } from '@res/index';
import { AuthGql } from './auth.gql';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private authGql = inject(AuthGql);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser() && (!isPlatformBrowser(this.platformId) || !!localStorage.getItem('access_token')));

  async login(input: LoginInput): Promise<void> {
    const { accessToken, user } = await this.authGql.login(input);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private getStoredUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
