import * as tools from './objectTools';
import { InjectionToken } from '@angular/core';

export type OBJECT_TOOLS_TYPE = typeof tools;

export const OBJECT_TOOLS = new InjectionToken<OBJECT_TOOLS_TYPE>(
  'OBJECT_TOOLS',
  {
    factory: () => {
      return { ...tools };
    },
  }
);
