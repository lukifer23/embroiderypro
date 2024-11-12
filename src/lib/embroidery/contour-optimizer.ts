import { Point } from './types';

export class ContourOptimizer {
  // Adapted from Ink/Stitch's path simplification
  static simplifyContour(points: Point[], tolerance: number): Point[] {
    if (points.length <= 2) return points;

    // Find point with maximum distance from line between start and end
    let maxDist = 0;
    let maxIndex = 0;
    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const dist = this.perpendicularDistance(points[i], start, end);
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    // If max distance is greater than tolerance, recursively simplify
    if (maxDist > tolerance) {
      const left = this.simplifyContour(points.slice(0, maxIndex + 1), tolerance);
      const right = this.simplifyContour(points.slice(maxIndex), tolerance);
      return [...left.slice(0, -1), ...right];
    }

    return [start, end];
  }

  // Adapted from Ink/Stitch's running stitch generation
  static generateRunningStitch(points: Point[], spacing: number): Point[] {
    const stitches: Point[] = [];
    let totalLength = 0;
    const segments: { start: Point; end: Point; length: number }[] = [];

    // Calculate segments and total length
    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1];
      const end = points[i];
      const length = this.distance(start, end);
      segments.push({ start, end, length });
      totalLength += length;
    }

    // Calculate number of stitches
    const numStitches = Math.max(2, Math.ceil(totalLength / spacing));
    const actualSpacing = totalLength / (numStitches - 1);

    // Generate evenly spaced stitches
    let distanceCovered = 0;
    let currentSegment = 0;
    let segmentProgress = 0;

    for (let i = 0; i < numStitches; i++) {
      const targetDistance = i * actualSpacing;

      // Find correct segment
      while (currentSegment < segments.length - 1 && 
             distanceCovered + segments[currentSegment].length < targetDistance) {
        distanceCovered += segments[currentSegment].length;
        currentSegment++;
      }

      const segment = segments[currentSegment];
      segmentProgress = (targetDistance - distanceCovered) / segment.length;

      stitches.push({
        x: segment.start.x + (segment.end.x - segment.start.x) * segmentProgress,
        y: segment.start.y + (segment.end.y - segment.start.y) * segmentProgress
      });
    }

    return stitches;
  }

  // Adapted from Ink/Stitch's auto-routing
  static optimizeStitchOrder(stitches: Point[]): Point[] {
    if (stitches.length <= 2) return stitches;

    const optimized: Point[] = [stitches[0]];
    const remaining = new Set(stitches.slice(1));
    let current = stitches[0];

    while (remaining.size > 0) {
      let nearest = null;
      let minDist = Infinity;

      for (const point of remaining) {
        const dist = this.distance(current, point);
        if (dist < minDist) {
          minDist = dist;
          nearest = point;
        }
      }

      if (!nearest) break;

      optimized.push(nearest);
      remaining.delete(nearest);
      current = nearest;
    }

    return optimized;
  }

  private static perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lineLengthSquared = dx * dx + dy * dy;

    if (lineLengthSquared === 0) {
      return this.distance(point, lineStart);
    }

    const t = Math.max(0, Math.min(1, (
      (point.x - lineStart.x) * dx +
      (point.y - lineStart.y) * dy
    ) / lineLengthSquared));

    const projection = {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy
    };

    return this.distance(point, projection);
  }

  private static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}