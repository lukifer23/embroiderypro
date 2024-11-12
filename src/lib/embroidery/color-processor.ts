import { ProcessingError } from './types';

// Standard thread colors based on common embroidery thread manufacturers
const THREAD_COLORS = [
  { name: 'Black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 } },
  { name: 'Dark Gray', hex: '#404040', rgb: { r: 64, g: 64, b: 64 } },
  { name: 'Medium Gray', hex: '#808080', rgb: { r: 128, g: 128, b: 128 } },
  { name: 'Light Gray', hex: '#C0C0C0', rgb: { r: 192, g: 192, b: 192 } },
  { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 } },
  // Extended color palette for color mode
  { name: 'Red', hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 } },
  { name: 'Green', hex: '#00FF00', rgb: { r: 0, g: 255, b: 0 } },
  { name: 'Blue', hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 } },
  { name: 'Yellow', hex: '#FFFF00', rgb: { r: 255, g: 255, b: 0 } },
  { name: 'Cyan', hex: '#00FFFF', rgb: { r: 0, g: 255, b: 255 } },
  { name: 'Magenta', hex: '#FF00FF', rgb: { r: 255, g: 0, b: 255 } }
];

const GRAYSCALE_COLORS = THREAD_COLORS.slice(0, 5);

export class ColorProcessor {
  static processImage(imageData: ImageData, colorMode: 'grayscale' | 'color'): {
    processedData: ImageData;
    colors: string[];
  } {
    const processed = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    const colors = colorMode === 'grayscale' ? GRAYSCALE_COLORS : THREAD_COLORS;
    const usedColors = new Set<string>();

    for (let i = 0; i < processed.data.length; i += 4) {
      if (colorMode === 'grayscale') {
        // Convert to grayscale
        const gray = Math.round(
          processed.data[i] * 0.299 +
          processed.data[i + 1] * 0.587 +
          processed.data[i + 2] * 0.114
        );

        // Find closest grayscale thread color
        const threadColor = this.findClosestColor(
          { r: gray, g: gray, b: gray },
          GRAYSCALE_COLORS
        );

        processed.data[i] = threadColor.rgb.r;
        processed.data[i + 1] = threadColor.rgb.g;
        processed.data[i + 2] = threadColor.rgb.b;
        usedColors.add(threadColor.hex);
      } else {
        // Find closest thread color for color mode
        const threadColor = this.findClosestColor(
          {
            r: processed.data[i],
            g: processed.data[i + 1],
            b: processed.data[i + 2]
          },
          THREAD_COLORS
        );

        processed.data[i] = threadColor.rgb.r;
        processed.data[i + 1] = threadColor.rgb.g;
        processed.data[i + 2] = threadColor.rgb.b;
        usedColors.add(threadColor.hex);
      }
    }

    return {
      processedData: processed,
      colors: Array.from(usedColors)
    };
  }

  private static findClosestColor(
    color: { r: number; g: number; b: number },
    palette: typeof THREAD_COLORS
  ) {
    let closestColor = palette[0];
    let minDistance = Infinity;

    for (const threadColor of palette) {
      const distance = this.calculateColorDistance(color, threadColor.rgb);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = threadColor;
      }
    }

    return closestColor;
  }

  private static calculateColorDistance(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number }
  ): number {
    // Use CIE94 color difference formula for better color matching
    const l1 = 0.2126 * color1.r + 0.7152 * color1.g + 0.0722 * color1.b;
    const l2 = 0.2126 * color2.r + 0.7152 * color2.g + 0.0722 * color2.b;
    const dl = l1 - l2;

    const da = color1.r - color2.r;
    const db = color1.b - color2.b;

    // Weight factors for better perceptual matching
    const c1 = Math.sqrt(color1.r * color1.r + color1.b * color1.b);
    const c2 = Math.sqrt(color2.r * color2.r + color2.b * color2.b);
    const dc = c1 - c2;

    const dh = Math.sqrt(
      Math.max(0, da * da + db * db - dc * dc)
    );

    // Weighting factors
    const sl = 1;
    const sc = 1 + 0.045 * c1;
    const sh = 1 + 0.015 * c1;

    return Math.sqrt(
      Math.pow(dl / sl, 2) +
      Math.pow(dc / sc, 2) +
      Math.pow(dh / sh, 2)
    );
  }
}