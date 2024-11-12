import { Point, StitchPoint } from './types';

export class StitchGenerator {
  // Maximum recommended stitches for most formats
  private static readonly MAX_RECOMMENDED_STITCHES = 15000;

  static async generateStitches(params: {
    contours: Point[][];
    settings: {
      width: number;
      height: number;
      density: number;
      angle: number;
      underlay: boolean;
      pullCompensation: number;
      color: string;
    };
  }): Promise<StitchPoint[]> {
    const { contours, settings } = params;
    const stitches: StitchPoint[] = [];

    // Calculate optimal spacing based on size and density
    const area = settings.width * settings.height;
    const targetStitchCount = Math.min(
      this.MAX_RECOMMENDED_STITCHES,
      Math.ceil(area * settings.density)
    );
    
    // Adjust spacing to meet target stitch count
    const baseSpacing = Math.sqrt(area / targetStitchCount);
    const spacing = Math.max(0.3, baseSpacing / settings.density);

    // Add initial jump stitch
    if (contours[0]?.length > 0) {
      stitches.push({
        x: contours[0][0].x,
        y: contours[0][0].y,
        type: 'jump',
        color: settings.color
      });
    }

    // Generate underlay if enabled
    if (settings.underlay) {
      const underlayAngle = (settings.angle + 90) % 360;
      const underlayStitches = this.generateFillStitches(
        contours,
        {
          ...settings,
          angle: underlayAngle,
          spacing: spacing * 2 // Sparser spacing for underlay
        }
      );
      stitches.push(...underlayStitches);
    }

    // Generate main fill stitches
    const fillStitches = this.generateFillStitches(contours, {
      ...settings,
      spacing
    });
    stitches.push(...fillStitches);

    // Apply pull compensation
    if (settings.pullCompensation > 0) {
      this.applyPullCompensation(stitches, settings.pullCompensation);
    }

    return stitches;
  }

  private static generateFillStitches(
    contours: Point[][],
    settings: {
      width: number;
      height: number;
      density: number;
      angle: number;
      spacing: number;
      color: string;
    }
  ): StitchPoint[] {
    const stitches: StitchPoint[] = [];
    const angleRad = (settings.angle * Math.PI) / 180;
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);

    for (const contour of contours) {
      for (let i = 0; i < contour.length - 1; i++) {
        const p1 = contour[i];
        const p2 = contour[i + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.ceil(distance / settings.spacing);

        for (let j = 0; j <= steps; j++) {
          const t = j / steps;
          const x = p1.x + t * dx;
          const y = p1.y + t * dy;
          const rotatedX = x * cosAngle - y * sinAngle;
          const rotatedY = x * sinAngle + y * cosAngle;

          stitches.push({
            x: rotatedX,
            y: rotatedY,
            type: 'normal',
            color: settings.color
          });
        }
      }
    }

    return stitches;
  }

  private static applyPullCompensation(
    stitches: StitchPoint[],
    compensation: number
  ) {
    for (const stitch of stitches) {
      stitch.x += compensation;
      stitch.y += compensation;
    }
  }
}