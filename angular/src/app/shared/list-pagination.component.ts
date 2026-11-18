import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-list-pagination',
  template: `
    <nav>
      <ul class="pagination">
        @for (pageNumber of pages(); track pageNumber) {
          <li class="page-item" [class.active]="pageNumber === currentPage()" (click)="pageChange.emit(pageNumber)">
            <a class="page-link" href="" (click)="$event.preventDefault()">{{ pageNumber }}</a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class ListPaginationComponent {
  readonly totalPages = input(0);
  readonly currentPage = input(1);
  readonly pageChange = output<number>();
  protected readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
}
