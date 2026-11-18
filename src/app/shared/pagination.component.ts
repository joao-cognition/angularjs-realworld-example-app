import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Page links update the `?page=N` query param of the current route. */
@Component({
  selector: 'app-pagination',
  imports: [RouterLink],
  template: `
    <nav>
      <ul class="pagination">
        @for (page of pages(); track page) {
          <li class="page-item" [class.active]="page === currentPage()">
            <a
              class="page-link"
              [routerLink]="[]"
              [queryParams]="{ page: page === 1 ? null : page }"
              queryParamsHandling="merge"
              >{{ page }}</a
            >
          </li>
        }
      </ul>
    </nav>
  `,
})
export class PaginationComponent {
  readonly totalPages = input.required<number>();
  readonly currentPage = input.required<number>();

  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );
}
