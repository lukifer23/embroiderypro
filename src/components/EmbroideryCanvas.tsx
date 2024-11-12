import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useDesign } from '../contexts/DesignContext';

interface Props {
  tool: string;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export default function EmbroideryCanvas({ tool, zoom, onZoomChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const { currentColor } = useDesign();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: '#ffffff',
      width: 800,
      height: 600,
      selection: true
    });

    fabricRef.current = canvas;

    // Handle mouse wheel for zooming
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom() * 0.999 ** delta;
      newZoom = Math.min(Math.max(0.1, newZoom), 20);
      
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      
      onZoomChange(Math.round(newZoom * 100));
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update tool behavior
  useEffect(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    
    // Reset modes
    canvas.isDrawingMode = false;
    canvas.selection = true;
    
    switch (tool) {
      case 'draw':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = 2;
        canvas.freeDrawingBrush.color = currentColor;
        break;
      case 'text':
        canvas.on('mouse:down', (e) => {
          if (tool !== 'text') return;
          const pointer = canvas.getPointer(e.e);
          const text = new fabric.IText('Click to edit', {
            left: pointer.x,
            top: pointer.y,
            fill: currentColor,
            fontSize: 20,
            fontFamily: 'Arial'
          });
          canvas.add(text);
          canvas.setActiveObject(text);
        });
        break;
      case 'shape':
        canvas.on('mouse:down', (e) => {
          if (tool !== 'shape') return;
          const pointer = canvas.getPointer(e.e);
          const rect = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 100,
            height: 100,
            fill: currentColor
          });
          canvas.add(rect);
          canvas.setActiveObject(rect);
        });
        break;
      case 'hand':
        canvas.selection = false;
        canvas.on('mouse:down', (e) => {
          if (tool !== 'hand') return;
          canvas.isDragging = true;
          canvas.lastPosX = e.e.clientX;
          canvas.lastPosY = e.e.clientY;
        });
        canvas.on('mouse:move', (e) => {
          if (!canvas.isDragging) return;
          const vpt = canvas.viewportTransform;
          vpt[4] += e.e.clientX - canvas.lastPosX;
          vpt[5] += e.e.clientY - canvas.lastPosY;
          canvas.requestRenderAll();
          canvas.lastPosX = e.e.clientX;
          canvas.lastPosY = e.e.clientY;
        });
        canvas.on('mouse:up', () => {
          canvas.isDragging = false;
        });
        break;
    }
  }, [tool, currentColor]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
      <canvas ref={canvasRef} className="border border-gray-600 shadow-lg" />
      
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-gray-900 rounded-lg px-3 py-1">
        <button 
          onClick={() => onZoomChange(Math.max(zoom - 10, 10))}
          className="text-gray-400 hover:text-white"
        >
          -
        </button>
        <span className="text-sm text-gray-300">{zoom}%</span>
        <button 
          onClick={() => onZoomChange(Math.min(zoom + 10, 400))}
          className="text-gray-400 hover:text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}