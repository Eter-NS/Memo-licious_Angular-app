import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileToUrl',
  standalone: true,
})
export class FileToUrlPipe implements PipeTransform {
  transform(value: File | Blob): string {
    return URL.createObjectURL(value);
  }
}
