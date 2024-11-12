import { StitchPattern, ProcessingError, StitchPoint } from '../types';
import { findContours, simplifyContour, smoothContour } from './algorithms/contour';
import { StitchGenerator } from '../stitch-generator';

export class PatternGenerator {
  static async generatePattern(params: {
    imageData: ImageData;
    settings: {
      width: number;
      height: number;
      density: number;
      angle: number;
      underlay: boolean;
      pullCompensation: number;
      color: string;
    };
  }): Promise<StitchPattern> {
    try {
      const { imageData, settings } = params;

      // Trace contours using our contour algorithms
      const rawContours = findContours(imageData);
      const contours = rawContours
        .map(contour => {
          const simplified = simplifyContour(contour, 1.0);
          return smoothContour(simplified, 0.5);
        })
        .filter(contour => contour.length >= 3);

      if (!contours.length) {
        throw new ProcessingError('No contours found in image');
      }

      // Generate stitches
      const stitches = await StitchGenerator.generateStitches({
        contours,
        settings
      });

      if (!stitches.length) {
        throw new ProcessingError('No stitches generated from pattern');
      }

      // Create pattern
      return {
        stitches,
        colors: [settings.color],
        dimensions: {
          width: settings.width,
          height: settings.height
        },
        metadata: {
          name: 'Converted Pattern',
          date: new Date().toISOString(),
          format: 'internal'
        }
      };
    } catch (error) {
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError('Failed to generate pattern', error as Error);
    }
  }

  static validatePattern(pattern: StitchPattern): void {
    if (!pattern.stitches.length) {
      throw new ProcessingError('Pattern has no stitches');
    }

    if (!pattern.colors.length) {
      throw new ProcessingError('Pattern has no colors');
    }

    if (pattern.dimensions.width <= 0 || pattern.dimensions.height <= 0) {
      throw new ProcessingError('Invalid pattern dimensions');
    }

    // Validate stitch coordinates
    pattern.stitches.forEach((stitch, index) => {
      if (isNaN(stitch.x) || isNaN(stitch.y)) {
        throw new ProcessingError(`Invalid stitch coordinates at index ${index}`);
      }
    });
  }
}