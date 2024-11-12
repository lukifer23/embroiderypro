import { StitchPattern, EmbroideryFormat, ProcessingError } from '../types';
import { DSTWriter } from '../formats/dst';
import { PESWriter } from '../formats/pes';
import { JEFWriter } from '../formats/jef';
import { EXPWriter } from '../formats/exp';
import { VP3Writer } from '../formats/vp3';
import { HUSWriter } from '../formats/hus';
import { PATWriter } from '../formats/pat';
import { QCCWriter } from '../formats/qcc';

export class FormatConverter {
  static convertToFormat(pattern: StitchPattern, format: EmbroideryFormat): ArrayBuffer {
    try {
      // Validate pattern
      this.validatePattern(pattern);

      // Convert coordinates to machine format (0.1mm units)
      const machinePattern = this.convertToMachineFormat(pattern);

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
      if (error instanceof ProcessingError) {
        throw error;
      }
      throw new ProcessingError('Failed to convert pattern format', error as Error);
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
  }

  private static convertToMachineFormat(pattern: StitchPattern): StitchPattern {
    const minX = Math.min(...pattern.stitches.map(s => s.x));
    const minY = Math.min(...pattern.stitches.map(s => s.y));

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
  }
}