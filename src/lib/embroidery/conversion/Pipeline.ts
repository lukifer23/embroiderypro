import { ProcessingError, StitchPattern } from '../types';
import { BitmapProcessor } from '../processors/BitmapProcessor';
import { EdgeProcessor } from '../processors/EdgeProcessor';
import { ContourProcessor } from '../processors/ContourProcessor';
import { ColorProcessor } from '../color-processor';
import { StitchGenerator } from '../stitch-generator';
import { StitchOptimizer } from '../stitch-optimizer';

interface ConversionState {
  imageData: ImageData;
  processedImage?: {
    processedData: ImageData;
    colors: string[];
  };
  bitmap?: ImageData;
  edges?: ImageData;
  contours?: Array<{ x: number; y: number }[]>;
  pattern?: StitchPattern;
}

export class ConversionPipeline {
  private state: ConversionState;
  private settings: any;
  private onProgress: (stage: string, percent: number) => void;

  constructor(
    imageData: ImageData, 
    settings: any,
    onProgress?: (stage: string, percent: number) => void
  ) {
    this.validateInput(imageData, settings);
    this.state = { imageData };
    this.settings = settings;
    this.onProgress = onProgress || (() => {});
  }

  async execute(): Promise<StitchPattern> {
    try {
      // 1. Process colors
      this.onProgress('processing', 0);
      this.state.processedImage = ColorProcessor.processImage(
        this.state.imageData,
        this.settings.colorMode || 'grayscale'
      );
      this.onProgress('processing', 100);

      // 2. Convert to Bitmap
      this.onProgress('bitmap', 0);
      this.state.bitmap = await BitmapProcessor.createBitmap(
        this.state.processedImage.processedData
      );
      this.onProgress('bitmap', 100);

      // 3. Edge Detection
      this.onProgress('edges', 0);
      this.state.edges = await EdgeProcessor.detectEdges(
        this.state.bitmap,
        this.settings.edgeThreshold || 128
      );
      this.onProgress('edges', 100);

      // 4. Contour Detection
      this.onProgress('contours', 0);
      this.state.contours = await ContourProcessor.traceContours(this.state.edges);
      if (!this.state.contours?.length) {
        throw new ProcessingError('No contours found in image');
      }
      this.onProgress('contours', 100);

      // 5. Generate Stitches
      this.onProgress('generating', 0);
      const stitches = await StitchGenerator.generateStitches({
        contours: this.state.contours,
        settings: {
          width: this.settings.width,
          height: this.settings.height,
          density: this.settings.density,
          angle: this.settings.fillAngle,
          underlay: this.settings.useUnderlay,
          pullCompensation: this.settings.pullCompensation,
          colors: this.state.processedImage.colors
        }
      });

      if (!stitches?.length) {
        throw new ProcessingError('Failed to generate stitches');
      }
      this.onProgress('generating', 100);

      // 6. Create Pattern
      this.onProgress('optimizing', 0);
      const pattern: StitchPattern = {
        stitches,
        colors: this.state.processedImage.colors,
        dimensions: {
          width: this.settings.width,
          height: this.settings.height
        },
        metadata: {
          name: 'Converted Pattern',
          date: new Date().toISOString(),
          format: 'internal'
        }
      };

      // 7. Optimize Pattern
      const optimizedPattern = await this.optimizePattern(pattern);
      this.onProgress('optimizing', 100);

      return optimizedPattern;

    } catch (error) {
      console.error('Pipeline error:', error);
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError(
        'Conversion pipeline failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        error as Error
      );
    }
  }

  private validateInput(imageData: ImageData, settings: any) {
    if (!imageData?.data) {
      throw new ProcessingError('Invalid image data');
    }

    if (imageData.width === 0 || imageData.height === 0) {
      throw new ProcessingError('Invalid image dimensions');
    }

    if (!settings) {
      throw new ProcessingError('Settings are required');
    }

    const requiredSettings = ['width', 'height', 'density'];
    for (const setting of requiredSettings) {
      if (settings[setting] === undefined) {
        throw new ProcessingError(`Missing required setting: ${setting}`);
      }
    }

    if (settings.width <= 0 || settings.height <= 0) {
      throw new ProcessingError('Invalid dimensions in settings');
    }

    if (settings.density <= 0) {
      throw new ProcessingError('Invalid density in settings');
    }
  }

  private async optimizePattern(pattern: StitchPattern): Promise<StitchPattern> {
    try {
      // Basic validation
      if (!pattern?.stitches?.length) {
        throw new ProcessingError('Invalid pattern for optimization');
      }

      // Optimize stitches
      const optimized = StitchOptimizer.optimizeStitches(pattern.stitches);
      if (!optimized?.length) {
        throw new ProcessingError('Stitch optimization failed');
      }

      // Validate optimized pattern
      const minStitches = 10;
      if (optimized.length < minStitches) {
        throw new ProcessingError(
          `Pattern has too few stitches (${optimized.length}). Minimum required: ${minStitches}`
        );
      }

      // Check for invalid coordinates
      const hasInvalidCoords = optimized.some(
        stitch => isNaN(stitch.x) || isNaN(stitch.y)
      );
      if (hasInvalidCoords) {
        throw new ProcessingError('Pattern contains invalid coordinates');
      }

      return {
        ...pattern,
        stitches: optimized
      };
    } catch (error) {
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError('Pattern optimization failed', error as Error);
    }
  }
}