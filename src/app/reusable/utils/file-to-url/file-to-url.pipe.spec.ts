import { FileToUrlPipe } from './file-to-url.pipe';

describe('FileToUrlPipe', () => {
  let pipe: FileToUrlPipe;

  beforeEach(() => {
    pipe = new FileToUrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return a string', async () => {
    const result = pipe.transform(new File([], 'test.txt'));

    expect(typeof result).toBe('string');
  });
});
