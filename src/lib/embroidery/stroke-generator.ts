import { StitchPoint, StitchSettings } from './types';

export class StrokeGenerator {
  static generateStroke(
    points: { x: number; y: number }[],
    color: string,
    settings: Partial<StitchSettings> = {}
  ): StitchPoint[] {
    const stitches: StitchPoint[] = [];
    const spacing = settings.strokeSpacing || 0.4;
    const minLength = settings.minLength || 0.1;
    const maxLength = settings.maxLength || 12.1;

    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1];
      const end = points[i];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minLength) continue;

      const steps = Math.ceil(distance / spacing);
      for (let j = 1; j <= steps; j++) {
        const t = j / steps;
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

  static generateRunningStitch(
    points: { x: number; y: number }[],
    color: string,
    settings: Partial<StitchSettings> = {}
  ): StitchPoint[] {
    const stitches: StitchPoint[] = [];
    const spacing = settings.strokeSpacing || 0.4;
    let totalLength = 0;

    // Calculate total path length
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }

    // Generate evenly spaced stitches
    const numStitches = Math.ceil(totalLength / spacing);
    const increment = totalLength / numStitches;
    let currentDist = 0;
    let currentSegment = 0;
    let segmentStart = points[0];
    let segmentLength = 0;

    for (let i = 0; i < numStitches; i++) {
      while (currentDist > segmentLength && currentSegment < points.length - 1) {
        currentDist -= segmentLength;
        currentSegment++;
        segmentStart = points[currentSegment - 1];
        const dx = points[currentSegment].x - segmentStart.x;
        const dy = points[currentSegment].y - segmentStart.y;
        segmentLength = Math.sqrt(dx * dx + dy * dy);
      }

      const t = currentDist / segmentLength;
      const dx = points[currentSegment].x - segmentStart.x;
      const dy = points[currentSegment].y - segmentStart.y;

      stitches.push({
        x: segmentStart.x + dx * t,
        y: segmentStart.y + dy * t,
        type: 'normal',
        color
      });

      currentDist += increment;
    }

    return stitches;
  }

  static generateZigZagStitch(
    points: { x: number; y: number }[],
    width: number,
    color: string,
    settings: Partial<StitchSettings> = {}
  ): StitchPoint[] {
    const stitches: StitchPoint[] = [];
    const spacing = settings.strokeSpacing || 0.4;

    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1];
      const end = points[i];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate perpendicular vector
      const perpX = -dy / distance * (width / 2);
      const perpY = dx / distance * (width / 2);

      const steps = Math.ceil(distance / spacing);
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const baseX = start.x + dx * t;
        const baseY = start.y + dy * t;
        
        // Alternate between top and bottom points
        const side = j % 2 === 0 ? 1 : -1;
        stitches.push({
          x: baseX + perpX * side,
          y: baseY + perpY * side,
          type: 'normal',
          color
        });
      }
    }

    return stitches;
  }
}