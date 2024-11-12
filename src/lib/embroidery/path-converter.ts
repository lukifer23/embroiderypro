interface PathSettings {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

export class PathConverter {
  static svgPathsToPoints(paths: string[], settings: PathSettings) {
    const contours = [];
    const scale = Math.min(
      settings.width / settings.originalWidth,
      settings.height / settings.originalHeight
    );

    for (const pathData of paths) {
      const points = this.parseSvgPath(pathData);
      if (points.length > 2) {
        // Scale points to target size
        const scaledPoints = points.map(p => ({
          x: p.x * scale,
          y: p.y * scale
        }));
        contours.push(scaledPoints);
      }
    }

    return contours;
  }

  private static parseSvgPath(pathData: string) {
    const points = [];
    const commands = pathData.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
    let currentX = 0;
    let currentY = 0;

    for (const cmd of commands) {
      const type = cmd[0];
      const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

      switch (type.toUpperCase()) {
        case 'M': // Move to
          currentX = type === 'M' ? args[0] : currentX + args[0];
          currentY = type === 'M' ? args[1] : currentY + args[1];
          points.push({ x: currentX, y: currentY });
          break;

        case 'L': // Line to
          currentX = type === 'L' ? args[0] : currentX + args[0];
          currentY = type === 'L' ? args[1] : currentY + args[1];
          points.push({ x: currentX, y: currentY });
          break;

        case 'H': // Horizontal line
          currentX = type === 'H' ? args[0] : currentX + args[0];
          points.push({ x: currentX, y: currentY });
          break;

        case 'V': // Vertical line
          currentY = type === 'V' ? args[0] : currentY + args[0];
          points.push({ x: currentX, y: currentY });
          break;

        case 'C': // Cubic bezier
          for (let t = 0; t <= 1; t += 0.1) {
            const point = this.cubicBezier(
              { x: currentX, y: currentY },
              { x: type === 'C' ? args[0] : currentX + args[0], 
                y: type === 'C' ? args[1] : currentY + args[1] },
              { x: type === 'C' ? args[2] : currentX + args[2], 
                y: type === 'C' ? args[3] : currentY + args[3] },
              { x: type === 'C' ? args[4] : currentX + args[4], 
                y: type === 'C' ? args[5] : currentY + args[5] },
              t
            );
            points.push(point);
          }
          currentX = type === 'C' ? args[4] : currentX + args[4];
          currentY = type === 'C' ? args[5] : currentY + args[5];
          break;

        case 'Z': // Close path
          if (points.length > 0) {
            points.push({ ...points[0] });
          }
          break;
      }
    }

    return points;
  }

  private static cubicBezier(p0: any, p1: any, p2: any, p3: any, t: number) {
    const mt = 1 - t;
    return {
      x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 
         3 * mt * t * t * p2.x + t * t * t * p3.x,
      y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 
         3 * mt * t * t * p2.y + t * t * t * p3.y
    };
  }
}