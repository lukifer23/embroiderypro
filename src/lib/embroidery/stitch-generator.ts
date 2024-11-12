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

    // Generate fill stitches
    const fillStitches = this.generateFillStitches(contours, { ...settings, spacing });
    stitches.push(...fillStitches);

    // Generate outline stitches with adjusted spacing
    for (const contour of contours) {
      const outlineStitches = this.generateOutlineStitches(
        contour,
        spacing,
        settings.color
      );
      stitches.push(...outlineStitches);
    }

    // Add final jump stitch
    if (stitches.length > 0) {
      const lastStitch = stitches[stitches.length - 1];
      stitches.push({
        ...lastStitch,
        type: 'jump'
      });
    }

    return stitches;
  }

  private static generateOutlineStitches(
    points: Point[],
    spacing: number,
    color: string
  ): StitchPoint[] {
    const stitches: StitchPoint[] = [];
    
    // Add jump to start
    if (points.length > 0) {
      stitches.push({
        x: points[0].x,
        y: points[0].y,
        type: 'jump',
        color
      });
    }

    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1];
      const end = points[i];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < spacing) continue;

      const steps = Math.ceil(distance / spacing);
      
      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        stitches.push({
          x: start.x + dx * t,
          y: start.y + dy * t,
          type: 'normal',
          color
        });
      }
    }

    return stitches;
  }

  private static generateFillStitches(
    contours: Point[][],
    settings: any
  ): StitchPoint[] {
    const fillStitches: StitchPoint[] = [];
    const angleRad = (settings.angle * Math.PI) / 180;

    // Calculate fill direction vectors
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);

    // Generate fill lines perpendicular to direction
    const bounds = this.calculateBounds(contours);
    const diagonal = Math.sqrt(
      Math.pow(bounds.maxX - bounds.minX, 2) + 
      Math.pow(bounds.maxY - bounds.minY, 2)
    );
    
    const numLines = Math.ceil(diagonal / settings.spacing);
    const center = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2
    };

    let isReversed = false; // For alternating direction

    for (let i = -numLines; i <= numLines; i++) {
      const offset = i * settings.spacing;
      const lineStart = {
        x: center.x - dirY * offset - dirX * diagonal,
        y: center.y + dirX * offset - dirY * diagonal
      };
      const lineEnd = {
        x: center.x - dirY * offset + dirX * diagonal,
        y: center.y + dirX * offset + dirY * diagonal
      };

      const intersections = this.findIntersections(lineStart, lineEnd, contours);
      if (intersections.length < 2) continue;

      // Sort intersections along fill line
      intersections.sort((a, b) => {
        const da = (a.x - lineStart.x) * dirX + (a.y - lineStart.y) * dirY;
        const db = (b.x - lineStart.x) * dirX + (b.y - lineStart.y) * dirY;
        return isReversed ? db - da : da - db;
      });

      // Generate stitches between intersection pairs
      for (let j = 0; j < intersections.length - 1; j += 2) {
        const start = intersections[j];
        const end = intersections[j + 1];
        const distance = Math.hypot(end.x - start.x, end.y - start.y);
        const steps = Math.max(1, Math.ceil(distance / settings.spacing));

        fillStitches.push({
          x: start.x,
          y: start.y,
          type: 'jump',
          color: settings.color
        });

        for (let step = 1; step <= steps; step++) {
          const t = step / steps;
          fillStitches.push({
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t,
            type: 'normal',
            color: settings.color
          });
        }
      }

      isReversed = !isReversed; // Alternate direction for next line
    }

    return fillStitches;
  }

  private static calculateBounds(contours: Point[][]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const contour of contours) {
      for (const point of contour) {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      }
    }

    return { minX, maxX, minY, maxY };
  }

  private static findIntersections(
    lineStart: Point,
    lineEnd: Point,
    contours: Point[][]
  ): Point[] {
    const intersections: Point[] = [];

    for (const contour of contours) {
      for (let i = 0; i < contour.length - 1; i++) {
        const intersection = this.lineIntersection(
          lineStart,
          lineEnd,
          contour[i],
          contour[i + 1]
        );
        if (intersection) {
          intersections.push(intersection);
        }
      }
    }

    return intersections;
  }

  private static lineIntersection(
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point
  ): Point | null {
    const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (Math.abs(denominator) < 1e-10) return null;

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return {
        x: p1.x + ua * (p2.x - p1.x),
        y: p1.y + ua * (p2.y - p1.y)
      };
    }

    return null;
  }
}