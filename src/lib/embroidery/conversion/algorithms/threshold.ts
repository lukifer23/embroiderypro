export function adaptiveThreshold(
  imageData: ImageData,
  options: {
    windowSize: number;
    C: number;
  }
): ImageData {
  const { width, height } = imageData;
  const result = new ImageData(width, height);
  const halfWindow = Math.floor(options.windowSize / 2);

  // Calculate integral image
  const integral = new Float32Array(width * height);
  let sum = 0;
  
  for (let y = 0; y < height; y++) {
    sum = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      sum += imageData.data[idx];
      integral[y * width + x] = sum + (y > 0 ? integral[(y - 1) * width + x] : 0);
    }
  }

  // Apply adaptive threshold
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - halfWindow);
      const x2 = Math.min(width - 1, x + halfWindow);
      const y1 = Math.max(0, y - halfWindow);
      const y2 = Math.min(height - 1, y + halfWindow);
      
      const count = (x2 - x1) * (y2 - y1);
      const sum = integral[y2 * width + x2] -
                 integral[y2 * width + x1] -
                 integral[y1 * width + x2] +
                 integral[y1 * width + x1];
      
      const mean = sum / count;
      const idx = (y * width + x) * 4;
      const value = imageData.data[idx] < mean - options.C ? 0 : 255;
      
      result.data[idx] = value;
      result.data[idx + 1] = value;
      result.data[idx + 2] = value;
      result.data[idx + 3] = 255;
    }
  }

  return result;
}