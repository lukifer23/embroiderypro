import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronDown } from 'lucide-react';
import { useDesign } from '../contexts/DesignContext';
import { ConversionManager } from '../lib/embroidery/conversion/ConversionManager';
import { ProcessingError } from '../lib/embroidery/types';
import ConversionSettingsDialog from './ConversionSettingsDialog';
import ConversionResultsDialog from './ConversionResultsDialog';

export default function TopBar() {
  const [isConverting, setIsConverting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [convertedPattern, setConvertedPattern] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const conversionManager = useRef(new ConversionManager());

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    try {
      const file = event.target.files[0];
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target?.result) {
          throw new Error('Failed to read image file');
        }

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          imageDataRef.current = imageData;
          setShowSettings(true);
          setError(null);
        };

        img.onerror = () => {
          setError('Failed to load image');
        };

        img.src = e.target.result.toString();
      };

      reader.onerror = () => {
        setError('Failed to read file');
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('File selection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process image');
    }
  };

  const handleConvert = async (settings: any) => {
    try {
      if (!imageDataRef.current) {
        throw new Error('No image selected');
      }

      setIsConverting(true);
      setError(null);
      setProgress(0);
      setProgressStage('preprocessing');
      setShowSettings(false);

      const pattern = await conversionManager.current.convertImage({
        imageData: imageDataRef.current,
        settings: {
          width: settings.width,
          height: settings.height,
          density: settings.density,
          angle: settings.angle,
          underlay: settings.underlay,
          pullCompensation: settings.pullCompensation,
          color: settings.color || '#000000'
        }
      });

      setConvertedPattern(pattern);
      setShowResults(true);
    } catch (error) {
      console.error('Conversion error:', error);
      setError(
        error instanceof ProcessingError 
          ? error.message 
          : 'Failed to convert image. Please try different settings or a different image.'
      );
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <div className="h-8 bg-figma-surface border-b border-figma-border flex items-center px-2 select-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {['File', 'Edit', 'View'].map((item) => (
              <button
                key={item}
                className="px-2 py-1 text-sm text-figma-text-secondary hover:bg-figma-hover hover:text-figma-text rounded-sm transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-figma-border" />
          <div className="flex items-center text-sm">
            <span className="text-figma-text">Design Studio</span>
            <span className="mx-1 text-[#666666]">/</span>
            <span className="text-figma-text-secondary">Untitled</span>
            <ChevronDown className="w-4 h-4 ml-1 text-figma-text-secondary" />
          </div>
          <div className="h-4 w-px bg-figma-border" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
          >
            Convert Image
          </button>
        </div>
      </div>

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}

      <ConversionSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        onConvert={handleConvert}
        imageSize={imageDataRef.current ? {
          width: imageDataRef.current.width,
          height: imageDataRef.current.height
        } : { width: 0, height: 0 }}
      />

      <ConversionResultsDialog
        open={showResults}
        onOpenChange={setShowResults}
        pattern={convertedPattern}
        onUpdateSettings={() => {
          setShowResults(false);
          setShowSettings(true);
        }}
      />

      {isConverting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-figma-surface p-6 rounded-lg shadow-xl w-[320px]">
            <div className="text-sm text-figma-text-secondary mb-2">
              {progressStage === 'preprocessing' && 'Analyzing image...'}
              {progressStage === 'processing' && 'Processing image...'}
              {progressStage === 'tracing' && 'Tracing contours...'}
              {progressStage === 'generating' && 'Generating stitches...'}
            </div>
            <div className="h-1 bg-figma-hover rounded overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}