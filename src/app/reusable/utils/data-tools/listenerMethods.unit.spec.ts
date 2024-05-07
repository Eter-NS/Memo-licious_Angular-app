import throttle from './listenerMethods';

describe('listenerMethods', () => {
  describe('throttle()', () => {
    let func: jasmine.Spy;
    let throttledFunc: (...args: unknown[]) => void;

    beforeEach(() => {
      jasmine.clock().install();
      func = jasmine.createSpy('func');
      throttledFunc = throttle(func, 1000);
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should execute the function immediately when called for the first time', () => {
      throttledFunc();
      expect(func).toHaveBeenCalled();
    });

    it('should not execute the function while in throttle limit', () => {
      throttledFunc();
      func.calls.reset();

      throttledFunc();
      expect(func).not.toHaveBeenCalled();
    });

    it('should execute the function after the throttle limit', () => {
      throttledFunc();
      func.calls.reset();

      jasmine.clock().tick(1000);
      throttledFunc();
      expect(func).toHaveBeenCalled();
    });
  });
});
