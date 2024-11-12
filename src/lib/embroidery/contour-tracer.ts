import { Point } from './types';

export class ContourTracer {
  static async traceContours(params: {
    edges: Uint8ClampedArray;
    width: number;
    height: number;
  }): Promise<Point[][]> {
    const { edges, width, height } = params;
    const visited = new Uint8ClampedArray(edges.length);
    const contours: Point[][] = [];
    const minContourLength = 10;

    // Scan for edge pixels
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        if (edges[idx] === 255 && visited[idx] === 0) {
          const contour = this.traceContour(edges, visited, width, height, x, y);
          
          if (contour.length >= minContourLength) {
            // Simplify and smooth the contour
            const simplified = this.simplifyContour(contour, 1.0);
            const smoothed = this.smoothContour(simplified);
            contours.push(smoothed);
          }
        }
      }
    }

    if (contours.length === 0) {
      throw new Error('No contours found in image. Try adjusting the edge threshold.');
    }

    return contours;
  }

  private static traceContour(
    edges: Uint8ClampedArray,
    visited: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number
  ): Point[] {
    const contour: Point[] = [];
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1,  0],          [1,  0],
      [-1,  1], [0,  1], [1,  1]
    ];

    let x = startX;
    let y = startY;
    let done = false;

    while (!done) {
      const idx = y * width + x;
      visited[idx] = 1;
      contour.push({ x, y });

      let foundNext = false;
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (
          nx >= 0 && nx < width &&
          ny >= 0 && ny < height
        ) {
          const nidx = ny * width + nx;
          if (edges[nidx] === 255 && visited[nidx] === 0) {
            x = nx;
            y = ny;
            foundNext = true;
            break;
          }
        }
      }

      if (!foundNext) {
        done = true;
      }
    }

    return contour;
  }

  private static simplifyContour(points: Point[], tolerance: number): Point[] {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let maxIdx = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const dist = this.pointLineDistance(
        points[i],
        points[0],
        points[points.length - 1]
      );

      if (dist > maxDist) {
        maxDist = dist;
        maxIdx = i;
      }
    }

    if (maxDist > tolerance) {
      const left = this.simplifyContour(points.slice(0, maxIdx + 1), tolerance);
      const right = this.simplifyContour(points.slice(maxIdx), tolerance);
      return [...left.slice(0, -1), ...right];
    }

    return [points[0], points[points.length - 1]];
  }

  private static smoothContour(points: Point[]): Point[] {
    if (points.length <= 2) return points;

    const smoothed: Point[] = [];
    const windowSize = 3;
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < points.length; i++) {
      let sumX = 0;
      let sumY = 0;
      let count = 0;

      for (let j = -halfWindow; j <= halfWindow; j++) {
        const idx = (i + j + points.length) % points.length;
        sumX += points[idx].x;
        sumY += points[idx].y;
        count++;
      }

      smoothed.push({
        x: sumX / count,
        y: sumY / count
      });
    }

    return smoothed;
  }

  private static pointLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const numerator = Math.abs(
      (lineEnd.y - lineStart.y) * point.x -
      (lineEnd.x - lineStart.x) * point.y +
      lineEnd.x * lineStart.y -
      lineEnd.y * lineStart.x
    );

    const denominator = Math.sqrt(
      Math.pow(lineEnd.y - lineStart.y, 2) +
      Math.pow(lineEnd.x - lineStart.x, 2)
    );

    return numerator / denominator;
  }
}