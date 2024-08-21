import { fromEvent, startWith } from 'rxjs';

export function darkModeListener() {
  const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

  return fromEvent<MediaQueryList>(matchMedia, 'change').pipe(
    startWith(matchMedia)
  );
}
