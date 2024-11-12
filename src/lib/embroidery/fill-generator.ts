import { StitchPoint, StitchSettings } from './types';

export class FillGenerator {
  static generateFill(
    points: { x: number; y: number }[],
    color: string,
    settings: Partial<StitchSettings> = {}
  ): StitchPoint[] {
    if (!points.length) return [];

    const stitches: StitchPoint[] = [];
    const spacing = settings.spacing || 0.4;
    const angle = (settings.angle || 0) * (Math.PI / 180);
    
    // Calculate bounding box
    const bounds = this.calculateBounds(points);
    
    // Generate fill lines
    const lines = this.generateFillLines(bounds, angle, spacing);
    
    // Generate stitches along each line
    lines.forEach(line => {
      const intersections = this.findIntersections(line, points);
      if (intersections.length >= 2) {
        // Sort intersections by Y coordinate
        intersections.sort((a, b) => a.y - b.y);
        
        // Create stitches between intersection pairs
        for (let i = 0; i < intersections.length - 1; i += 2) {
          stitches.push(
            {
              x: intersections[i].x,
              y: intersections[i].y,
              type: 'normal',
              color
            },
            {
              x: intersections[i + 1].x,
              y: intersections[i + 1].y,
              type: 'normal',
              color
            }
          );
        }
      }
    });

    return stitches;
  }

  private static calculateBounds(points: { x: number; y: number }[]) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  }

  private static generateFillLines(
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
    angle: number,
    spacing: number
  ): Array<[{ x: number; y: number }, { x: number; y: number }]> {
    const lines: Array<[{ x: number; y: number }, { x: number; y: number }]> = [];
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotatedWidth = Math.abs(width * cos) + Math.abs(height * sin);
    
    const numLines = Math.ceil(rotatedWidth / spacing);
    const diagonal = Math.sqrt(width * width + height * height);
    
    for (let i = -numLines; i <= numLines; i++) {
      const x = bounds.minX + width / 2 + i * spacing * cos;
      const y = bounds.minY + height / 2 + i * spacing * sin;
      
      lines.push([
        {
          x: x - diagonal * sin,
          y: y + diagonal * cos
        },
        {
          x: x + diagonal * sin,
          y: y - diagonal * cos
        }
      ]);
    }
    
    return lines;
  }

  private static findIntersections(
    line: [{ x: number; y: number }, { x: number; y: number }],
    points: { x: number; y: number }[]
  ): { x: number; y: number }[] {
    const intersections: { x: number; y: number }[] = [];
    
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const intersection = this.lineIntersection(
        line[0], line[1],
        points[i], points[j]
      );
      if (intersection) {
        intersections.push(intersection);
      }
    }
    
    return intersections;
  }

  private static lineIntersection(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number }
  ): { x: number; y: number } | null {
    const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (Math.abs(denominator) < 1e-10) return null;
    
    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
    
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;
    
    return {
      x: p1.x + ua * (p2.x - p1.x),
      y: p1.y + ua * (p2.y - p1.y)
    };
  }
}