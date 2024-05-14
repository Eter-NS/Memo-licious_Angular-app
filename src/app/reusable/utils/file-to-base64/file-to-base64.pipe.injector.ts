import { InjectionToken } from '@angular/core';
import { FileToBase64Pipe } from './file-to-base64.pipe';

export const FILE_TO_BASE64_TOKEN = new InjectionToken<FileToBase64Pipe>(
  'fileToBase64',
  { providedIn: 'root', factory: () => new FileToBase64Pipe() }
);
