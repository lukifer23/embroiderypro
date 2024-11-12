import { ProcessingError } from '../types';

export class ImageProcessor {
  static async processImage(imageData: ImageData): Promise<{
    width: number;
    height: number;
    processedData: ImageData;
  }> {
    try {
      // Convert to grayscale
      const grayscale = new ImageData(
        new Uint8ClampedArray(imageData.width * imageData.height * 4),
        imageData.width,
        imageData.height
      );

      for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = Math.round(
          imageData.data[i] * 0.299 +
          imageData.data[i + 1] * 0.587 +
          imageData.data[i + 2] * 0.114
        );
        grayscale.data[i] = gray;
        grayscale.data[i + 1] = gray;
        grayscale.data[i + 2] = gray;
        grayscale.data[i + 3] = imageData.data[i + 3];
      }

      return {
        width: imageData.width,
        height: imageData.height,
        processedData: grayscale
      };
    } catch (error) {
      throw new ProcessingError('Failed to process image', error as Error);
    }
  }
}