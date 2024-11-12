import { Point, StitchPoint } from './types';

export class StitchOptimizer {
  // Adapted from Ink/Stitch's stitch planning
  static optimizeStitches(stitches: StitchPoint[]): StitchPoint[] {
    if (stitches.length <= 2) return stitches;

    const optimized: StitchPoint[] = [];
    const minLength = 0.3; // mm
    const maxLength = 12.1; // mm
    let lastStitch = stitches[0];
    optimized.push(lastStitch);

    for (let i = 1; i < stitches.length; i++) {
      const stitch = stitches[i];
      const distance = this.distance(lastStitch, stitch);

      // Skip too-short stitches
      if (distance < minLength && stitch.type === 'normal') {
        continue;
      }

      // Split long stitches
      if (distance > maxLength && stitch.type === 'normal') {
        const steps = Math.ceil(distance / maxLength);
        const dx = (stitch.x - lastStitch.x) / steps;
        const dy = (stitch.y - lastStitch.y) / steps;

        for (let j = 1; j < steps; j++) {
          optimized.push({
            x: lastStitch.x + dx * j,
            y: lastStitch.y + dy * j,
            type: 'normal',
            color: stitch.color
          });
        }
      }

      optimized.push(stitch);
      lastStitch = stitch;
    }

    return this.removeRedundantJumps(optimized);
  }

  // Adapted from Ink/Stitch's jump stitch optimization
  private static removeRedundantJumps(stitches: StitchPoint[]): StitchPoint[] {
    const result: StitchPoint[] = [];
    let lastNormalStitch: StitchPoint | null = null;

    for (let i = 0; i < stitches.length; i++) {
      const stitch = stitches[i];

      if (stitch.type === 'normal') {
        if (lastNormalStitch) {
          const distance = this.distance(lastNormalStitch, stitch);
          if (distance > 12.1) {
            // Convert to jump if too far
            result.push({
              ...stitch,
              type: 'jump'
            });
          } else {
            result.push(stitch);
          }
        } else {
          result.push(stitch);
        }
        lastNormalStitch = stitch;
      } else {
        result.push(stitch);
      }
    }

    return result;
  }

  private static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}