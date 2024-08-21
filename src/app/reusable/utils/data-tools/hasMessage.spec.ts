import { hasMessage } from './hasMessage';

describe(`hasMessage()`, () => {
  it(`should return false if the argument doesn't contain message property of type string`, () => {
    expect(hasMessage(123)).toBeFalsy();
    expect(hasMessage(null)).toBeFalsy();
    expect(hasMessage({})).toBeFalsy();
    expect(hasMessage([])).toBeFalsy();
  });

  it(`should return true if the argument contains message property of type string`, () => {
    expect(hasMessage({ message: 'Hello world' })).toBeTruthy();
  });
});
