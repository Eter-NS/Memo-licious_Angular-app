/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileToBase64Pipe } from './file-to-base64.pipe';

describe('FileToBase64Pipe', () => {
  let pipe: FileToBase64Pipe;

  beforeEach(() => {
    pipe = new FileToBase64Pipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return a Base64 string.', async () => {
    const result = await pipe.transform(new File([], 'test.txt'));

    expect(typeof result).toBe('string');
  });

  it('should throw an error during invalid transformation.', async () => {
    // Arrange
    spyOn(console, 'error').and.stub();

    window.FileReader = class mockedFileReader extends FileReader {
      override readAsDataURL(value: File | Blob) {
        value;
        this.onerror?.({
          target: {
            error: {
              message: 'example error from onerror',
            },
          },
        } as ProgressEvent<FileReader>);
      }
    };

    // Act
    const result = await pipe.transform({} as File);

    // Assert
    expect(result).toEqual(null);
  });
});
