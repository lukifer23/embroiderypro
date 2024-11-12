import { ProcessingError } from '../../types';
import { ConversionStep, ConversionContext, StitchZone } from '../types';
import { generateFillStitches } from '../algorithms/fill';
import { generateSatinStitches } from '../algorithms/satin';
import { generateRunningStitches } from '../algorithms/running';
import { StitchPattern, StitchPoint } from '../../types';

export class StitchGenerationStep implements ConversionStep {
  async execute(context: ConversionContext): Promise<ConversionContext> {
    try {
      const { contours, settings } = context;
      if (!contours) {
        throw new ProcessingError('Contours are required');
      }

      // Analyze zones and determine stitch types
      const zones = this.analyzeStitchZones(contours);
      
      // Generate stitches for each zone
      const stitches: StitchPoint[] = [];
      let progress = 0;

      for (const zone of zones) {
        const zoneStitches = await this.generateZoneStitches(zone, settings);
        stitches.push(...zoneStitches);
        
        progress += (1 / zones.length) * 100;
        context.onProgress?.('stitches', Math.round(progress));
      }

      // Create pattern
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

      return {
        ...context,
        pattern
      };
    } catch (error) {
      throw new ProcessingError('Stitch generation failed', error as Error);
    }
  }

  private analyzeStitchZones(contours: Point[][]): StitchZone[] {
    return contours.map(contour => {
      const area = this.calculateArea(contour);
      const perimeter = this.calculatePerimeter(contour);
      const ratio = (4 * Math.PI * area) / (perimeter * perimeter);

      // Determine stitch type based on shape characteristics
      if (ratio > 0.8) {
        return { contour, type: 'fill' };
      } else if (ratio < 0.2) {
        return { contour, type: 'satin' };
      } else {
        return { contour, type: 'running' };
      }
    });
  }

  private async generateZoneStitches(
    zone: StitchZone,
    settings: ConversionSettings
  ): Promise<StitchPoint[]> {
    switch (zone.type) {
      case 'fill':
        return generateFillStitches(zone.contour, settings);
      case 'satin':
        return generateSatinStitches(zone.contour, settings);
      case 'running':
        return generateRunningStitches(zone.contour, settings);
      default:
        throw new ProcessingError(`Unknown stitch type: ${zone.type}`);
    }
  }

  private calculateArea(points: Point[]): number {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  }

  private calculatePerimeter(points: Point[]): number {
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  }
}