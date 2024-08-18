export function createJpegImage(): Promise<File> {
  return new Promise((resolve, reject) => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    // Get the 2D drawing context
    const ctx = canvas.getContext('2d')!;

    // Draw a rectangle (for simplicity, you can draw anything else)
    ctx.fillStyle = 'rgb(255, 0, 0)'; // Red color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert canvas to JPEG data URL
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject('Failed to convert canvas to blob');
          return;
        }

        // Create a File object from the blob
        const file = new File([blob], 'example.jpg', { type: 'image/jpeg' });

        resolve(file);
      },
      'image/jpeg',
      1
    );
  });
}
