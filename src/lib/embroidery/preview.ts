import { fabric } from 'fabric';
import type { StitchPattern, StitchPoint } from './types';

export class StitchPreview {
  private canvas: fabric.Canvas;
  private pattern: StitchPattern;
  private currentIndex: number = 0;
  private animationFrame: number | null = null;
  private speed: number = 1;
  private lines: fabric.Line[] = [];
  private points: fabric.Circle[] = [];

  constructor(canvas: fabric.Canvas, pattern: StitchPattern) {
    this.canvas = canvas;
    this.pattern = pattern;
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  start() {
    this.clear();
    this.animate();
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  clear() {
    this.lines.forEach(line => this.canvas.remove(line));
    this.points.forEach(point => this.canvas.remove(point));
    this.lines = [];
    this.points = [];
    this.currentIndex = 0;
  }

  private animate = () => {
    const endIndex = Math.min(
      this.currentIndex + Math.ceil(this.speed * 5),
      this.pattern.stitches.length
    );

    for (let i = this.currentIndex; i < endIndex; i++) {
      this.drawStitch(i);
    }

    this.currentIndex = endIndex;
    this.canvas.renderAll();

    if (this.currentIndex < this.pattern.stitches.length) {
      this.animationFrame = requestAnimationFrame(this.animate);
    }
  };

  private drawStitch(index: number) {
    const stitch = this.pattern.stitches[index];
    const prevStitch = index > 0 ? this.pattern.stitches[index - 1] : null;

    // Draw point
    const point = new fabric.Circle({
      left: stitch.x - 1,
      top: stitch.y - 1,
      radius: 1,
      fill: stitch.color,
      selectable: false,
      evented: false
    });
    this.points.push(point);
    this.canvas.add(point);

    // Draw line from previous stitch
    if (prevStitch && stitch.type !== 'jump') {
      const line = new fabric.Line(
        [prevStitch.x, prevStitch.y, stitch.x, stitch.y],
        {
          stroke: stitch.color,
          strokeWidth: 1,
          selectable: false,
          evented: false
        }
      );
      this.lines.push(line);
      this.canvas.add(line);
    }
  }
}