import { FileToBase64Pipe } from './file-to-base64.pipe';

describe('FileToBase64Pipe', () => {
  let pipe: FileToBase64Pipe;

  beforeEach(() => {
    pipe = new FileToBase64Pipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return a string', async () => {
    const result = await pipe.transform(new File([], 'test.txt'));

    expect(typeof result).toBe('string');
  });
});
