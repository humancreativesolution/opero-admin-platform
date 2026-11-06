import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div
          role="status"
          class="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg bg-white"
          [class.border-emerald-200]="toast.kind === 'success'"
          [class.border-red-200]="toast.kind === 'error'"
          [class.border-slate-200]="toast.kind === 'info'"
        >
          <span
            class="mt-1 h-2 w-2 shrink-0 rounded-full"
            [class.bg-emerald-500]="toast.kind === 'success'"
            [class.bg-red-500]="toast.kind === 'error'"
            [class.bg-indigo-500]="toast.kind === 'info'"
          ></span>
          <p class="flex-1 text-slate-700">{{ toast.message }}</p>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-700"
            aria-label="Dismiss"
            (click)="dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  private toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
