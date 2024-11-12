import { useState } from 'react';
import { useDesign } from '../contexts/DesignContext';
import { EmbroideryConverter } from '../lib/embroidery/converter';
import { FormatConverter } from '../lib/embroidery/formats/converter';
import { StitchSettings, EmbroideryFormat } from '../lib/embroidery/types';
import { Slider } from './ui/slider';

const EXPORT_FORMATS: { id: EmbroideryFormat; label: string }[] = [
  { id: 'dst', label: 'Tajima DST' },
  { id: 'pes', label: 'Brother PES' },
  { id: 'jef', label: 'Janome JEF' },
  { id: 'exp', label: 'Melco EXP' },
  { id: 'vp3', label: 'Pfaff VP3' },
  { id: 'hus', label: 'Husqvarna Viking HUS' },
  { id: 'pat', label: 'Gammill Quilting PAT' },
  { id: 'qcc', label: "Quilter's Creative Touch QCC" }
];

export default function ExportPanel() {
  const { fabricCanvas } = useDesign();
  const [selectedFormat, setSelectedFormat] = useState<EmbroideryFormat>('dst');
  const [isExporting, setIsExporting] = useState(false);
  const [settings, setSettings] = useState<StitchSettings>({
    density: 4,
    spacing: 0.4,
    angle: 0,
    underlay: true,
    pullCompensation: 0,
    strokeSpacing: 0.4,
    minLength: 0.1,
    maxLength: 12.1
  });

  const handleExport = async () => {
    if (!fabricCanvas) {
      alert('No canvas available');
      return;
    }

    try {
      setIsExporting(true);

      const pattern = EmbroideryConverter.convertToStitches(fabricCanvas, settings);
      const formatData = FormatConverter.convertToFormat(pattern, selectedFormat);

      const blob = new Blob([formatData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `embroidery.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Export failed: ${error.message}`);
      } else {
        alert('Export failed: Unknown error');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 bg-figma-surface rounded-lg border border-figma-border p-4 shadow-lg w-80">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-figma-text mb-2">
            Export Format
          </label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as EmbroideryFormat)}
            className="w-full bg-figma-bg border border-figma-border rounded px-2 py-1.5 text-sm text-figma-text"
          >
            {EXPORT_FORMATS.map(format => (
              <option key={format.id} value={format.id}>
                {format.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-figma-text mb-2">
            Stitch Density (stitches/mm)
          </label>
          <Slider
            value={[settings.density]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, density: value }))}
            min={1}
            max={10}
            step={0.1}
            className="mb-1"
          />
          <div className="text-xs text-figma-text-secondary text-right">
            {settings.density.toFixed(1)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-figma-text mb-2">
            Fill Angle (degrees)
          </label>
          <Slider
            value={[settings.angle]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, angle: value }))}
            min={0}
            max={360}
            step={1}
            className="mb-1"
          />
          <div className="text-xs text-figma-text-secondary text-right">
            {settings.angle}°
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-figma-text">
            <input
              type="checkbox"
              checked={settings.underlay}
              onChange={(e) => setSettings(prev => ({ ...prev, underlay: e.target.checked }))}
              className="rounded border-figma-border bg-figma-bg"
            />
            Add underlay stitches
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-figma-text mb-2">
            Pull Compensation
          </label>
          <Slider
            value={[settings.pullCompensation]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, pullCompensation: value }))}
            min={0}
            max={1}
            step={0.1}
            className="mb-1"
          />
          <div className="text-xs text-figma-text-secondary text-right">
            {(settings.pullCompensation * 100).toFixed(0)}%
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`w-full px-4 py-2 rounded text-sm font-medium ${
            isExporting
              ? 'bg-figma-hover text-figma-text-secondary cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
        >
          {isExporting ? 'Exporting...' : 'Export Design'}
        </button>
      </div>
    </div>
  );
}