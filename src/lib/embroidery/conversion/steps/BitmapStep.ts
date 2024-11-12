import { ProcessingError } from '../../types';
import { ConversionStep, ConversionContext } from '../types';
import { adaptiveThreshold } from '../algorithms/threshold';

export class BitmapStep implements ConversionStep {
  async execute(context: ConversionContext): Promise<ConversionContext> {
    try {
      const { imageData } = context;

      // Convert to grayscale using luminance weights
      const grayscale = new ImageData(
        new Uint8ClampedArray(imageData.width * imageData.height * 4),
        imageData.width,
        imageData.height
      );

      for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = Math.round(
          imageData.data[i] * 0.299 +     // Red
          imageData.data[i + 1] * 0.587 + // Green
          imageData.data[i + 2] * 0.114   // Blue
        );
        grayscale.data[i] = gray;
        grayscale.data[i + 1] = gray;
        grayscale.data[i + 2] = gray;
        grayscale.data[i + 3] = imageData.data[i + 3];
      }

      // Apply adaptive thresholding
      const bitmap = adaptiveThreshold(grayscale, {
        windowSize: 11,
        C: 2
      });

      context.onProgress?.('bitmap', 100);

      return {
        ...context,
        bitmap
      };
    } catch (error) {
      throw new ProcessingError('Failed to process bitmap', error as Error);
    }
  }
}