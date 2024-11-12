import { useState, useEffect } from 'react';
import { useDesign } from '../contexts/DesignContext';
import { FormatConverter } from '../lib/embroidery/formats/converter';
import { ProcessingError } from '../lib/embroidery/types';
import { Slider } from './ui/slider';
import type { EmbroideryFormat } from '../lib/embroidery/types';

const EXPORT_FORMATS: { id: EmbroideryFormat; label: string; description: string }[] = [
  { id: 'dst', label: 'Tajima DST', description: 'Standard format for industrial machines' },
  { id: 'pes', label: 'Brother PES', description: 'For Brother embroidery machines' },
  { id: 'jef', label: 'Janome JEF', description: 'For Janome embroidery machines' },
  { id: 'exp', label: 'Melco EXP', description: 'For Melco embroidery machines' },
  { id: 'vp3', label: 'Pfaff VP3', description: 'For Pfaff embroidery machines' },
  { id: 'hus', label: 'Viking HUS', description: 'For Husqvarna Viking machines' },
  { id: 'pat', label: 'Gammill PAT', description: 'For Gammill quilting machines' },
  { id: 'qcc', label: 'QCC', description: 'For Quilter\'s Creative Touch' }
];

export default function RightPanel() {
  const { pattern, currentColor } = useDesign();
  const [selectedFormat, setSelectedFormat] = useState<EmbroideryFormat>('dst');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('embroidery');

  const handleExport = async () => {
    if (!pattern) {
      setExportError('No pattern available to export');
      return;
    }

    try {
      setIsExporting(true);
      setExportError(null);

      // Convert pattern to selected format
      const formatData = await FormatConverter.convertToFormat(pattern, selectedFormat);

      // Create and download file
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
      setExportError(
        error instanceof ProcessingError
          ? error.message
          : 'Failed to export pattern. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-48 bg-figma-surface border-l border-figma-border flex flex-col">
      <div className="p-2 space-y-4">
        <div>
          <h3 className="text-xs font-medium text-figma-text mb-1">Export Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-figma-text-secondary mb-1">
                File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-figma-bg border border-figma-border rounded px-2 py-1.5 text-xs text-figma-text"
              />
            </div>

            <div>
              <label className="block text-xs text-figma-text-secondary mb-1">
                Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as EmbroideryFormat)}
                className="w-full bg-figma-bg border border-figma-border rounded px-2 py-1.5 text-xs text-figma-text"
              >
                {EXPORT_FORMATS.map(format => (
                  <option key={format.id} value={format.id}>
                    {format.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-figma-text-secondary">
                {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.description}
              </p>
            </div>

            {exportError && (
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                <p className="text-xs text-red-400">{exportError}</p>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={isExporting || !pattern}
              className={`w-full px-4 py-2 rounded text-xs font-medium ${
                isExporting || !pattern
                  ? 'bg-figma-hover text-figma-text-secondary cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              {isExporting ? 'Exporting...' : 'Export Pattern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}