import { Observable } from 'rxjs';
import { darkModeListener } from './listenerMethods';
import { fakeAsync, tick } from '@angular/core/testing';

describe('listenerMethods', () => {
  describe(`darkModeListener()`, () => {
    it(`should return an observable`, () => {
      // Arrange

      // Act
      const result = darkModeListener();

      // Assert
      expect(result).toBeInstanceOf(Observable);
    });

    it(`should emit a value at the subscription.`, fakeAsync(() => {
      // Arrange
      let result: MediaQueryList | undefined;

      // Act
      const subscription = darkModeListener().subscribe((value) => {
        result = value;
      });

      tick();
      subscription.unsubscribe();

      // Assert
      expect(result).toBeInstanceOf(MediaQueryList);
    }));
  });
});
