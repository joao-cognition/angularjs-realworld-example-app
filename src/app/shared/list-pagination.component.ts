import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-list-pagination',
  template: `
    <nav>
      <ul class="pagination">
        @for (pageNumber of pages(); track pageNumber) {
          <li
            class="page-item"
            [class.active]="pageNumber === currentPage()"
            (click)="$event.preventDefault(); pageChange.emit(pageNumber)"
          >
            <a class="page-link" href="">{{ pageNumber }}</a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class ListPaginationComponent {
  readonly totalPages = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly pageChange = output<number>();

  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
}
