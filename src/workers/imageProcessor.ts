import { EmbroideryConverter } from '../lib/embroidery/converter';
import type { StitchSettings } from '../lib/embroidery/types';

self.onmessage = async (e: MessageEvent) => {
  try {
    const { imageData, settings } = e.data as {
      imageData: ImageData;
      settings: StitchSettings;
    };

    // Convert target dimensions from mm to pixels (1mm = 10 pixels)
    const scale = 10;
    const targetWidth = settings.targetWidth ? settings.targetWidth * scale : imageData.width;
    const targetHeight = settings.targetHeight ? settings.targetHeight * scale : imageData.height;

    const pattern = await EmbroideryConverter.convertImageToStitches(imageData, {
      targetWidth,
      targetHeight,
      edgeThreshold: settings.edgeThreshold || 128,
      density: settings.fillDensity || 4,
      spacing: 0.3, // 0.3mm between stitches
      angle: settings.fillAngle || 0,
      underlay: settings.useUnderlay || false,
      pullCompensation: (settings.pullCompensation || 0) / 100,
      maxStitchLength: 12.1 // Maximum stitch length in mm
    });

    self.postMessage(pattern);
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({ 
      error: error instanceof Error ? error.message : 'Unknown error during conversion'
    });
  }
};