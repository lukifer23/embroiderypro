import type { StitchPattern, StitchPoint } from '../types';

export class EXPWriter {
  static write(pattern: StitchPattern): ArrayBuffer {
    const stitches = this.encodeStitches(pattern.stitches);
    return stitches;
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