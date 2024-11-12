import type { StitchPattern, StitchPoint } from '../types';

export class HUSWriter {
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
    const signature = new TextEncoder().encode('HUS');
    
    view.setInt32(0, signature.length, true);
    new Uint8Array(header, 4, signature.length).set(signature);
    
    view.setInt32(8, pattern.stitches.length, true);
    view.setInt32(12, pattern.colors.length, true);
    view.setInt32(16, Math.round(pattern.dimensions.width * 10), true);
    view.setInt32(20, Math.round(pattern.dimensions.height * 10), true);
    
    return header;
  }

  private static encodeStitches(stitches: StitchPoint[]): ArrayBuffer {
    const data: number[] = [];

    stitches.forEach((stitch, index) => {
      if (index === 0) return;

      const prev = stitches[index - 1];
      const dx = Math.round((stitch.x - prev.x) * 10);
      const dy = Math.round((stitch.y - prev.y) * 10);

      switch (stitch.type) {
        case 'jump':
          data.push(0x80 | Math.abs(dx));
          data.push(0x80 | Math.abs(dy));
          if (dx < 0) data.push(0x20);
          if (dy < 0) data.push(0x20);
          break;
        case 'stop':
          data.push(0xF0);
          break;
        case 'end':
          data.push(0xF8);
          break;
        default:
          data.push(Math.abs(dx));
          data.push(Math.abs(dy));
          if (dx < 0) data.push(0x20);
          if (dy < 0) data.push(0x20);
      }
    });

    return new Uint8Array(data).buffer;
  }
}