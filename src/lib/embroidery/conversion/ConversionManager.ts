import { ConversionPipeline } from './ConversionPipeline';
import { ProcessingError } from './errors';
import { StitchPattern, ProcessingSettings } from './types';

export class ConversionManager {
  private stage: string = '';
  private progress: number = 0;

  async convert(params: {
    imageData: ImageData;
    settings: ProcessingSettings;
  }): Promise<StitchPattern> {
    try {
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
      } else {
        throw new ProcessingError('An unexpected error occurred during conversion', error);
      }
    }
  }

  private sanitizeSettings(settings: ProcessingSettings): ProcessingSettings {
    return {
      ...settings,
      width: Math.max(10, Math.min(1000, settings.width)),
      height: Math.max(10, Math.min(1000, settings.height)),
      density: Math.max(1, Math.min(5, settings.density)),
      fillAngle: ((settings.fillAngle % 360) + 360) % 360,
      useUnderlay: Boolean(settings.useUnderlay),
      pullCompensation: Math.max(0, Math.min(100, settings.pullCompensation)),
      color: settings.color?.match(/^#[0-9A-Fa-f]{6}$/) ? settings.color : '#000000',
      edgeThreshold: Math.max(64, Math.min(192, settings.edgeThreshold || 128))
    };
  }

  private updateProgress(stage: string, progress: number) {
    this.stage = stage;
    this.progress = progress;
    console.log(`Conversion progress: ${stage} - ${progress}%`);
  }
}