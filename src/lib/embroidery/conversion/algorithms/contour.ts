import { Point } from '../../types';

export function findContours(imageData: ImageData): Point[][] {
  const contours: Point[][] = [];
  const visited = new Set<string>();
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const key = `${x},${y}`;
      
      // Check if pixel is edge and not visited
      if (imageData.data[idx] > 128 && !visited.has(key)) {
        const contour = traceContour(imageData, x, y, visited);
        if (contour.length >= 3) {
          contours.push(contour);
        }
      }
    }
  }

  return contours;
}

function traceContour(
  imageData: ImageData,
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
      
      if (nx >= 0 && nx < imageData.width && ny >= 0 && ny < imageData.height) {
        const idx = (ny * imageData.width + nx) * 4;
        const nkey = `${nx},${ny}`;
        
        if (imageData.data[idx] > 128 && !visited.has(nkey)) {
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

export function simplifyContour(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyContour(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyContour(points.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [start, end];
}

export function smoothContour(points: Point[], factor: number): Point[] {
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
      x: points[i].x * (1 - factor) + (sumX / count) * factor,
      y: points[i].y * (1 - factor) + (sumY / count) * factor
    });
  }

  return smoothed;
}

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lineLengthSquared = dx * dx + dy * dy;

  if (lineLengthSquared === 0) {
    return distance(point, lineStart);
  }

  const t = Math.max(0, Math.min(1, (
    (point.x - lineStart.x) * dx +
    (point.y - lineStart.y) * dy
  ) / lineLengthSquared));

  const projection = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy
  };

  return distance(point, projection);
}

function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}