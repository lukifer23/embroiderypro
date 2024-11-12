import { Point } from '../types';

export class ContourProcessor {
  static async traceContours(edgeData: ImageData): Promise<Point[][]> {
    const contours: Point[][] = [];
    const visited = new Set<string>();
    
    for (let y = 0; y < edgeData.height; y++) {
      for (let x = 0; x < edgeData.width; x++) {
        const idx = (y * edgeData.width + x) * 4;
        const key = `${x},${y}`;
        
        if (edgeData.data[idx] === 255 && !visited.has(key)) {
          const contour = this.traceContour(edgeData, x, y, visited);
          if (contour.length >= 3) {
            contours.push(this.simplifyContour(contour));
          }
        }
      }
    }

    return contours;
  }

  private static traceContour(
    edgeData: ImageData,
    startX: number,
    startY: number,
    visited: Set<string>
  ): Point[] {
    const contour: Point[] = [];
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],          [1, 0],
      [-1, 1],  [0, 1], [1, 1]
    ];

    let x = startX;
    let y = startY;
    let foundNext = true;

    while (foundNext) {
      const key = `${x},${y}`;
      if (visited.has(key)) break;

      visited.add(key);
      contour.push({ x, y });
      foundNext = false;

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (
          nx >= 0 && nx < edgeData.width &&
          ny >= 0 && ny < edgeData.height
        ) {
          const idx = (ny * edgeData.width + nx) * 4;
          const nkey = `${nx},${ny}`;
          
          if (edgeData.data[idx] === 255 && !visited.has(nkey)) {
            x = nx;
            y = ny;
            foundNext = true;
            break;
          }
        }
      }
    }

    return contour;
  }

  private static simplifyContour(points: Point[]): Point[] {
    if (points.length <= 2) return points;

    const tolerance = 1.0;
    const simplified: Point[] = [points[0]];
    let lastPoint = points[0];

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const distance = this.distance(lastPoint, point);
      
      if (distance >= tolerance) {
        simplified.push(point);
        lastPoint = point;
      }
    }

    // Close the contour if needed
    const first = simplified[0];
    const last = simplified[simplified.length - 1];
    if (this.distance(first, last) >= tolerance) {
      simplified.push({ ...first });
    }

    return simplified;
  }

  private static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}