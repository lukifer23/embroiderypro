import { ProcessingError } from '../../types';
import { ConversionStep, ConversionContext } from '../types';
import { sobelEdgeDetection } from '../algorithms/edge';
import { nonMaximumSuppression } from '../algorithms/edge';
import { hysteresis } from '../algorithms/edge';

export class EdgeDetectionStep implements ConversionStep {
  async execute(context: ConversionContext): Promise<ConversionContext> {
    try {
      const { bitmap } = context;
      if (!bitmap) {
        throw new ProcessingError('Bitmap data is required');
      }

      // Apply Sobel edge detection
      const { magnitude, direction } = sobelEdgeDetection(bitmap);

      // Apply non-maximum suppression
      const thinEdges = nonMaximumSuppression(magnitude, direction);

      // Apply double threshold and hysteresis
      const edges = hysteresis(thinEdges, {
        lowThreshold: 0.1,
        highThreshold: 0.3
      });

      context.onProgress?.('edges', 100);

      return {
        ...context,
        edges
      };
    } catch (error) {
      throw new ProcessingError('Edge detection failed', error as Error);
    }
  }
}