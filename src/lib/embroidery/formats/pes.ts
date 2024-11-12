import type { StitchPattern, StitchPoint } from '../types';

export class PESWriter {
  static write(pattern: StitchPattern): ArrayBuffer {
    const header = this.createHeader(pattern);
    const stitches = this.encodeStitches(pattern.stitches);
    
    const data = new ArrayBuffer(header.byteLength + stitches.byteLength);
    const view = new Uint8Array(data);
    view.set(new Uint8Array(header), 0);
    view.set(new Uint8Array(stitches), header.byteLength);
    
    return data;
  }

  private static createHeader(pattern: StitchPattern): ArrayBuffer {
    const header = new ArrayBuffer(532); // PES header size
    const view = new DataView(header);
    
    // PES magic number "#PES0001"
    const signature = new TextEncoder().encode('#PES0001');
    for (let i = 0; i < signature.length; i++) {
      view.setUint8(i, signature[i]);
    }
    
    // PEC block start - always at offset 8
    view.setUint32(8, 0x50454300, true); // "PEC\0"
    
    // Set dimensions (convert to 1/10mm)
    const width = Math.round(pattern.dimensions.width * 10);
    const height = Math.round(pattern.dimensions.height * 10);
    view.setUint16(532 - 8, width, true);
    view.setUint16(532 - 6, height, true);
    
    // Set number of colors
    view.setUint8(532 - 4, pattern.colors.length);
    
    // Write color table
    const colorTable = this.createColorTable(pattern.colors);
    view.setUint8(532 - 3, colorTable.length);
    for (let i = 0; i < colorTable.length; i++) {
      view.setUint8(48 + i, colorTable[i]);
    }
    
    return header;
  }

  private static createColorTable(colors: string[]): number[] {
    // PES color table - maps RGB colors to thread colors
    const threadColors: number[] = [];
    
    colors.forEach(color => {
      const rgb = this.hexToRgb(color);
      if (rgb) {
        // Find closest thread color index
        const threadIndex = this.findClosestThreadColor(rgb);
        threadColors.push(threadIndex);
      }
    });
    
    return threadColors;
  }

  private static encodeStitches(stitches: StitchPoint[]): ArrayBuffer {
    const data: number[] = [];
    let currentColor = 0;
    let lastX = 0;
    let lastY = 0;

    stitches.forEach((stitch, index) => {
      // Convert to PES coordinate system (1/10mm)
      const x = Math.round(stitch.x * 10);
      const y = Math.round(stitch.y * 10);
      const dx = x - lastX;
      const dy = y - lastY;

      switch (stitch.type) {
        case 'jump':
          data.push(0x90, dx & 0xFF, dy & 0xFF);
          break;
        case 'stop':
          data.push(0xFE, currentColor++);
          break;
        case 'end':
          data.push(0xFF);
          break;
        default:
          // Normal stitch - encode relative movement
          if (Math.abs(dx) > 127 || Math.abs(dy) > 127) {
            // Split into multiple jumps if needed
            const steps = Math.max(
              Math.ceil(Math.abs(dx) / 127),
              Math.ceil(Math.abs(dy) / 127)
            );
            const stepX = dx / steps;
            const stepY = dy / steps;
            
            for (let i = 0; i < steps; i++) {
              const moveX = Math.round(stepX);
              const moveY = Math.round(stepY);
              data.push(moveX & 0xFF, moveY & 0xFF);
            }
          } else {
            data.push(dx & 0xFF, dy & 0xFF);
          }
      }

      lastX = x;
      lastY = y;
    });

    // End of pattern
    data.push(0xFF);

    return new Uint8Array(data).buffer;
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private static findClosestThreadColor(rgb: { r: number; g: number; b: number }): number {
    // Standard thread color palette
    const threadColors = [
      { index: 0, rgb: { r: 0, g: 0, b: 0 } },        // Black
      { index: 1, rgb: { r: 255, g: 255, b: 255 } },  // White
      { index: 2, rgb: { r: 255, g: 0, b: 0 } },      // Red
      { index: 3, rgb: { r: 0, g: 255, b: 0 } },      // Green
      { index: 4, rgb: { r: 0, g: 0, b: 255 } },      // Blue
      { index: 5, rgb: { r: 255, g: 255, b: 0 } },    // Yellow
      // Add more standard thread colors as needed
    ];

    let closestColor = 0;
    let minDistance = Infinity;

    threadColors.forEach(thread => {
      const distance = Math.sqrt(
        Math.pow(thread.rgb.r - rgb.r, 2) +
        Math.pow(thread.rgb.g - rgb.g, 2) +
        Math.pow(thread.rgb.b - rgb.b, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = thread.index;
      }
    });

    return closestColor;
  }
}