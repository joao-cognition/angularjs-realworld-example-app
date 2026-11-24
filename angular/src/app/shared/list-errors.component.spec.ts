import { TestBed } from '@angular/core/testing';
import { ListErrorsComponent } from './list-errors.component';

describe('ListErrorsComponent', () => {
  it('flattens the RealWorld error map into "field message" items', () => {
    const fixture = TestBed.createComponent(ListErrorsComponent);
    fixture.componentRef.setInput('errors', {
      email: ['is invalid', "can't be blank"],
      password: ['is too short'],
    });
    fixture.detectChanges();
    const items = Array.from(
      fixture.nativeElement.querySelectorAll('li') as NodeListOf<HTMLElement>,
    ).map((li) => li.textContent?.trim());
    expect(items).toEqual(['email is invalid', "email can't be blank", 'password is too short']);
  });

  it('renders nothing without errors', () => {
    const fixture = TestBed.createComponent(ListErrorsComponent);
    fixture.componentRef.setInput('errors', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });
});
