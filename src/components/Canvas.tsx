import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useDesign } from '../contexts/DesignContext';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    selectedTool,
    currentColor,
    showGrid,
    gridSize,
    fabricCanvas,
    setFabricCanvas,
    setSelectedObject,
    sidebarExpanded
  } = useDesign();

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true
    });

    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      canvas.setWidth(container.clientWidth);
      canvas.setHeight(container.clientHeight);
      canvas.renderAll();
    };

    setFabricCanvas(canvas);
    updateCanvasSize();

    window.addEventListener('resize', updateCanvasSize);

    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0]);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Handle image drops
    canvas.on('drop', (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          fabric.Image.fromURL(event.target?.result as string, (img) => {
            img.set({
              left: e.offsetX,
              top: e.offsetY,
              scaleX: 0.5,
              scaleY: 0.5
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          });
        };
        reader.readAsDataURL(file);
      }
    });

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    // Clear existing grid
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.data?.isGrid) {
        fabricCanvas.remove(obj);
      }
    });

    if (showGrid) {
      const width = fabricCanvas.width!;
      const height = fabricCanvas.height!;

      // Create vertical lines
      for (let i = 0; i <= width; i += gridSize) {
        const line = new fabric.Line([i, 0, i, height], {
          stroke: '#e5e5e5',
          selectable: false,
          evented: false,
          excludeFromExport: true,
          data: { isGrid: true }
        });
        fabricCanvas.add(line);
        line.moveTo(0); // Move to back
      }

      // Create horizontal lines
      for (let i = 0; i <= height; i += gridSize) {
        const line = new fabric.Line([0, i, width, i], {
          stroke: '#e5e5e5',
          selectable: false,
          evented: false,
          excludeFromExport: true,
          data: { isGrid: true }
        });
        fabricCanvas.add(line);
        line.moveTo(0); // Move to back
      }
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, showGrid, gridSize]);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 bg-white overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}