export class BitmapProcessor {
  static createBitmap(imageData: ImageData, threshold: number): boolean[][] {
    const { width, height, data } = imageData;
    const bitmap: boolean[][] = Array(height).fill(0).map(() => Array(width).fill(false));

    // Convert to grayscale and apply threshold
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const grayscale = Math.round(
          data[i] * 0.299 +     // Red
          data[i + 1] * 0.587 + // Green
          data[i + 2] * 0.114   // Blue
        );
        bitmap[y][x] = grayscale > threshold;
      }
    }

    return bitmap;
  }

  static findConnectedComponents(bitmap: boolean[][]): number[][] {
    const height = bitmap.length;
    const width = bitmap[0].length;
    const labels: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));
    let nextLabel = 1;

    // First pass: assign initial labels
    const equivalences = new UnionFind();
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!bitmap[y][x]) continue;

        const neighbors = this.getNeighborLabels(labels, x, y);
        if (neighbors.length === 0) {
          labels[y][x] = nextLabel++;
        } else {
          labels[y][x] = Math.min(...neighbors);
          for (const n of neighbors) {
            equivalences.union(labels[y][x], n);
          }
        }
      }
    }

    // Second pass: resolve equivalences
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (labels[y][x] > 0) {
          labels[y][x] = equivalences.find(labels[y][x]);
        }
      }
    }

    return labels;
  }

  private static getNeighborLabels(labels: number[][], x: number, y: number): number[] {
    const neighbors: number[] = [];
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1]];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && ny < labels.length && nx < labels[0].length) {
        const label = labels[ny][nx];
        if (label > 0) neighbors.push(label);
      }
    }

    return neighbors;
  }

  static removeSmallComponents(bitmap: boolean[][], minSize: number): void {
    const labels = this.findConnectedComponents(bitmap);
    const componentSizes = new Map<number, number>();

    // Count sizes
    for (let y = 0; y < bitmap.length; y++) {
      for (let x = 0; x < bitmap[0].length; x++) {
        const label = labels[y][x];
        if (label > 0) {
          componentSizes.set(label, (componentSizes.get(label) || 0) + 1);
        }
      }
    }

    // Remove small components
    for (let y = 0; y < bitmap.length; y++) {
      for (let x = 0; x < bitmap[0].length; x++) {
        const label = labels[y][x];
        if (label > 0 && (componentSizes.get(label) || 0) < minSize) {
          bitmap[y][x] = false;
        }
      }
    }
  }

  static dilate(bitmap: boolean[][]): void {
    const height = bitmap.length;
    const width = bitmap[0].length;
    const copy = bitmap.map(row => [...row]);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (!copy[y][x]) {
          // Check 8-connected neighbors
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (copy[y + dy][x + dx]) {
                bitmap[y][x] = true;
                break;
              }
            }
            if (bitmap[y][x]) break;
          }
        }
      }
    }
  }

  static erode(bitmap: boolean[][]): void {
    const height = bitmap.length;
    const width = bitmap[0].length;
    const copy = bitmap.map(row => [...row]);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (copy[y][x]) {
          // Check if any 8-connected neighbor is background
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (!copy[y + dy][x + dx]) {
                bitmap[y][x] = false;
                break;
              }
            }
            if (!bitmap[y][x]) break;
          }
        }
      }
    }
  }
}

class UnionFind {
  private parent: Map<number, number>;

  constructor() {
    this.parent = new Map();
  }

  find(x: number): number {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      return x;
    }

    let root = x;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!;
    }

    // Path compression
    while (x !== root) {
      const next = this.parent.get(x)!;
      this.parent.set(x, root);
      x = next;
    }

    return root;
  }

  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX !== rootY) {
      this.parent.set(rootX, rootY);
    }
  }
}