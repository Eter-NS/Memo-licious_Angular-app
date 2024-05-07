import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileToBase64',
  standalone: true,
})
export class FileToBase64Pipe implements PipeTransform {
  transform(value: File | Blob): Promise<string> {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = reject;

      reader.readAsDataURL(value);
    });
  }
}
