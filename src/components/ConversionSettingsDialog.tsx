import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Slider } from './ui/slider';

interface ConversionSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvert: (settings: ConversionSettings) => void;
  imageSize: { width: number; height: number };
}

interface ConversionSettings {
  width: number;
  height: number;
  density: number;
  edgeThreshold: number;
  fillAngle: number;
  pullCompensation: number;
  useUnderlay: boolean;
  colorMode: 'grayscale' | 'color';
}

export default function ConversionSettingsDialog({
  open,
  onOpenChange,
  onConvert,
  imageSize
}: ConversionSettingsDialogProps) {
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [density, setDensity] = useState(2.0);
  const [edgeThreshold, setEdgeThreshold] = useState(128);
  const [fillAngle, setFillAngle] = useState(45);
  const [pullCompensation, setPullCompensation] = useState(15);
  const [useUnderlay, setUseUnderlay] = useState(true);
  const [colorMode, setColorMode] = useState<'grayscale' | 'color'>('grayscale');

  // Calculate aspect ratio from original image
  const aspectRatio = imageSize.width / imageSize.height;

  // Update dimensions when dialog opens
  React.useEffect(() => {
    if (open && imageSize.width && imageSize.height) {
      const maxDimension = Math.max(imageSize.width, imageSize.height);
      const scale = 50 / maxDimension;
      setWidth(Math.round(imageSize.width * scale));
      setHeight(Math.round(imageSize.height * scale));
    }
  }, [open, imageSize]);

  const handleWidthChange = (value: number) => {
    const newWidth = Math.min(Math.max(value, 10), 200);
    setWidth(newWidth);
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (value: number) => {
    const newHeight = Math.min(Math.max(value, 10), 200);
    setHeight(newHeight);
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleConvert = () => {
    onConvert({
      width,
      height,
      density,
      edgeThreshold,
      fillAngle,
      pullCompensation,
      useUnderlay,
      colorMode
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-figma-surface p-6 rounded-lg shadow-xl w-[480px] max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold text-figma-text mb-4">
            Convert Image Settings
          </Dialog.Title>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-figma-text-secondary mb-2">
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 10)}
                  min={10}
                  max={200}
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
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 10)}
                  min={10}
                  max={200}
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
                Color Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={colorMode === 'grayscale'}
                    onChange={() => setColorMode('grayscale')}
                    className="rounded border-figma-border bg-figma-bg"
                  />
                  <span className="text-sm text-figma-text">Grayscale</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={colorMode === 'color'}
                    onChange={() => setColorMode('color')}
                    className="rounded border-figma-border bg-figma-bg"
                  />
                  <span className="text-sm text-figma-text">Color (Experimental)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-figma-text-secondary mb-2">
                Edge Detection Sensitivity
              </label>
              <Slider
                value={[edgeThreshold]}
                onValueChange={([value]) => setEdgeThreshold(value)}
                min={50}
                max={200}
                step={1}
                className="mb-1"
              />
              <div className="text-xs text-figma-text-secondary text-right">
                {edgeThreshold < 100 ? 'More Details' : edgeThreshold > 150 ? 'Less Details' : 'Balanced'}
              </div>
            </div>

            <div>
              <label className="block text-sm text-figma-text-secondary mb-2">
                Stitch Density (stitches/mm)
              </label>
              <Slider
                value={[density]}
                onValueChange={([value]) => setDensity(value)}
                min={1}
                max={5}
                step={0.1}
                className="mb-1"
              />
              <div className="text-xs text-figma-text-secondary text-right">
                {density.toFixed(1)} st/mm
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
                className="mb-1"
              />
              <div className="text-xs text-figma-text-secondary text-right">
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
                className="mb-1"
              />
              <div className="text-xs text-figma-text-secondary text-right">
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
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm text-figma-text-secondary hover:text-figma-text">
                Cancel
              </button>
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