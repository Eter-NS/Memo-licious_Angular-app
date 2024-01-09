// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number = 1000
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
