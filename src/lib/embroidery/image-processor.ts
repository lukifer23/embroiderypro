import { ProcessedImage } from './types';

export class ImageProcessor {
  static async processImage(
    imageData: ImageData,
    options: {
      threshold: number;
      targetWidth: number;
      targetHeight: number;
    }
  ): Promise<ProcessedImage> {
    const { width, height, data } = imageData;
    const grayscale = new Uint8ClampedArray(width * height);
    const edges = new Uint8ClampedArray(width * height);

    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      grayscale[i / 4] = Math.round(
        0.299 * data[i] +     // Red
        0.587 * data[i + 1] + // Green
        0.114 * data[i + 2]   // Blue
      );
    }

    // Apply Gaussian blur for noise reduction
    const blurred = this.gaussianBlur(grayscale, width, height);

    // Detect edges using Sobel operator
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Sobel kernels
        const gx = (
          -1 * blurred[idx - width - 1] +
          -2 * blurred[idx - 1] +
          -1 * blurred[idx + width - 1] +
           1 * blurred[idx - width + 1] +
           2 * blurred[idx + 1] +
           1 * blurred[idx + width + 1]
        );

        const gy = (
          -1 * blurred[idx - width - 1] +
          -2 * blurred[idx - width] +
          -1 * blurred[idx - width + 1] +
           1 * blurred[idx + width - 1] +
           2 * blurred[idx + width] +
           1 * blurred[idx + width + 1]
        );

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[idx] = magnitude > options.threshold ? 255 : 0;
      }
    }

    // Apply non-maximum suppression
    const finalEdges = this.nonMaxSuppression(edges, width, height);

    return {
      width,
      height,
      grayscale,
      edges: finalEdges,
      threshold: options.threshold
    };
  }

  private static gaussianBlur(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): Uint8ClampedArray {
    const kernel = [
      [1, 4, 6, 4, 1],
      [4, 16, 24, 16, 4],
      [6, 24, 36, 24, 6],
      [4, 16, 24, 16, 4],
      [1, 4, 6, 4, 1]
    ];
    const kernelSize = 5;
    const kernelSum = 256;
    const result = new Uint8ClampedArray(data.length);
    const halfSize = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;

        for (let ky = -halfSize; ky <= halfSize; ky++) {
          for (let kx = -halfSize; kx <= halfSize; kx++) {
            const px = Math.min(Math.max(x + kx, 0), width - 1);
            const py = Math.min(Math.max(y + ky, 0), height - 1);
            const kidx = (ky + halfSize) * kernelSize + (kx + halfSize);
            const idx = py * width + px;
            
            sum += data[idx] * kernel[ky + halfSize][kx + halfSize];
          }
        }

        result[y * width + x] = Math.round(sum / kernelSum);
      }
    }

    return result;
  }

  private static nonMaxSuppression(
    edges: Uint8ClampedArray,
    width: number,
    height: number
  ): Uint8ClampedArray {
    const result = new Uint8ClampedArray(edges.length);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        if (edges[idx] === 0) continue;

        const n1 = edges[idx - width - 1];
        const n2 = edges[idx - width];
        const n3 = edges[idx - width + 1];
        const n4 = edges[idx - 1];
        const n5 = edges[idx + 1];
        const n6 = edges[idx + width - 1];
        const n7 = edges[idx + width];
        const n8 = edges[idx + width + 1];

        const isMax = edges[idx] >= Math.max(n1, n2, n3, n4, n5, n6, n7, n8);
        result[idx] = isMax ? edges[idx] : 0;
      }
    }

    return result;
  }
}