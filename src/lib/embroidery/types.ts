export interface Point {
  x: number;
  y: number;
}

export interface StitchPoint extends Point {
  type: 'normal' | 'jump' | 'trim' | 'stop' | 'end';
  color: string;
}

export interface StitchPattern {
  stitches: StitchPoint[];
  colors: string[];
  dimensions: {
    width: number;
    height: number;
  };
  metadata: {
    name: string;
    date: string;
    format: string;
  };
}

export interface ProcessingSettings {
  width: number;
  height: number;
  density: number;
  edgeThreshold: number;
  angle: number;
  underlay: boolean;
  pullCompensation: number;
  color: string;
}

export type EmbroideryFormat = 'dst' | 'pes' | 'jef' | 'exp' | 'vp3' | 'hus' | 'pat' | 'qcc';

export class ProcessingError extends Error {
  readonly stage?: string;
  readonly details?: any;
  readonly cause?: Error;

  constructor(
    message: string,
    cause?: Error,
    options?: {
      stage?: string;
      details?: any;
    }
  ) {
    super(message);
    this.name = 'ProcessingError';
    this.stage = options?.stage;
    this.details = options?.details;
    this.cause = cause;

    // Log error details for debugging
    console.error('ProcessingError:', {
      message: this.message,
      stage: this.stage,
      details: this.details,
      cause: this.cause
    });
  }

  toString(): string {
    let result = this.message;
    if (this.stage) {
      result += ` (Stage: ${this.stage})`;
    }
    if (this.cause) {
      result += `\nCaused by: ${this.cause.message}`;
    }
    return result;
  }
}