import type { StitchPattern, StitchPoint } from '../types';

export class QCCWriter {
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
    const header = new ArrayBuffer(512);
    const view = new DataView(header);
    const signature = new TextEncoder().encode('QCC');
    
    view.setInt32(0, signature.length, true);
    new Uint8Array(header, 4, signature.length).set(signature);
    
    view.setInt32(8, pattern.stitches.length, true);
    view.setInt32(12, Math.round(pattern.dimensions.width * 10), true);
    view.setInt32(16, Math.round(pattern.dimensions.height * 10), true);
    
    return header;
  }

  private static encodeStitches(stitches: StitchPoint[]): ArrayBuffer {
    const data: number[] = [];

    stitches.forEach((stitch, index) => {
      if (index === 0) return;

      const prev = stitches[index - 1];
      const dx = Math.round((stitch.x - prev.x) * 10);
      const dy = Math.round((stitch.y - prev.y) * 10);

      // QCC format uses simple x,y coordinates with command byte
      data.push(0x00); // Normal stitch command
      data.push(dx & 0xFF, (dx >> 8) & 0xFF);
      data.push(dy & 0xFF, (dy >> 8) & 0xFF);
    });

    return new Uint8Array(data).buffer;
  }
}