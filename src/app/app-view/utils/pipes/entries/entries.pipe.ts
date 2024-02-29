import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'entries',
  standalone: true,
})
export class EntriesPipe implements PipeTransform {
  transform<T extends object>(value: T) {
    return Object.entries(value).map(([key, value]) => ({ key, value }));
  }
}
