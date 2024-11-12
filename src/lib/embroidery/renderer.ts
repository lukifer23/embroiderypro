import { fabric } from 'fabric';
import { StitchPattern, StitchPoint } from './types';

export class StitchRenderer {
  private canvas: fabric.Canvas | null = null;
  private pattern: StitchPattern | null = null;
  private animationFrame: number | null = null;
  private currentStitch = 0;
  private lines: fabric.Line[] = [];
  private scale = 1;
  private offset = { x: 0, y: 0 };
  private speed = 1;
  private batchSize = 100;
  private isDisposed = false;

  initialize(canvas: HTMLCanvasElement, width: number, height: number) {
    if (this.canvas) {
      this.dispose();
    }

    this.canvas = new fabric.Canvas(canvas, {
      width,
      height,
      backgroundColor: '#000000',
      selection: false,
      renderOnAddRemove: false,
      skipTargetFind: true,
      stateful: false
    });
  }

  loadPattern(pattern: StitchPattern, zoomLevel: number = 100) {
    if (!this.canvas || this.isDisposed) return;

    this.pattern = pattern;
    this.currentStitch = 0;
    this.clear();

    // Calculate scale to fit pattern in canvas
    const canvasRatio = this.canvas.width! / this.canvas.height!;
    const patternRatio = pattern.dimensions.width / pattern.dimensions.height;

    this.scale = (canvasRatio > patternRatio
      ? (this.canvas.height! / pattern.dimensions.height)
      : (this.canvas.width! / pattern.dimensions.width)
    ) * 0.8 * (zoomLevel / 100);

    // Center pattern
    this.offset = {
      x: (this.canvas.width! - pattern.dimensions.width * this.scale) / 2,
      y: (this.canvas.height! - pattern.dimensions.height * this.scale) / 2
    };

    // Initial render
    this.render();
  }

  setSpeed(speed: number) {
    this.speed = speed;
    this.batchSize = Math.ceil(speed * 50); // Reduced batch size for smoother animation
  }

  setZoom(zoomLevel: number) {
    if (!this.pattern || !this.canvas || this.isDisposed) return;
    
    // Store current animation state
    const wasAnimating = this.animationFrame !== null;
    this.stopAnimation();

    // Update scale and offset
    const canvasRatio = this.canvas.width! / this.canvas.height!;
    const patternRatio = this.pattern.dimensions.width / this.pattern.dimensions.height;

    this.scale = (canvasRatio > patternRatio
      ? (this.canvas.height! / this.pattern.dimensions.height)
      : (this.canvas.width! / this.pattern.dimensions.width)
    ) * 0.8 * (zoomLevel / 100);

    this.offset = {
      x: (this.canvas.width! - this.pattern.dimensions.width * this.scale) / 2,
      y: (this.canvas.height! - this.pattern.dimensions.height * this.scale) / 2
    };

    // Re-render
    this.clear();
    this.render();

    // Resume animation if it was running
    if (wasAnimating) {
      this.startAnimation();
    }
  }

  clear() {
    if (!this.canvas || this.isDisposed) return;
    
    this.lines.forEach(line => {
      try {
        this.canvas?.remove(line);
      } catch (e) {
        // Ignore removal errors
      }
    });
    this.lines = [];
    this.canvas.clear();
    this.canvas.backgroundColor = '#000000';
    this.canvas.renderAll();
  }

  render() {
    if (!this.pattern || !this.canvas || this.isDisposed) return;

    this.clear();
    let lastStitch = this.pattern.stitches[0];
    let batch: fabric.Line[] = [];

    const processStitches = (startIdx: number) => {
      if (this.isDisposed) return;

      const endIdx = Math.min(startIdx + 500, this.pattern!.stitches.length);

      for (let i = startIdx; i < endIdx; i++) {
        const stitch = this.pattern!.stitches[i];
        if (stitch.type === 'normal' && lastStitch) {
          batch.push(new fabric.Line(
            [
              lastStitch.x * this.scale + this.offset.x,
              lastStitch.y * this.scale + this.offset.y,
              stitch.x * this.scale + this.offset.x,
              stitch.y * this.scale + this.offset.y
            ],
            {
              stroke: stitch.color,
              strokeWidth: Math.max(1, this.scale / 3),
              selectable: false,
              evented: false
            }
          ));
        }
        lastStitch = stitch;
      }

      if (batch.length > 0) {
        try {
          this.canvas?.add(...batch);
          this.lines.push(...batch);
          batch = [];
          this.canvas?.renderAll();
        } catch (e) {
          console.error('Render error:', e);
        }
      }

      if (endIdx < this.pattern!.stitches.length) {
        requestAnimationFrame(() => processStitches(endIdx));
      }
    };

    processStitches(1);
  }

  startAnimation() {
    if (!this.pattern || !this.canvas || this.isDisposed) return;
    
    this.stopAnimation();
    this.clear();
    this.currentStitch = 0;
    this.animate();
  }

  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  dispose() {
    this.isDisposed = true;
    this.stopAnimation();
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
    this.lines = [];
    this.pattern = null;
  }

  private animate = () => {
    if (!this.pattern || !this.canvas || this.isDisposed) return;

    const endIdx = Math.min(
      this.currentStitch + this.batchSize,
      this.pattern.stitches.length - 1
    );

    const batch: fabric.Line[] = [];
    for (let i = this.currentStitch; i < endIdx; i++) {
      const stitch = this.pattern.stitches[i];
      const nextStitch = this.pattern.stitches[i + 1];

      if (stitch.type === 'normal' && nextStitch) {
        batch.push(new fabric.Line(
          [
            stitch.x * this.scale + this.offset.x,
            stitch.y * this.scale + this.offset.y,
            nextStitch.x * this.scale + this.offset.x,
            nextStitch.y * this.scale + this.offset.y
          ],
          {
            stroke: stitch.color,
            strokeWidth: Math.max(1, this.scale / 3),
            selectable: false,
            evented: false
          }
        ));
      }
    }

    if (batch.length > 0) {
      try {
        this.canvas.add(...batch);
        this.lines.push(...batch);
        this.canvas.renderAll();
      } catch (e) {
        console.error('Animation error:', e);
        this.stopAnimation();
        return;
      }
    }

    this.currentStitch = endIdx;

    if (this.currentStitch < this.pattern.stitches.length - 1) {
      this.animationFrame = requestAnimationFrame(this.animate);
    }
  };
}