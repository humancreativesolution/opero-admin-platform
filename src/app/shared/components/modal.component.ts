import { Component, HostListener, input, output } from '@angular/core';

/**
 * Dialog sederhana: overlay + panel. Konten diproyeksikan; tutup lewat
 * tombol ✕, klik overlay, atau tombol Escape.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-40 flex items-center justify-center p-4">
        <button
          type="button"
          class="absolute inset-0 bg-slate-900/40 cursor-default"
          aria-label="Close dialog"
          (click)="closed.emit()"
        ></button>
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          class="relative w-full rounded-xl bg-white shadow-xl border border-slate-200 max-h-[90vh] flex flex-col"
          [class.max-w-md]="size() === 'md'"
          [class.max-w-2xl]="size() === 'lg'"
        >
          <div class="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-slate-100">
            <div>
              <h2 class="text-base font-semibold text-slate-900">{{ title() }}</h2>
              @if (description()) {
                <p class="mt-1 text-xs text-slate-500">{{ description() }}</p>
              }
            </div>
            <button
              type="button"
              class="text-slate-400 hover:text-slate-700"
              aria-label="Close"
              (click)="closed.emit()"
            >
              ✕
            </button>
          </div>
          <div class="px-6 py-5 overflow-y-auto">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly size = input<'md' | 'lg'>('md');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
