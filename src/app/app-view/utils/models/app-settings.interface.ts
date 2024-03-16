export type GroupRemovingStrategy = 'slow' | 'fast';

export type ThemeOptions = 'auto' | 'light' | 'dark';

export interface AppSettingsToken {
  theme: ThemeOptions;
  deletingMode: GroupRemovingStrategy;
}
