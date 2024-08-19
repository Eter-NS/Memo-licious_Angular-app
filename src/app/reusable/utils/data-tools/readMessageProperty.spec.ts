import { readMessageProperty } from './readMessageProperty';

describe(`readMessageProperty()`, () => {
  it(`should return null if no message is provided .`, () => {
    expect(readMessageProperty(null)).toBeNull();
    expect(readMessageProperty('2019')).toBeNull();
    expect(readMessageProperty({})).toBeNull();
    expect(readMessageProperty({ message: 1914 })).toBeNull();
  });

  it(`should return the message property.`, () => {
    const message = 'Hello World!';
    expect(readMessageProperty({ message })).toBe(message);
  });
});
