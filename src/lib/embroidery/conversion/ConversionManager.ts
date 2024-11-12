import { ProcessingError, StitchPattern } from '../types';
import { ConversionPipeline } from './Pipeline';

export class ConversionManager {
  private progress: number = 0;
  private stage: string = '';
  private error: Error | null = null;

  async convertImage(params: {
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
      // Input validation
      if (!params.imageData?.data) {
        throw new ProcessingError('No image data provided');
      }

      if (params.imageData.width === 0 || params.imageData.height === 0) {
        throw new ProcessingError('Invalid image dimensions');
      }

      // Log initial parameters
      console.log('Starting conversion with settings:', {
        width: params.imageData.width,
        height: params.imageData.height,
        ...params.settings
      });

      // Sanitize settings before proceeding
      const sanitizedSettings = this.sanitizeSettings(params.settings);
      console.log('Sanitized settings:', sanitizedSettings);

      // Create and execute conversion pipeline
      const pipeline = new ConversionPipeline(
        params.imageData,
        sanitizedSettings,
        (stage: string, progress: number) => {
          this.updateProgress(stage, progress);
          console.log(`Pipeline progress: ${stage} at ${progress}%`);
        }
      );

      const result = await pipeline.execute();

      // Validate result
      if (!result?.stitches?.length) {
        throw new ProcessingError('No stitches generated during conversion');
      }

      console.log('Conversion completed successfully:', {
        stitchCount: result.stitches.length,
        colors: result.colors,
        dimensions: result.dimensions
      });

      return result;

    } catch (error) {
      // Enhanced error logging
      console.error('Conversion failed:', {
        stage: this.stage,
        progress: this.progress,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: error instanceof ProcessingError ? error.cause : undefined
        } : error,
        imageInfo: {
          width: params.imageData?.width,
          height: params.imageData?.height,
          hasData: Boolean(params.imageData?.data)
        }
      });

      if (error instanceof ProcessingError) {
        throw error;
      }
      
      throw new ProcessingError(
        'Failed to convert image. Please try again with different settings or a different image.',
        error as Error
      );
    }
  }

  private sanitizeSettings(settings: any) {
    const sanitized = {
      width: Math.max(10, Math.min(1000, settings.width)),
      height: Math.max(10, Math.min(1000, settings.height)),
      density: Math.max(1, Math.min(5, settings.density)),
      angle: ((settings.angle % 360) + 360) % 360,
      underlay: Boolean(settings.underlay),
      pullCompensation: Math.max(0, Math.min(100, settings.pullCompensation)),
      color: settings.color?.match(/^#[0-9A-Fa-f]{6}$/) ? settings.color : '#000000',
      edgeThreshold: Math.max(64, Math.min(192, settings.edgeThreshold || 128))
    };

    // Log any values that were adjusted
    Object.entries(sanitized).forEach(([key, value]) => {
      if (value !== settings[key]) {
        console.log(`Adjusted ${key} from ${settings[key]} to ${value}`);
      }
    });

    return sanitized;
  }

  getProgress(): { progress: number; stage: string; error: Error | null } {
    return {
      progress: this.progress,
      stage: this.stage,
      error: this.error
    };
  }

  private updateProgress(stage: string, progress: number) {
    this.stage = stage;
    this.progress = progress;
    this.error = null;
    console.log(`Conversion progress: ${stage} - ${progress}%`);
  }
}