import { useState, useRef } from 'react';
import { useDesign } from '../contexts/DesignContext';
import { fabric } from 'fabric';

export default function ConvertPanel() {
  const { fabricCanvas, addLayer } = useDesign();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabricCanvas || !event.target.files?.length) return;

    const file = event.target.files[0];
    setIsConverting(true);
    setProgress(0);

    try {
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress((e.loaded / e.total) * 100);
        }
      };

      reader.onload = async (e) => {
        if (!e.target?.result) return;

        // Create fabric image object
        fabric.Image.fromURL(e.target.result.toString(), (img) => {
          const maxWidth = fabricCanvas.width! * 0.8;
          const maxHeight = fabricCanvas.height! * 0.8;
          const scale = Math.min(
            maxWidth / img.width!,
            maxHeight / img.height!
          );

          img.scale(scale);
          img.set({
            left: (fabricCanvas.width! - img.width! * scale) / 2,
            top: (fabricCanvas.height! - img.height! * scale) / 2
          });

          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();

          addLayer({
            name: file.name,
            type: 'image',
            visible: true,
            locked: false,
            data: img
          });

          setIsConverting(false);
          setProgress(100);
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      alert('Failed to convert image');
      setIsConverting(false);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 bg-figma-surface rounded-lg border border-figma-border p-4 shadow-lg w-80">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-figma-text mb-2">
            Import Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isConverting}
            className={`w-full px-4 py-2 rounded text-sm font-medium ${
              isConverting
                ? 'bg-figma-hover text-figma-text-secondary cursor-not-allowed'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            {isConverting ? 'Converting...' : 'Select Image'}
          </button>
        </div>

        {isConverting && (
          <div>
            <div className="h-1 bg-figma-hover rounded overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-figma-text-secondary text-center mt-1">
              {progress.toFixed(0)}%
            </p>
          </div>
        )}

        <p className="text-xs text-figma-text-secondary">
          Supported formats: PNG, JPEG, GIF, SVG
        </p>
      </div>
    </div>
  );
}