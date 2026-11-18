import { TestBed } from '@angular/core/testing';
import { ListPaginationComponent } from './list-pagination.component';

describe('ListPaginationComponent', () => {
  it('renders one item per page, marks the current one and emits clicks', async () => {
    const fixture = TestBed.createComponent(ListPaginationComponent);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('currentPage', 2);
    await fixture.whenStable();
    const items = fixture.nativeElement.querySelectorAll('li.page-item') as NodeListOf<HTMLElement>;
    expect([...items].map((i) => i.textContent?.trim())).toEqual(['1', '2', '3']);
    expect(items[1].classList).toContain('active');
    let picked = 0;
    fixture.componentInstance.pageChange.subscribe((p) => (picked = p));
    items[2].click();
    expect(picked).toBe(3);
  });
});
