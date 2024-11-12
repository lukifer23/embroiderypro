import { useState } from 'react';
import { useDesign } from '@/contexts/DesignContext';
import { Slider } from '@/components/ui/slider';

export default function EmbroideryControls() {
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(4);
  const { currentColor } = useDesign();

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-figma-text mb-2">
          Stitch Speed
        </label>
        <Slider
          value={speed}
          onChange={(value) => setSpeed(value)}
          min={0.1}
          max={5}
          step={0.1}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-figma-text mb-2">
          Stitch Density
        </label>
        <Slider
          value={density}
          onChange={(value) => setDensity(value)}
          min={1}
          max={10}
          step={0.5}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-figma-text mb-2">
          Thread Color
        </label>
        <div 
          className="w-full h-8 rounded border border-figma-border"
          style={{ backgroundColor: currentColor }}
        />
      </div>
    </div>
  );
}