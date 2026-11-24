import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageTitleService } from './core/page-title.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  constructor() {
    inject(PageTitleService).listen();
  }
}
