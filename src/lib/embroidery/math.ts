export class EmbroideryMath {
  // Convert millimeters to points (1 point = 1/72 inch)
  static mmToPoints(mm: number): number {
    return mm * 2.83465; // 1mm = 2.83465pt
  }

  // Convert points to millimeters
  static pointsToMm(points: number): number {
    return points / 2.83465;
  }

  // Calculate stitch density based on area and desired stitches per mm²
  static calculateStitchDensity(width: number, height: number, stitchesPerMm2: number): number {
    const areaMm2 = width * height;
    return Math.round(areaMm2 * stitchesPerMm2);
  }

  // Calculate optimal stitch length based on curve radius
  static calculateStitchLength(curveRadius: number): number {
    // Smaller radius = shorter stitches for smoother curves
    return Math.min(Math.max(curveRadius / 10, 0.5), 3); // Min 0.5mm, Max 3mm
  }
}