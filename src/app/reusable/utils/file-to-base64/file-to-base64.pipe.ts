import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment.dev';

@Pipe({
  name: 'fileToBase64',
  standalone: true,
})
export class FileToBase64Pipe implements PipeTransform {
  transform(value: File | Blob): Promise<string | null> {
    const reader = new FileReader();

    return new Promise((resolve) => {
      // Set callbacks
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (event) => {
        if (!environment.production) {
          console.error(event.target?.error);
        }
        resolve(null);
      };

      // Initialize reader
      reader.readAsDataURL(value);
    });
  }
}
