import type { StitchPattern, StitchPoint } from '../types';

export class VP3Writer {
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
    const signature = new TextEncoder().encode('VP3');
    
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
    let currentColor = 0;

    stitches.forEach((stitch, index) => {
      if (index === 0) return;

      const prev = stitches[index - 1];
      const dx = Math.round((stitch.x - prev.x) * 10);
      const dy = Math.round((stitch.y - prev.y) * 10);

      switch (stitch.type) {
        case 'jump':
          data.push(0x80, dx & 0xFF, dy & 0xFF);
          break;
        case 'stop':
          data.push(0xF8, currentColor++);
          break;
        case 'end':
          data.push(0xFF);
          break;
        default:
          data.push(dx & 0xFF, dy & 0xFF);
      }
    });

    return new Uint8Array(data).buffer;
  }
}