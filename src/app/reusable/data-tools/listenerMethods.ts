// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFunction = (...args: any[]) => void;

export type DarkModeSubscription = {
  unsubscribe: () => void;
};

export function throttle<T extends GenericFunction>(
  func: T,
  limit: number = 1000
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function darkModeListener<T extends GenericFunction>(
  callback: T
): DarkModeSubscription {
  const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

  // First value just after subscribing
  callback(matchMedia.matches);

  // Further changes
  matchMedia.addEventListener('change', callback);

  const stopListening = () => {
    window.removeEventListener('change', callback);
  };

  return { unsubscribe: stopListening };
}
