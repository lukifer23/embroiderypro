import { ProcessingError } from '../types';

export class EdgeProcessor {
  static async detectEdges(imageData: ImageData, threshold: number): Promise<ImageData> {
    try {
      // Input validation
      if (!imageData?.data) {
        throw new ProcessingError('Invalid image data provided');
      }

      if (imageData.width < 3 || imageData.height < 3) {
        throw new ProcessingError('Image is too small for edge detection');
      }

      // Create output buffer
      const result = new ImageData(
        new Uint8ClampedArray(imageData.width * imageData.height * 4),
        imageData.width,
        imageData.height
      );

      // Convert to grayscale first
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
        grayscale.data[i + 3] = 255;
      }

      // Track edge pixels for validation
      let edgePixels = 0;
      const totalPixels = (imageData.width - 2) * (imageData.height - 2);

      // Apply Sobel operator
      for (let y = 1; y < imageData.height - 1; y++) {
        for (let x = 1; x < imageData.width - 1; x++) {
          const idx = (y * imageData.width + x) * 4;

          // Calculate Sobel gradients
          const gx = this.sobelX(grayscale, x, y);
          const gy = this.sobelY(grayscale, x, y);
          
          // Calculate magnitude
          const magnitude = Math.sqrt(gx * gx + gy * gy);
          
          // Apply threshold with hysteresis
          const isEdge = magnitude > threshold;
          const value = isEdge ? 255 : 0;
          
          if (isEdge) {
            edgePixels++;
          }

          result.data[idx] = value;
          result.data[idx + 1] = value;
          result.data[idx + 2] = value;
          result.data[idx + 3] = 255;
        }
      }

      // Validate edge detection results
      const edgePercentage = (edgePixels / totalPixels) * 100;

      if (edgePixels === 0) {
        throw new ProcessingError(
          'No edges detected. Try adjusting the threshold or using an image with more contrast.'
        );
      }

      if (edgePercentage > 50) {
        throw new ProcessingError(
          'Too many edges detected. Try increasing the threshold or using a cleaner image.'
        );
      }

      // Apply non-maximum suppression for cleaner edges
      const thinned = this.nonMaximumSuppression(result);

      // Validate final result
      let finalEdgeCount = 0;
      for (let i = 0; i < thinned.data.length; i += 4) {
        if (thinned.data[i] === 255) {
          finalEdgeCount++;
        }
      }

      if (finalEdgeCount < 100) {
        throw new ProcessingError(
          'Not enough significant edges found. Try adjusting the threshold or using an image with clearer shapes.'
        );
      }

      return thinned;

    } catch (error) {
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError(
        'Edge detection failed. Please try a different image or adjust the settings.',
        error as Error
      );
    }
  }

  private static sobelX(imageData: ImageData, x: number, y: number): number {
    const kernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    return this.applyKernel(imageData, x, y, kernel);
  }

  private static sobelY(imageData: ImageData, x: number, y: number): number {
    const kernel = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    return this.applyKernel(imageData, x, y, kernel);
  }

  private static applyKernel(
    imageData: ImageData,
    x: number,
    y: number,
    kernel: number[][]
  ): number {
    let sum = 0;
    
    for (let ky = -1; ky <= 1; ky++) {
      for (let kx = -1; kx <= 1; kx++) {
        const idx = ((y + ky) * imageData.width + (x + kx)) * 4;
        sum += imageData.data[idx] * kernel[ky + 1][kx + 1];
      }
    }
    
    return sum;
  }

  private static nonMaximumSuppression(imageData: ImageData): ImageData {
    const result = new ImageData(
      new Uint8ClampedArray(imageData.width * imageData.height * 4),
      imageData.width,
      imageData.height
    );

    for (let y = 1; y < imageData.height - 1; y++) {
      for (let x = 1; x < imageData.width - 1; x++) {
        const idx = (y * imageData.width + x) * 4;
        
        if (imageData.data[idx] === 0) continue;

        const neighbors = this.getNeighborValues(imageData, x, y);
        if (this.isLocalMaximum(imageData.data[idx], neighbors)) {
          result.data[idx] = 255;
          result.data[idx + 1] = 255;
          result.data[idx + 2] = 255;
          result.data[idx + 3] = 255;
        }
      }
    }

    return result;
  }

  private static getNeighborValues(imageData: ImageData, x: number, y: number): number[] {
    const neighbors = [];
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const idx = ((y + dy) * imageData.width + (x + dx)) * 4;
        neighbors.push(imageData.data[idx]);
      }
    }
    
    return neighbors;
  }

  private static isLocalMaximum(value: number, neighbors: number[]): boolean {
    return neighbors.every(n => value >= n);
  }
}