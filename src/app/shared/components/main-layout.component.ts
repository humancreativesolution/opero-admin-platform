import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideMenu, lucideSearch } from '@ng-icons/lucide';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NgIconComponent],
  providers: [
    provideIcons({
      lucideMenu,
      lucideBell,
      lucideSearch,
    }),
  ],
  template: `
    <div class="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <!-- Sidebar Component -->
      <app-sidebar class="h-full shrink-0" />

      <!-- Main Content Area with Sticky Header -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Sticky Header -->
        <header class="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div class="flex items-center gap-4">
            <div class="relative w-64 hidden sm:block">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <ng-icon name="lucideSearch" class="text-sm" />
              </span>
              <input
                type="text"
                placeholder="Search resources..."
                class="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button class="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative">
              <ng-icon name="lucideBell" class="text-lg" />
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600"></span>
            </button>
            <div class="h-4 w-px bg-slate-200"></div>
            <div class="text-right hidden md:block">
              <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">Platform Mode</span>
              <span class="text-[10px] text-slate-500">Super Admin Access</span>
            </div>
          </div>
        </header>

        <!-- Scrollable Content View -->
        <main class="flex-1 overflow-auto p-6 bg-slate-50">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {}
