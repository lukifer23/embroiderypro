import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { FormatConverter } from '../lib/embroidery/formats/converter';
import type { StitchPattern } from '../lib/embroidery/types';

interface ConversionResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pattern: StitchPattern | null;
  onUpdateSettings: () => void;
  conversionError?: Error | null;
}

export default function ConversionResultsDialog({
  open,
  onOpenChange,
  pattern,
  onUpdateSettings,
  conversionError
}: ConversionResultsDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState('dst');
  const [isExporting, setIsExporting] = useState(false);
  const [fileName, setFileName] = useState('embroidery');
  const [exportError, setExportError] = useState<Error | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pattern || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = 600;
    const displayHeight = 400;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Calculate scale and offset to center pattern
    const padding = 40;
    const scaleX = (displayWidth - padding * 2) / pattern.dimensions.width;
    const scaleY = (displayHeight - padding * 2) / pattern.dimensions.height;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (displayWidth - pattern.dimensions.width * scale) / 2;
    const offsetY = (displayHeight - pattern.dimensions.height * scale) / 2;

    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    const gridSize = 10 * scale;

    for (let x = offsetX; x < displayWidth - offsetX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, displayHeight - padding);
      ctx.stroke();
    }

    for (let y = offsetY; y < displayHeight - offsetY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(displayWidth - padding, y);
      ctx.stroke();
    }

    // Draw stitches
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let lastPoint: { x: number; y: number } | null = null;

    pattern.stitches.forEach((stitch) => {
      const x = stitch.x * scale + offsetX;
      const y = stitch.y * scale + offsetY;

      if (lastPoint && stitch.type === 'normal') {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Draw stitch point
      ctx.fillStyle = stitch.color;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();

      lastPoint = { x, y };
    });

    // Draw start and end points
    if (pattern.stitches.length > 0) {
      // Start point (green)
      const start = pattern.stitches[0];
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(
        start.x * scale + offsetX,
        start.y * scale + offsetY,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // End point (red)
      const end = pattern.stitches[pattern.stitches.length - 1];
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(
        end.x * scale + offsetX,
        end.y * scale + offsetY,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

  }, [pattern]);

  const handleExport = async () => {
    if (!pattern) return;

    try {
      setIsExporting(true);
      setExportError(null);

      const formatData = await FormatConverter.convertToFormat(pattern, selectedFormat as any);
      
      const blob = new Blob([formatData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error : new Error('Export failed'));
    } finally {
      setIsExporting(false);
    }
  };

  const estimatedMinutes = Math.ceil((pattern?.stitches.length || 0) / 800);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-figma-surface p-6 rounded-lg shadow-xl w-[800px]">
          <Dialog.Title className="text-xl font-medium text-figma-text mb-4">
            Conversion Results
          </Dialog.Title>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-figma-text mb-2">Pattern Preview</h3>
              <canvas
                ref={canvasRef}
                className="border border-figma-border rounded bg-white"
              />
              <p className="mt-1 text-xs text-figma-text-secondary">
                Green dot: Start point • Red dot: End point
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-figma-text mb-2">Pattern Details</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-figma-text-secondary">Stitch Count:</dt>
                    <dd className="text-figma-text">{pattern?.stitches.length.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-figma-text-secondary">Colors Used:</dt>
                    <dd className="text-figma-text">{pattern?.colors.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-figma-text-secondary">Size:</dt>
                    <dd className="text-figma-text">
                      {pattern?.dimensions.width.toFixed(1)} × {pattern?.dimensions.height.toFixed(1)} mm
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-figma-text-secondary">Estimated Time:</dt>
                    <dd className="text-figma-text">
                      {estimatedMinutes} minutes
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-medium text-figma-text mb-2">Export Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-figma-text-secondary mb-1">
                      File Name
                    </label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full bg-figma-bg border border-figma-border rounded px-2 py-1.5 text-sm text-figma-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-figma-text-secondary mb-1">
                      Format
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full bg-figma-bg border border-figma-border rounded px-2 py-1.5 text-sm text-figma-text"
                    >
                      <option value="dst">Tajima DST</option>
                      <option value="pes">Brother PES</option>
                      <option value="jef">Janome JEF</option>
                      <option value="exp">Melco EXP</option>
                      <option value="vp3">Pfaff VP3</option>
                      <option value="hus">Husqvarna Viking HUS</option>
                      <option value="pat">Gammill Quilting PAT</option>
                      <option value="qcc">Quilter's Creative Touch QCC</option>
                    </select>
                  </div>

                  {(conversionError || exportError) && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                      <p className="text-xs text-red-400">
                        {conversionError?.message || exportError?.message}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={onUpdateSettings}
                      className="px-4 py-2 text-sm text-figma-text-secondary hover:text-figma-text bg-figma-hover rounded"
                    >
                      Update Settings
                    </button>
                    <button
                      onClick={handleExport}
                      disabled={isExporting || !pattern}
                      className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? 'Exporting...' : 'Export Pattern'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}