import { Component, computed, input, output } from '@angular/core';
import type { PaginationMeta } from '@res/index';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
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
