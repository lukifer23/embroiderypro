import { ImageProcessor } from '../lib/embroidery/image-processor';
import { ContourTracer } from '../lib/embroidery/contour-tracer';
import { StitchGenerator } from '../lib/embroidery/stitch-generator';
import type { StitchSettings } from '../lib/embroidery/types';

self.onmessage = async (e: MessageEvent) => {
  try {
    const { imageData, settings } = e.data;
    
    // Report progress
    self.postMessage({ type: 'progress', stage: 'processing', progress: 0 });

    // Process image
    const processedImage = await ImageProcessor.process(imageData, {
      edgeThreshold: settings.edgeThreshold
    });
    self.postMessage({ type: 'progress', stage: 'processing', progress: 33 });

    // Trace contours
    const contours = await ContourTracer.trace(
      processedImage.edges,
      processedImage.width,
      processedImage.height,
      {
        minContourLength: 10,
        simplifyTolerance: 1
      }
    );
    self.postMessage({ type: 'progress', stage: 'tracing', progress: 66 });

    if (!contours.length) {
      throw new Error('No contours found in image');
    }

    // Generate stitches
    const stitches = await StitchGenerator.generateStitches(contours, {
      ...settings,
      targetWidth: settings.width,
      targetHeight: settings.height,
      density: Math.max(1, Math.min(settings.density, 5))
    });
    self.postMessage({ type: 'progress', stage: 'generating', progress: 100 });

    // Return the complete pattern
    self.postMessage({
      type: 'complete',
      pattern: {
        stitches,
        colors: ['#000000'],
        dimensions: {
          width: settings.width,
          height: settings.height
        },
        metadata: {
          name: 'Converted Pattern',
          date: new Date().toISOString(),
          format: 'internal'
        }
      }
    });
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};