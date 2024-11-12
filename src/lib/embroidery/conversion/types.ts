import { StitchPattern } from '../types';

export interface ConversionProgress {
  stage: string;
  percent: number;
}

export interface ConversionContext {
  imageData: ImageData;
  settings: ConversionSettings;
  bitmap?: ImageData;
  edges?: ImageData;
  contours?: Point[][];
  stitchZones?: StitchZone[];
  pattern?: StitchPattern;
  progress?: ConversionProgress;
  onProgress?: (stage: string, percent: number) => void;
}

export interface ConversionSettings {
  width: number;
  height: number;
  density: number;
  angle: number;
  underlay: boolean;
  pullCompensation: number;
  color: string;
}

export interface ConversionStep {
  execute(context: ConversionContext): Promise<ConversionContext>;
}

export interface Point {
  x: number;
  y: number;
}

export interface StitchZone {
  contour: Point[];
  type: 'fill' | 'satin' | 'running';
  angle?: number;
  density?: number;
}