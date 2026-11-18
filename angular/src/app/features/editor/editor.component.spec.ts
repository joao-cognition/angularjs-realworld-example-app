import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ArticlesService } from '../../core/articles.service';
import { Article } from '../../core/models';
import { EditorComponent } from './editor.component';

describe('EditorComponent', () => {
  let fixture: ComponentFixture<EditorComponent>;
  let editor: EditorComponent;
  let save: ReturnType<typeof vi.fn>;
  let el: HTMLElement;

  beforeEach(async () => {
    save = vi.fn();
    TestBed.configureTestingModule({
      imports: [EditorComponent],
      providers: [provideRouter([]), { provide: ArticlesService, useValue: { save } }],
    });
    fixture = TestBed.createComponent(EditorComponent);
    editor = fixture.componentInstance;
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  const pills = () =>
    [...el.querySelectorAll('.tag-list .tag-pill')].map((p) => p.textContent!.trim());

  function typeTag(value: string) {
    const input = el.querySelector<HTMLInputElement>('input[placeholder="Enter tags"]')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
  }

  it('Enter adds a tag, clears the field and the x removes it', async () => {
    typeTag('alpha');
    typeTag('beta');
    await fixture.whenStable();
    expect(pills()).toEqual(['alpha', 'beta']);
    expect(editor.tagField()).toBe('');
    el.querySelector<HTMLElement>('.tag-pill i')!.click();
    await fixture.whenStable();
    expect(pills()).toEqual(['beta']);
  });

  it('ignores blank and duplicate tags', async () => {
    typeTag('alpha');
    typeTag('   ');
    typeTag('alpha');
    await fixture.whenStable();
    expect(pills()).toEqual(['alpha']);
    expect(editor.tagField()).toBe('alpha');
  });

  it('prefills the form from the resolved article and saves with its slug', async () => {
    const article = {
      slug: 's',
      title: 'T',
      description: 'D',
      body: 'B',
      tagList: ['x'],
    } as Article;
    fixture.componentRef.setInput('article', article);
    await fixture.whenStable();
    expect(el.querySelector<HTMLInputElement>('input[placeholder="Article Title"]')!.value).toBe(
      'T',
    );
    expect(pills()).toEqual(['x']);

    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    save.mockReturnValue(of({ ...article, slug: 's2' }));
    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(save).toHaveBeenCalledWith({
      slug: 's',
      title: 'T',
      description: 'D',
      body: 'B',
      tagList: ['x'],
    });
    expect(navigate).toHaveBeenCalledWith(['/article', 's2']);
  });

  it('shows server errors and re-enables the form', async () => {
    save.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 422, error: { errors: { title: ["can't be blank"] } } }),
      ),
    );
    el.querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    expect(el.querySelector('.error-messages li')!.textContent!.trim()).toBe(
      "title can't be blank",
    );
    expect(editor.isSubmitting()).toBe(false);
    expect(el.querySelector('fieldset')!.disabled).toBe(false);
  });
});
