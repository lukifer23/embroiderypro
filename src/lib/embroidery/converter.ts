import { BitmapProcessor } from './processors/BitmapProcessor';
import { EdgeProcessor } from './processors/EdgeProcessor';
import { ContourProcessor } from './processors/ContourProcessor';
import { ColorProcessor } from './color-processor';
import { StitchGenerator } from './stitch-generator';
import { StitchOptimizer } from './optimizer';
import { ProcessingError, StitchPattern, ProcessingSettings } from './types';

export class EmbroideryConverter {
  static async convertImageToStitches(
    imageData: ImageData,
    settings: ProcessingSettings
  ): Promise<StitchPattern> {
    try {
      // 1. Process colors and create bitmap
      const bitmap = await BitmapProcessor.createBitmap(imageData);
      if (!bitmap) {
        throw new ProcessingError('Failed to process image bitmap');
      }

      // 2. Detect edges using user's threshold
      const edges = await EdgeProcessor.detectEdges(bitmap, settings.edgeThreshold);
      if (!edges) {
        throw new ProcessingError('Failed to detect edges in image');
      }

      // 3. Trace contours
      const contours = await ContourProcessor.traceContours(edges);
      if (!contours || contours.length === 0) {
        throw new ProcessingError('No contours found in image. Try adjusting the edge threshold.');
      }

      // 4. Generate stitches
      const stitches = await StitchGenerator.generateStitches({
        contours,
        settings: {
          width: settings.width,
          height: settings.height,
          density: settings.density,
          angle: settings.fillAngle,
          underlay: settings.useUnderlay,
          pullCompensation: settings.pullCompensation,
          color: settings.color
        }
      });

      if (!stitches || stitches.length === 0) {
        throw new ProcessingError('Failed to generate stitches from contours');
      }

      // 5. Create pattern
      const pattern: StitchPattern = {
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

      // 6. Optimize pattern
      return StitchOptimizer.optimizePattern(pattern);

    } catch (error) {
      console.error('Conversion error:', error);
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError('Failed to convert image', error as Error);
    }
  }
}