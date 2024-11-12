import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import DesignTools from './DesignTools';

interface DesignCanvasProps {
  gridSize?: number;
}

export default function DesignCanvas({ gridSize = 20 }: DesignCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current || !fabricCanvasRef.current) return;
      
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      fabricCanvasRef.current.setDimensions({ width, height });
      
      // Redraw grid
      fabricCanvasRef.current.getObjects().forEach(obj => {
        if (obj.type === 'line') obj.remove();
      });

      for (let i = 0; i < width; i += gridSize) {
        fabricCanvasRef.current.add(new fabric.Line([i, 0, i, height], {
          stroke: '#f0f0f0',
          selectable: false
        }));
      }
      for (let i = 0; i < height; i += gridSize) {
        fabricCanvasRef.current.add(new fabric.Line([0, i, width, i], {
          stroke: '#f0f0f0',
          selectable: false
        }));
      }

      fabricCanvasRef.current.renderAll();
    };

    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
      });
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
    }

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [gridSize]);

  return (
    <div className="flex-1 flex">
      <DesignTools />
      <div ref={containerRef} className="flex-1 relative">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}