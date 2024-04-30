import { Component, Input } from '@angular/core';
import { FetchErrorComponent } from './fetch-error.component';

@Component({
  selector: 'app-fetch-error-wrapper',
  standalone: true,
  imports: [FetchErrorComponent],
  template: `<app-fetch-error>{{ errorMessage }}</app-fetch-error>`,
})
export class FetchErrorWrapperComponent {
  @Input() errorMessage?: string;
}
