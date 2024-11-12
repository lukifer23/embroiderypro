import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Slider } from './ui/slider';
import { useDesign } from '../contexts/DesignContext';
import type { ConversionSettings } from '../lib/embroidery/types';

interface ConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvert: (settings: ConversionSettings) => void;
}

export default function ConversionDialog({ open, onOpenChange, onConvert }: ConversionDialogProps) {
  // More conservative default values
  const [edgeThreshold, setEdgeThreshold] = React.useState(100);
  const [stitchDensity, setStitchDensity] = React.useState(3.0);
  const [fillAngle, setFillAngle] = React.useState(45);
  const [useUnderlay, setUseUnderlay] = React.useState(true);
  const [pullCompensation, setPullCompensation] = React.useState(15);
  const [width, setWidth] = React.useState(50); // Start with smaller default size
  const [height, setHeight] = React.useState(50);
  const [maintainAspectRatio, setMaintainAspectRatio] = React.useState(true);
  const aspectRatio = React.useRef(1);

  // Add size constraints
  const MAX_SIZE = 200; // Maximum size in mm
  const MIN_SIZE = 10; // Minimum size in mm

  const handleWidthChange = (value: number) => {
    const clampedValue = Math.min(Math.max(value, MIN_SIZE), MAX_SIZE);
    setWidth(clampedValue);
    if (maintainAspectRatio) {
      setHeight(Math.round(clampedValue / aspectRatio.current));
    }
  };

  const handleHeightChange = (value: number) => {
    const clampedValue = Math.min(Math.max(value, MIN_SIZE), MAX_SIZE);
    setHeight(clampedValue);
    if (maintainAspectRatio) {
      setWidth(Math.round(clampedValue * aspectRatio.current));
    }
  };

  const handleConvert = () => {
    // Validate settings before conversion
    if (width * height * stitchDensity * stitchDensity > 100000) {
      alert('The combination of size and density would create too many stitches. Please reduce the size or density.');
      return;
    }

    onConvert({
      edgeThreshold,
      fillDensity: stitchDensity,
      fillAngle,
      useUnderlay,
      pullCompensation,
      targetWidth: width,
      targetHeight: height
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-figma-surface p-6 rounded-lg shadow-xl w-[400px]">
          <Dialog.Title className="text-lg font-semibold text-figma-text mb-4">
            Convert Image Settings
          </Dialog.Title>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-figma-text-secondary mb-2">
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || MIN_SIZE)}
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  className="w-full bg-figma-bg border border-figma-border rounded px-2 py-1.5 text-sm text-figma-text"
                />
              </div>
              <div>
                <label className="block text-sm text-figma-text-secondary mb-2">
                  Height (mm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || MIN_SIZE)}
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  className="w-full bg-figma-bg border border-figma-border rounded px-2 py-1.5 text-sm text-figma-text"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="rounded border-figma-border bg-figma-bg"
                />
                <span className="text-sm text-figma-text">Maintain aspect ratio</span>
              </label>
            </div>

            <div>
              <label className="block text-sm text-figma-text-secondary mb-2">
                Edge Detection Threshold
              </label>
              <Slider
                value={[edgeThreshold]}
                onValueChange={([value]) => setEdgeThreshold(value)}
                min={50}
                max={150}
                step={1}
              />
              <div className="text-xs text-figma-text-secondary text-right mt-1">
                {edgeThreshold}
              </div>
            </div>

            <div>
              <label className="block text-sm text-figma-text-secondary mb-2">
                Stitch Density (stitches/mm)
              </label>
              <Slider
                value={[stitchDensity]}
                onValueChange={([value]) => setStitchDensity(value)}
                min={2}
                max={5}
                step={0.1}
              />
              <div className="text-xs text-figma-text-secondary text-right mt-1">
                {stitchDensity.toFixed(1)}
              </div>
            </div>

            <div>
              <label className="block text-sm text-figma-text-secondary mb-2">
                Fill Angle (degrees)
              </label>
              <Slider
                value={[fillAngle]}
                onValueChange={([value]) => setFillAngle(value)}
                min={0}
                max={90}
                step={15}
              />
              <div className="text-xs text-figma-text-secondary text-right mt-1">
                {fillAngle}°
              </div>
            </div>

            <div>
              <label className="block text-sm text-figma-text-secondary mb-2">
                Pull Compensation
              </label>
              <Slider
                value={[pullCompensation]}
                onValueChange={([value]) => setPullCompensation(value)}
                min={0}
                max={30}
                step={1}
              />
              <div className="text-xs text-figma-text-secondary text-right mt-1">
                {pullCompensation}%
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useUnderlay}
                  onChange={(e) => setUseUnderlay(e.target.checked)}
                  className="rounded border-figma-border bg-figma-bg"
                />
                <span className="text-sm text-figma-text">Add underlay stitches</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Dialog.Close className="px-4 py-2 text-sm text-figma-text-secondary hover:text-figma-text">
              Cancel
            </Dialog.Close>
            <button
              onClick={handleConvert}
              className="px-4 py-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Convert
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}