import type { StitchPattern, StitchPoint } from '../types';

export class JEFWriter {
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
    const header = new ArrayBuffer(128);
    const view = new DataView(header);
    
    // JEF header format
    view.setInt32(0, 0x4A454600, true); // "JEF" magic number
    view.setInt32(4, pattern.stitches.length, true); // Stitch count
    view.setInt32(8, pattern.colors.length, true); // Number of colors
    view.setInt32(12, Math.round(pattern.dimensions.width * 10), true); // Width in 0.1mm
    view.setInt32(16, Math.round(pattern.dimensions.height * 10), true); // Height in 0.1mm
    
    return header;
  }

  private static encodeStitches(stitches: StitchPoint[]): ArrayBuffer {
    const data = new ArrayBuffer(stitches.length * 2);
    const view = new DataView(data);
    let offset = 0;

    stitches.forEach((stitch, index) => {
      if (index === 0) return;

      const prev = stitches[index - 1];
      const dx = Math.round((stitch.x - prev.x) * 10); // Convert to 0.1mm
      const dy = Math.round((stitch.y - prev.y) * 10);

      switch (stitch.type) {
        case 'jump':
          view.setInt8(offset++, 0x80 | (dx & 0x7F));
          view.setInt8(offset++, 0x80 | (dy & 0x7F));
          break;
        case 'stop':
          view.setInt8(offset++, 0xF3);
          view.setInt8(offset++, 0);
          break;
        case 'end':
          view.setInt8(offset++, 0xF0);
          view.setInt8(offset++, 0);
          break;
        default:
          view.setInt8(offset++, dx & 0x7F);
          view.setInt8(offset++, dy & 0x7F);
      }
    });

    return data;
  }
}