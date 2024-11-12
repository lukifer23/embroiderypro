import type { StitchPattern, EmbroideryFormat } from '../types';
import { ProcessingError } from '../types';
import { ColorProcessor } from '../color-processor';
import { DSTWriter } from './dst';
import { PESWriter } from './pes';
import { JEFWriter } from './jef';
import { EXPWriter } from './exp';
import { VP3Writer } from './vp3';
import { HUSWriter } from './hus';
import { PATWriter } from './pat';
import { QCCWriter } from './qcc';

interface FormatValidation {
  maxStitches: number;
  maxColors: number;
  maxDimension: number;
}

const FORMAT_LIMITS: Record<EmbroideryFormat, FormatValidation> = {
  dst: { maxStitches: 999999, maxColors: 1, maxDimension: 400 },
  pes: { maxStitches: 100000, maxColors: 99, maxDimension: 260 },
  jef: { maxStitches: 65535, maxColors: 99, maxDimension: 260 },
  exp: { maxStitches: 999999, maxColors: 1, maxDimension: 400 },
  vp3: { maxStitches: 100000, maxColors: 99, maxDimension: 260 },
  hus: { maxStitches: 100000, maxColors: 99, maxDimension: 260 },
  pat: { maxStitches: 999999, maxColors: 1, maxDimension: 400 },
  qcc: { maxStitches: 999999, maxColors: 1, maxDimension: 400 }
};

export class FormatConverter {
  static convertToFormat(pattern: StitchPattern, format: EmbroideryFormat): ArrayBuffer {
    try {
      // Validate pattern
      this.validatePattern(pattern);

      // Convert colors to thread colors
      const validatedColors = pattern.colors.map(color => 
        ColorProcessor.validateThreadColor(color)
      );

      // Create pattern with validated colors
      const validatedPattern = {
        ...pattern,
        colors: validatedColors,
        stitches: pattern.stitches.map(stitch => ({
          ...stitch,
          color: ColorProcessor.validateThreadColor(stitch.color)
        }))
      };

      // Validate format limits
      this.validateFormatLimits(validatedPattern, format);

      // Convert to machine format
      const machinePattern = this.convertToMachineFormat(validatedPattern);

      // Convert to requested format
      switch (format) {
        case 'dst':
          return DSTWriter.write(machinePattern);
        case 'pes':
          return PESWriter.write(machinePattern);
        case 'jef':
          return JEFWriter.write(machinePattern);
        case 'exp':
          return EXPWriter.write(machinePattern);
        case 'vp3':
          return VP3Writer.write(machinePattern);
        case 'hus':
          return HUSWriter.write(machinePattern);
        case 'pat':
          return PATWriter.write(machinePattern);
        case 'qcc':
          return QCCWriter.write(machinePattern);
        default:
          throw new ProcessingError(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Format conversion error:', error);
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError(
        `Failed to convert pattern to ${format.toUpperCase()} format`,
        error as Error
      );
    }
  }

  private static validatePattern(pattern: StitchPattern): void {
    if (!pattern) {
      throw new ProcessingError('Pattern is required');
    }

    if (!Array.isArray(pattern.stitches) || pattern.stitches.length === 0) {
      throw new ProcessingError('Pattern must contain stitches');
    }

    if (!pattern.dimensions?.width || !pattern.dimensions?.height) {
      throw new ProcessingError('Pattern must have valid dimensions');
    }

    if (!Array.isArray(pattern.colors) || pattern.colors.length === 0) {
      throw new ProcessingError('Pattern must have at least one color');
    }

    // Validate stitch coordinates
    pattern.stitches.forEach((stitch, index) => {
      if (isNaN(stitch.x) || isNaN(stitch.y)) {
        throw new ProcessingError(`Invalid coordinates in stitch at index ${index}`);
      }
    });
  }

  private static validateFormatLimits(pattern: StitchPattern, format: EmbroideryFormat): void {
    const limits = FORMAT_LIMITS[format];

    if (pattern.stitches.length > limits.maxStitches) {
      throw new ProcessingError(
        `Pattern has too many stitches for ${format.toUpperCase()} format. ` +
        `Maximum allowed: ${limits.maxStitches}`
      );
    }

    if (pattern.colors.length > limits.maxColors) {
      throw new ProcessingError(
        `Pattern has too many colors for ${format.toUpperCase()} format. ` +
        `Maximum allowed: ${limits.maxColors}`
      );
    }

    const maxDim = Math.max(pattern.dimensions.width, pattern.dimensions.height);
    if (maxDim > limits.maxDimension) {
      throw new ProcessingError(
        `Pattern dimensions exceed maximum allowed for ${format.toUpperCase()} format. ` +
        `Maximum allowed: ${limits.maxDimension}mm`
      );
    }
  }

  private static convertToMachineFormat(pattern: StitchPattern): StitchPattern {
    try {
      // Find minimum coordinates to ensure all values are positive
      const minX = Math.min(...pattern.stitches.map(s => s.x));
      const minY = Math.min(...pattern.stitches.map(s => s.y));

      // Convert to machine coordinates (0.1mm units)
      return {
        ...pattern,
        stitches: pattern.stitches.map(stitch => ({
          ...stitch,
          x: Math.round((stitch.x - minX) * 10),
          y: Math.round((stitch.y - minY) * 10)
        })),
        dimensions: {
          width: Math.round(pattern.dimensions.width * 10),
          height: Math.round(pattern.dimensions.height * 10)
        }
      };
    } catch (error) {
      throw new ProcessingError('Failed to convert pattern to machine format', error as Error);
    }
  }
}