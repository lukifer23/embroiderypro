export function sobelEdgeDetection(imageData: ImageData): {
  magnitude: Float32Array;
  direction: Float32Array;
} {
  const { width, height } = imageData;
  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);

  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const idx = ((y + i) * width + (x + j)) * 4;
          const kernelIdx = (i + 1) * 3 + (j + 1);
          gx += imageData.data[idx] * sobelX[kernelIdx];
          gy += imageData.data[idx] * sobelY[kernelIdx];
        }
      }

      const idx = y * width + x;
      magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
      direction[idx] = Math.atan2(gy, gx);
    }
  }

  return { magnitude, direction };
}

export function nonMaximumSuppression(
  magnitude: Float32Array,
  direction: Float32Array
): Float32Array {
  const width = Math.sqrt(magnitude.length);
  const height = width;
  const result = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const angle = direction[idx] * 180 / Math.PI;
      const mag = magnitude[idx];

      let n1, n2;

      if (angle < 22.5 || angle > 157.5) {
        n1 = magnitude[idx - 1];
        n2 = magnitude[idx + 1];
      } else if (angle < 67.5) {
        n1 = magnitude[idx - width + 1];
        n2 = magnitude[idx + width - 1];
      } else if (angle < 112.5) {
        n1 = magnitude[idx - width];
        n2 = magnitude[idx + width];
      } else {
        n1 = magnitude[idx - width - 1];
        n2 = magnitude[idx + width + 1];
      }

      result[idx] = (mag >= n1 && mag >= n2) ? mag : 0;
    }
  }

  return result;
}

export function hysteresis(
  edges: Float32Array,
  options: {
    lowThreshold: number;
    highThreshold: number;
  }
): ImageData {
  const width = Math.sqrt(edges.length);
  const height = width;
  const result = new ImageData(width, height);
  const visited = new Uint8Array(width * height);

  function trace(x: number, y: number) {
    const stack = [[x, y]];

    while (stack.length > 0) {
      const [px, py] = stack.pop()!;
      const idx = py * width + px;

      if (visited[idx]) continue;
      visited[idx] = 1;

      if (edges[idx] >= options.lowThreshold) {
        const resultIdx = idx * 4;
        result.data[resultIdx] = 255;
        result.data[resultIdx + 1] = 255;
        result.data[resultIdx + 2] = 255;
        result.data[resultIdx + 3] = 255;

        // Check 8-connected neighbors
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const nx = px + j;
            const ny = py + i;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              stack.push([nx, ny]);
            }
          }
        }
      }
    }
  }

  // Start from strong edges
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx] && edges[idx] >= options.highThreshold) {
        trace(x, y);
      }
    }
  }

  return result;
}