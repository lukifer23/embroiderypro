import type { StitchPattern, StitchPoint } from './types';

export class StitchOptimizer {
  static readonly MIN_DISTANCE = 0.5; // mm
  static readonly MAX_STITCH = 12.1; // mm
  static readonly JUMP_THRESHOLD = 12.1; // mm

  static optimizePattern(pattern: StitchPattern): StitchPattern {
    const optimizedStitches = this.optimizeStitches(pattern.stitches);
    
    return {
      ...pattern,
      stitches: optimizedStitches
    };
  }

  private static optimizeStitches(stitches: StitchPoint[]): StitchPoint[] {
    const optimized: StitchPoint[] = [];
    let lastStitch: StitchPoint | null = null;

    for (const stitch of stitches) {
      if (!lastStitch) {
        optimized.push(stitch);
        lastStitch = stitch;
        continue;
      }

      const distance = this.getDistance(lastStitch, stitch);

      // Skip too-close stitches
      if (distance < this.MIN_DISTANCE && stitch.type === 'normal') {
        continue;
      }

      // Convert long stitches to jumps
      if (distance > this.MAX_STITCH && stitch.type === 'normal') {
        const jumpStitch = { ...stitch, type: 'jump' };
        optimized.push(jumpStitch);
        lastStitch = jumpStitch;
        continue;
      }

      optimized.push(stitch);
      lastStitch = stitch;
    }

    return this.optimizeColorChanges(optimized);
  }

  private static optimizeColorChanges(stitches: StitchPoint[]): StitchPoint[] {
    const optimized: StitchPoint[] = [];
    let currentColor = '';

    for (const stitch of stitches) {
      if (stitch.color === currentColor) {
        optimized.push(stitch);
      } else {
        // Add color change
        if (currentColor !== '') {
          optimized.push({
            ...stitch,
            type: 'stop'
          });
        }
        optimized.push(stitch);
        currentColor = stitch.color;
      }
    }

    return optimized;
  }

  private static getDistance(p1: StitchPoint, p2: StitchPoint): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}