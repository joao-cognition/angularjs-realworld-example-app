import { TestBed } from '@angular/core/testing';
import { ListErrorsComponent } from './list-errors.component';

describe('ListErrorsComponent', () => {
  it('renders "<field> <message>" per error', async () => {
    const fixture = TestBed.createComponent(ListErrorsComponent);
    fixture.componentRef.setInput('errors', {
      email: ['is invalid'],
      password: ["can't be blank"],
    });
    await fixture.whenStable();
    const items = [...fixture.nativeElement.querySelectorAll('li')].map((li: HTMLElement) =>
      li.textContent?.trim(),
    );
    expect(items).toEqual(['email is invalid', "password can't be blank"]);
  });

  it('renders nothing without errors', async () => {
    const fixture = TestBed.createComponent(ListErrorsComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });
});
