import { isMobileDevice } from './isMobileDevice';

describe('isTheDeviceMobile()', () => {
  const defaultWindow = window;

  it(`should true if device width is less than 768px.`, () => {
    // Arrange
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
    } as MediaQueryList);

    // Act
    const result = isMobileDevice();

    // Assert
    expect(result).toBeTrue();
  });

  it('should return true if the device is mobile (maxTouchPoints)', () => {
    // Arrange
    spyOnProperty(navigator, 'userAgent', 'get').and.returnValue('Android');
    spyOnProperty(navigator, 'maxTouchPoints', 'get').and.returnValue(2);
    const window = { ...defaultWindow, ontouchstart: () => {} };
    window;

    // Act
    const result = isMobileDevice();

    // Assert
    expect(result).toBeTrue();
  });

  it('should return false if the device is not mobile', () => {
    // Arrange
    spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
    } as MediaQueryList);

    // Act
    const result = isMobileDevice();

    // Assert
    expect(result).toBeFalse();
  });
});
