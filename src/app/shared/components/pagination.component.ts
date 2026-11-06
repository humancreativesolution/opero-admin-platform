import { Component, computed, input, output } from '@angular/core';
import type { PaginationMeta } from '@res/index';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (meta(); as m) {
      <div class="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
        <span>{{ rangeLabel() }}</span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="!m.hasPrevPage"
            (click)="pageChange.emit(m.page - 1)"
          >
            Previous
          </button>
          <span>Page {{ m.page }} of {{ m.totalPages || 1 }}</span>
          <button
            type="button"
            class="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            [disabled]="!m.hasNextPage"
            (click)="pageChange.emit(m.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly meta = input<PaginationMeta | null>(null);
  readonly pageChange = output<number>();

  readonly rangeLabel = computed(() => {
    const m = this.meta();
    if (!m || m.totalCount === 0) return 'No results';
    const from = (m.page - 1) * m.limit + 1;
    const to = Math.min(m.page * m.limit, m.totalCount);
    return `Showing ${from}–${to} of ${m.totalCount}`;
  });
}
