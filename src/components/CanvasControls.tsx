import React from 'react';
import { useDesign } from '../contexts/DesignContext';

export default function CanvasControls() {
  const { 
    canvasSize, 
    setCanvasSize,
    gridSize,
    setGridSize,
    showGrid,
    setShowGrid
  } = useDesign();

  // Convert between pixels and millimeters
  const pxToMm = (px: number) => (px * 0.2645833333).toFixed(1);
  const mmToPx = (mm: number) => Math.round(mm / 0.2645833333);

  const handleSizeChange = (dimension: 'width' | 'height', mm: string) => {
    const value = parseFloat(mm);
    if (isNaN(value)) return;

    const px = mmToPx(value);
    setCanvasSize(prev => ({ ...prev, [dimension]: px }));
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-figma-surface rounded-lg p-2 shadow-lg border border-figma-border">
      <div className="flex items-center gap-2">
        <label className="text-xs text-figma-text-secondary">Canvas (mm):</label>
        <input
          type="number"
          value={pxToMm(canvasSize.width)}
          onChange={(e) => handleSizeChange('width', e.target.value)}
          className="w-16 bg-figma-bg border border-figma-border rounded px-2 py-1 text-xs text-figma-text"
          step="0.1"
        />
        <span className="text-figma-text-secondary">×</span>
        <input
          type="number"
          value={pxToMm(canvasSize.height)}
          onChange={(e) => handleSizeChange('height', e.target.value)}
          className="w-16 bg-figma-bg border border-figma-border rounded px-2 py-1 text-xs text-figma-text"
          step="0.1"
        />
      </div>

      <div className="h-4 w-px bg-figma-border" />

      <div className="flex items-center gap-2">
        <label className="text-xs text-figma-text-secondary">Grid (mm):</label>
        <input
          type="number"
          value={pxToMm(gridSize)}
          onChange={(e) => setGridSize(mmToPx(parseFloat(e.target.value) || 5))}
          className="w-16 bg-figma-bg border border-figma-border rounded px-2 py-1 text-xs text-figma-text"
          step="0.1"
        />
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-2 py-1 text-xs rounded ${
            showGrid 
              ? 'bg-figma-hover text-figma-text' 
              : 'text-figma-text-secondary hover:bg-figma-hover hover:text-figma-text'
          }`}
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
      </div>
    </div>
  );
}