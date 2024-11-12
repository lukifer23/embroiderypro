import { ProcessingError } from '../types';

export class BitmapProcessor {
  static async createBitmap(imageData: ImageData): Promise<ImageData> {
    try {
      // Input validation
      if (!imageData?.data) {
        throw new ProcessingError('Invalid image data provided');
      }

      if (imageData.width < 3 || imageData.height < 3) {
        throw new ProcessingError('Image is too small for processing');
      }

      // Pre-process image to normalize brightness and contrast
      const normalized = this.normalizeImage(imageData);
      
      // Convert to grayscale using improved luminance weights
      const grayscale = new ImageData(
        new Uint8ClampedArray(imageData.width * imageData.height * 4),
        imageData.width,
        imageData.height
      );

      // Calculate image statistics for adaptive processing
      let sum = 0;
      let min = 255;
      let max = 0;

      for (let i = 0; i < normalized.data.length; i += 4) {
        // Use BT.709 luminance weights for better grayscale conversion
        const gray = Math.round(
          normalized.data[i] * 0.2126 +     // Red
          normalized.data[i + 1] * 0.7152 + // Green
          normalized.data[i + 2] * 0.0722   // Blue
        );

        grayscale.data[i] = gray;
        grayscale.data[i + 1] = gray;
        grayscale.data[i + 2] = gray;
        grayscale.data[i + 3] = normalized.data[i + 3];

        sum += gray;
        min = Math.min(min, gray);
        max = Math.max(max, gray);
      }

      // More tolerant contrast validation
      const contrast = max - min;
      const mean = sum / (imageData.width * imageData.height);

      if (contrast < 20) {
        // Auto-enhance contrast if too low
        return this.enhanceContrast(grayscale, min, max);
      }

      if (mean < 20 || mean > 235) {
        // Auto-adjust brightness if too dark or too bright
        return this.adjustBrightness(grayscale, mean);
      }

      // Apply noise reduction
      return this.reduceNoise(grayscale);

    } catch (error) {
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError('Failed to process image', error as Error);
    }
  }

  private static normalizeImage(imageData: ImageData): ImageData {
    const normalized = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    // Calculate histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.round(
        (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3
      );
      histogram[value]++;
    }

    // Calculate cumulative histogram
    const cdf = new Array(256).fill(0);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }

    // Normalize CDF
    const cdfMin = cdf.find(x => x > 0) || 0;
    const cdfMax = cdf[255];
    const range = cdfMax - cdfMin;

    // Apply histogram equalization
    for (let i = 0; i < normalized.data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        const value = normalized.data[i + j];
        normalized.data[i + j] = Math.round(
          ((cdf[value] - cdfMin) / range) * 255
        );
      }
    }

    return normalized;
  }

  private static enhanceContrast(
    imageData: ImageData,
    min: number,
    max: number
  ): ImageData {
    const result = new ImageData(
      new Uint8ClampedArray(imageData.width * imageData.height * 4),
      imageData.width,
      imageData.height
    );

    const range = max - min || 1;
    const gamma = 1.2;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const normalized = (imageData.data[i] - min) / range;
      const gamma_corrected = Math.pow(normalized, 1 / gamma);
      const value = Math.round(gamma_corrected * 255);

      result.data[i] = value;
      result.data[i + 1] = value;
      result.data[i + 2] = value;
      result.data[i + 3] = imageData.data[i + 3];
    }

    return result;
  }

  private static adjustBrightness(imageData: ImageData, mean: number): ImageData {
    const result = new ImageData(
      new Uint8ClampedArray(imageData.width * imageData.height * 4),
      imageData.width,
      imageData.height
    );

    // Calculate brightness adjustment factor
    const targetMean = 128;
    const adjustment = targetMean / (mean || 1);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.min(255, Math.round(imageData.data[i] * adjustment));
      result.data[i] = value;
      result.data[i + 1] = value;
      result.data[i + 2] = value;
      result.data[i + 3] = imageData.data[i + 3];
    }

    return result;
  }

  private static reduceNoise(imageData: ImageData): ImageData {
    const result = new ImageData(
      new Uint8ClampedArray(imageData.width * imageData.height * 4),
      imageData.width,
      imageData.height
    );

    const windowSize = 3;
    const halfWindow = Math.floor(windowSize / 2);

    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const values = [];

        // Gather values in window
        for (let wy = -halfWindow; wy <= halfWindow; wy++) {
          for (let wx = -halfWindow; wx <= halfWindow; wx++) {
            const py = Math.min(Math.max(y + wy, 0), imageData.height - 1);
            const px = Math.min(Math.max(x + wx, 0), imageData.width - 1);
            const idx = (py * imageData.width + px) * 4;
            values.push(imageData.data[idx]);
          }
        }

        // Sort values and take median
        values.sort((a, b) => a - b);
        const median = values[Math.floor(values.length / 2)];

        // Set result
        const idx = (y * imageData.width + x) * 4;
        result.data[idx] = median;
        result.data[idx + 1] = median;
        result.data[idx + 2] = median;
        result.data[idx + 3] = imageData.data[idx + 3];
      }
    }

    return result;
  }
}