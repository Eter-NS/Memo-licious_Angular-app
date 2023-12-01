export default function throttle<
  T extends (...args: Parameters<T>) => ReturnType<T>
>(cb: T, delay = 1000) {
  let shouldWait = false;
  let waitingArgs: Parameters<T> | null;

  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false;
    } else {
      cb(...(waitingArgs as Parameters<T>));
      waitingArgs = null;
      setTimeout(timeoutFunc, delay);
    }
  };

  return (...args: unknown[]) => {
    if (shouldWait) {
      waitingArgs = args as Parameters<T>;
      return;
    }

    cb(...(args as Parameters<T>));
    shouldWait = true;

    setTimeout(timeoutFunc, delay);
  };
}
