import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-list-pagination',
  template: `
    <nav>
      <ul class="pagination">
        @for (page of pages(); track page) {
          <li class="page-item" [class.active]="page === currentPage()">
            <a class="page-link" href="" (click)="$event.preventDefault(); pageChange.emit(page)">{{
              page
            }}</a>
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

  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );
}
