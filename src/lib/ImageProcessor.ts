export class ImageProcessor {
  async processImage(
    image: HTMLImageElement,
    options: {
      width: number;
      height: number;
      density: number;
      threshold: number;
    }
  ) {
    // Create canvas for processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = options.width;
    canvas.height = options.height;

    // Draw and get image data
    ctx.drawImage(image, 0, 0, options.width, options.height);
    const imageData = ctx.getImageData(0, 0, options.width, options.height);

    // Convert to grayscale
    const grayscale = this.toGrayscale(imageData);

    // Detect edges
    const edges = this.detectEdges(grayscale, options.width, options.height, options.threshold);

    // Generate stitches
    const stitches = this.generateStitches(edges, options.width, options.height, options.density);

    return {
      stitches,
      width: options.width,
      height: options.height,
      colors: ['#000000']
    };
  }

  private toGrayscale(imageData: ImageData): Uint8Array {
    const gray = new Uint8Array(imageData.width * imageData.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      gray[i / 4] = Math.round(
        imageData.data[i] * 0.299 +
        imageData.data[i + 1] * 0.587 +
        imageData.data[i + 2] * 0.114
      );
    }
    return gray;
  }

  private detectEdges(
    grayscale: Uint8Array,
    width: number,
    height: number,
    threshold: number
  ): Uint8Array {
    const edges = new Uint8Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Sobel operator
        const gx = 
          -grayscale[idx - width - 1] +
          grayscale[idx - width + 1] +
          -2 * grayscale[idx - 1] +
          2 * grayscale[idx + 1] +
          -grayscale[idx + width - 1] +
          grayscale[idx + width + 1];
          
        const gy = 
          -grayscale[idx - width - 1] +
          -2 * grayscale[idx - width] +
          -grayscale[idx - width + 1] +
          grayscale[idx + width - 1] +
          2 * grayscale[idx + width] +
          grayscale[idx + width + 1];
          
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[idx] = magnitude > threshold ? 255 : 0;
      }
    }
    
    return edges;
  }

  private generateStitches(
    edges: Uint8Array,
    width: number,
    height: number,
    density: number
  ) {
    const stitches = [];
    const spacing = Math.round(1 / density);
    
    // Follow edges to create outline stitches
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        const idx = y * width + x;
        if (edges[idx] > 0) {
          stitches.push({
            x,
            y,
            type: 'normal',
            color: '#000000'
          });
        }
      }
    }

    // Sort stitches to minimize jumps
    return this.optimizeStitchOrder(stitches);
  }

  private optimizeStitchOrder(stitches: any[]) {
    if (stitches.length < 2) return stitches;

    const optimized = [stitches[0]];
    const remaining = new Set(stitches.slice(1));
    let current = stitches[0];

    while (remaining.size > 0) {
      let nearest = null;
      let minDist = Infinity;

      for (const stitch of remaining) {
        const dist = this.distance(current, stitch);
        if (dist < minDist) {
          minDist = dist;
          nearest = stitch;
        }
      }

      if (!nearest) break;

      optimized.push(nearest);
      remaining.delete(nearest);
      current = nearest;
    }

    return optimized;
  }

  private distance(a: any, b: any) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  async exportPattern(pattern: any, format: string) {
    // Simple DST format implementation
    const header = new ArrayBuffer(512);
    const headerView = new DataView(header);
    
    // Write basic DST header
    const encoder = new TextEncoder();
    const label = encoder.encode('LA:' + (pattern.name || 'Converted Pattern'));
    headerView.setInt8(0, label.length);
    new Uint8Array(header).set(label, 1);

    // Generate stitch data
    const stitches = new ArrayBuffer(pattern.stitches.length * 3);
    const stitchView = new DataView(stitches);
    let offset = 0;

    pattern.stitches.forEach((stitch: any, i: number) => {
      if (i === 0) return;

      const prev = pattern.stitches[i - 1];
      const dx = Math.round(stitch.x - prev.x);
      const dy = Math.round(stitch.y - prev.y);

      // Simple stitch encoding
      stitchView.setInt8(offset++, dx & 0x7F);
      stitchView.setInt8(offset++, dy & 0x7F);
      stitchView.setInt8(offset++, 0x03);
    });

    // Combine header and stitches
    const result = new Uint8Array(header.byteLength + stitches.byteLength);
    result.set(new Uint8Array(header), 0);
    result.set(new Uint8Array(stitches), header.byteLength);

    return result.buffer;
  }
}