import type { StitchPattern, StitchPoint } from '../types';
import { ProcessingError } from '../types';

export class DSTWriter {
  // DST format constants
  private static readonly PPMM = 10; // Points per millimeter
  private static readonly MAX_JUMP = 121; // Maximum jump size in 0.1mm
  private static readonly MAX_STITCH = 121; // Maximum stitch length in 0.1mm
  private static readonly HEADER_SIZE = 512;
  private static readonly MAX_STITCHES = 999999;

  static write(pattern: StitchPattern): ArrayBuffer {
    try {
      // Validate pattern
      this.validatePattern(pattern);

      // Normalize coordinates to positive values
      const normalizedPattern = this.normalizeCoordinates(pattern);

      // Create header and stitch data
      const header = this.createHeader(normalizedPattern);
      const stitchData = this.encodeStitches(normalizedPattern.stitches);
      
      // Combine header and stitch data
      const data = new ArrayBuffer(header.byteLength + stitchData.byteLength);
      const view = new Uint8Array(data);
      view.set(new Uint8Array(header), 0);
      view.set(new Uint8Array(stitchData), header.byteLength);
      
      return data;
    } catch (error) {
      console.error('DST write error:', error);
      throw new ProcessingError('Failed to create DST file', error as Error);
    }
  }

  private static validatePattern(pattern: StitchPattern): void {
    if (!pattern?.stitches?.length) {
      throw new ProcessingError('Pattern has no stitches');
    }

    if (pattern.stitches.length > this.MAX_STITCHES) {
      throw new ProcessingError(`Pattern has too many stitches (${pattern.stitches.length}). Maximum allowed: ${this.MAX_STITCHES}`);
    }

    // Check for valid coordinates
    pattern.stitches.forEach((stitch, index) => {
      if (isNaN(stitch.x) || isNaN(stitch.y)) {
        throw new ProcessingError(`Invalid coordinates at stitch ${index}`);
      }
    });

    // Validate dimensions
    if (!pattern.dimensions?.width || !pattern.dimensions?.height) {
      throw new ProcessingError('Invalid pattern dimensions');
    }

    if (pattern.dimensions.width > 400 || pattern.dimensions.height > 400) {
      throw new ProcessingError('Pattern dimensions exceed maximum size of 400mm');
    }
  }

  private static normalizeCoordinates(pattern: StitchPattern): StitchPattern {
    // Find minimum coordinates
    const minX = Math.min(...pattern.stitches.map(s => s.x));
    const minY = Math.min(...pattern.stitches.map(s => s.y));

    // Normalize to positive values and convert to 0.1mm units
    return {
      ...pattern,
      stitches: pattern.stitches.map(stitch => ({
        ...stitch,
        x: Math.round((stitch.x - minX) * this.PPMM),
        y: Math.round((stitch.y - minY) * this.PPMM)
      }))
    };
  }

  private static createHeader(pattern: StitchPattern): ArrayBuffer {
    const header = new ArrayBuffer(this.HEADER_SIZE);
    const view = new Uint8Array(header);
    const encoder = new TextEncoder();
    
    // Calculate pattern bounds
    const bounds = this.calculateBounds(pattern.stitches);
    
    // Format header string according to DST specification
    const headerText = [
      'LA:Design Studio',
      `ST:${pattern.stitches.length}`,
      `CO:1`,
      `+X:${bounds.maxX}`,
      `-X:${Math.abs(bounds.minX)}`,
      `+Y:${bounds.maxY}`,
      `-Y:${Math.abs(bounds.minY)}`,
      'AX:+0',
      'AY:+0',
      'MX:+0',
      'MY:+0',
      'PD:******'
    ].join('\r\n') + '\r\n';

    // Write header with padding
    const headerBytes = encoder.encode(headerText);
    if (headerBytes.length > this.HEADER_SIZE) {
      throw new ProcessingError('Header size exceeds maximum allowed');
    }
    view.set(headerBytes);
    
    return header;
  }

  private static calculateBounds(stitches: StitchPoint[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    return {
      minX: Math.min(...stitches.map(s => s.x)),
      maxX: Math.max(...stitches.map(s => s.x)),
      minY: Math.min(...stitches.map(s => s.y)),
      maxY: Math.max(...stitches.map(s => s.y))
    };
  }

  private static encodeStitches(stitches: StitchPoint[]): ArrayBuffer {
    const data: number[] = [];
    let lastX = 0;
    let lastY = 0;

    // Add initial position
    data.push(...this.encodeStitchDelta(0, 0, 'jump'));

    // Encode all stitches
    for (const stitch of stitches) {
      const dx = stitch.x - lastX;
      const dy = stitch.y - lastY;

      // Split large movements into multiple jumps/stitches
      if (Math.abs(dx) > this.MAX_STITCH || Math.abs(dy) > this.MAX_STITCH) {
        const steps = Math.max(
          Math.ceil(Math.abs(dx) / this.MAX_JUMP),
          Math.ceil(Math.abs(dy) / this.MAX_JUMP)
        );
        
        for (let i = 0; i < steps; i++) {
          const stepX = Math.round(dx * (i + 1) / steps - dx * i / steps);
          const stepY = Math.round(dy * (i + 1) / steps - dy * i / steps);
          
          // Use jump stitches for large movements
          data.push(...this.encodeStitchDelta(
            stepX,
            stepY,
            'jump'
          ));
        }
      } else {
        // Normal stitch for small movements
        data.push(...this.encodeStitchDelta(dx, dy, stitch.type));
      }

      lastX = stitch.x;
      lastY = stitch.y;
    }

    // Add end of file marker
    data.push(...this.encodeStitchDelta(0, 0, 'end'));

    return new Uint8Array(data).buffer;
  }

  private static encodeStitchDelta(dx: number, dy: number, type: string): number[] {
    // Clamp deltas to valid range
    dx = Math.max(-this.MAX_STITCH, Math.min(this.MAX_STITCH, dx));
    dy = Math.max(-this.MAX_STITCH, Math.min(this.MAX_STITCH, dy));

    // Encode according to DST format specification
    const x = Math.abs(dx);
    const y = Math.abs(dy);

    let b0 = y & 0x0F;
    let b1 = x & 0x0F;
    let b2 = ((y & 0xF0) >> 4) | ((x & 0xF0) >> 4);

    // Set sign bits
    if (dx < 0) b2 |= 0x20;
    if (dy < 0) b2 |= 0x40;

    // Set stitch type bits
    switch (type) {
      case 'jump':
        b2 |= 0x83;
        break;
      case 'stop':
        b2 |= 0xC3;
        break;
      case 'end':
        b2 |= 0xF3;
        break;
      default: // normal stitch
        b2 |= 0x03;
    }

    return [b0, b1, b2];
  }
}