import { ProcessingError } from '../../types';
import { ConversionStep, ConversionContext, Point } from '../types';
import { findContours } from '../algorithms/contour';
import { simplifyContour } from '../algorithms/contour';
import { smoothContour } from '../algorithms/contour';

export class ContourStep implements ConversionStep {
  async execute(context: ConversionContext): Promise<ConversionContext> {
    try {
      const { edges } = context;
      if (!edges) {
        throw new ProcessingError('Edge data is required');
      }

      // Find contours using Moore-Neighbor tracing
      const rawContours = findContours(edges);

      // Process each contour
      const contours = rawContours.map(contour => {
        // Simplify using Douglas-Peucker algorithm
        const simplified = simplifyContour(contour, 1.0);
        
        // Apply Gaussian smoothing
        return smoothContour(simplified, 0.5);
      }).filter(contour => contour.length >= 3);

      if (contours.length === 0) {
        throw new ProcessingError('No valid contours found');
      }

      context.onProgress?.('contours', 100);

      return {
        ...context,
        contours
      };
    } catch (error) {
      throw new ProcessingError('Contour detection failed', error as Error);
    }
  }
}